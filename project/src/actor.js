const PIPELINE_CACHE = {};

/*
Caches pipelines by name.
`key` - name of the current pipeline
`construction_func` - function to construct the given pipeline if not found in cache
*/
function cached_pipeline(key, construction_func) {
	if(!(key in PIPELINE_CACHE)) {
		try {
			PIPELINE_CACHE[key] = construction_func();			
		} catch (e) {
			console.error('Error in construction of pipeline', key, e);
		}
	}
	return PIPELINE_CACHE[key];
}

class Actor {
	init_pipeline(regl, resources) {
		throw Error('Not implemented: Actor.init_pipeline');
	}

	constructor({}, regl, resources) {
		this.mat_model_to_world = mat4.create();
		this.mat_mvp = mat4.create();

		this.init_pipeline(regl, resources);
	}

	calculate_model_matrix(sim_time) {
		throw Error('Not implemented: Actor.calculate_model_matrix');
	}

	draw({mat_projection, mat_view, light_position_cam, sim_time}) {
		throw Error('Not implemented: Actor.draw');
	}
}

class TileActor extends Actor {
	init_pipeline(regl, resources) {
		// create pipeline only if it doesn't exist
		// if pipeline not found under that key, the arrow-function is used to create it
		this.pipeline = cached_pipeline('unshaded', () => regl({
			attributes: {
				position: resources.mesh_cube.vertex_positions,
				tex_coord: resources.mesh_cube.vertex_tex_coords,
			},
			// Faces, as triplets of vertex indices
			elements: resources.mesh_cube.faces,
	
			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				texture_base_color: regl.prop('tex_base_color'),
			},	
	
			vert: resources.shader_unshaded_vert,
			frag: resources.shader_unshaded_frag,
		}));
	}

	constructor({name, size, tX, tY, ...rest}, regl, resources) {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter

		super(rest, regl, resources);

		this.name = name;
		this.size = size;
		this.tX = tX;
		this.tY = tY
	}

	calculate_model_matrix({sim_time}) {
		const T = mat4.fromTranslation(mat4.create(), [this.tX, this.tY, this.size]);

		let angle_axis = sim_time;
		let rot_axis = mat4.fromZRotation(mat4.create(), angle_axis);
		
		const scale = mat4.fromScaling(mat4.create(), [this.size, this.size, this.size]);
		
		// Store the combined transform in actor.mat_model_to_world
		mat4_matmul_many(this.mat_model_to_world, T, scale);

	}

	draw({mat_projection, mat_view}) {
		mat4_matmul_many(this.mat_mvp, mat_projection, mat_view, this.mat_model_to_world);

		this.pipeline({
			mat_mvp: this.mat_mvp,
			tex_base_color: this.texture,
		});
	}
}


class PhongActor extends TileActor {
	init_pipeline(regl, resources) {
		// create pipeline only if it doesn't exist
		// if pipeline not found under that key, the arrow-function is used to create it
		const mesh = resources.mesh_cube
		this.pipeline = cached_pipeline('phong', () => regl({
			// Vertex attributes
			attributes: {
				position: mesh.vertex_positions,
				tex_coord: mesh.vertex_tex_coords,
				normal: mesh.vertex_normals,
			},
			// Faces, as triplets of vertex indices
			elements: mesh.faces,
	
			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				mat_model_view: regl.prop('mat_model_view'),
				mat_normals: regl.prop('mat_normals'),
	
				light_position: regl.prop('light_position'),
				texture_base_color: regl.prop('tex_base_color'),

				shininess: regl.prop('shininess'),
				ambient :regl.prop('ambient'),
				light_color :regl.prop('light_color'),
				sim_time: regl.prop('sim_time'),
				scale: regl.prop('scale'),

				material: regl.prop('material'),
			},	
	
			vert: resources.shader_phong_vert,
			frag: resources.shader_phong_frag,
		}));	
	}

	constructor(cfg, regl, resources) {
		super(cfg, regl, resources);

		this.mat_model_view = mat4.create();
		this.mat_normals = mat3.create();

		this.shininess = cfg.shininess;
		this.ambient = cfg.ambient;
		this.material = cfg.material;
		this.scale = cfg.scale;
	}

	draw({mat_projection, mat_view, light_position_cam, sim_time}) {

		mat4_matmul_many(this.mat_model_view, mat_view, this.mat_model_to_world);
		mat4_matmul_many(this.mat_mvp, mat_projection, this.mat_model_view);

		mat3.fromMat4(this.mat_normals, this.mat_model_view);
		mat3.transpose(this.mat_normals, this.mat_normals);
		mat3.invert(this.mat_normals, this.mat_normals);

		this.pipeline({
			mat_mvp: this.mat_mvp,
			mat_model_view: this.mat_model_view,
			mat_normals: this.mat_normals,

			tex_base_color: this.texture,

			light_position: light_position_cam,

			shininess: this.shininess,
			ambient : this.ambient,
			light_color : this.light_color,
			material: this.material,
			scale: this.scale,

			sim_time: sim_time, // this uniform will be used for earth shader
		});
	}
}
