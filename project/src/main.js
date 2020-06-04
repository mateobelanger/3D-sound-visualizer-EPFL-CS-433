"use strict";
const {mat4, mat3, vec4, vec3, vec2} = glMatrix;

const deg_to_rad = Math.PI / 180;

var regl_global_handle = null; // store the regl context here in case we want to touch it in devconsole

async function main() {
	const regl = createREGL({
		profile: true, // if we want to measure the size of buffers/textures in memory
	});
	regl_global_handle = regl;
	const canvas_elem = document.getElementsByTagName('canvas')[0];
	
	const debug_text = document.getElementById('debug-text');
	debug_text.textContent = "Please wait for the audio file to be loaded";

	// Start downloads in parallel
	const resources = {
		'shader_unshaded_vert': load_text('./src/shaders/unshaded.vert'),
		'shader_unshaded_frag': load_text('./src/shaders/unshaded.frag'),
		'shader_phong_vert': load_text('./src/shaders/phong.vert'),
		'shader_phong_frag': load_text('./src/shaders/phong.frag'),
		'mesh_cube': load_mesh_obj(regl, './cube.obj'),
	}
	
	// Wait for all downloads to complete
	for (const key in resources) {
		if (resources.hasOwnProperty(key)) {
			resources[key] = await resources[key]
		}
	}

	/*---------------------------------------------------------------
		GPU pipeline
	---------------------------------------------------------------*/
	
	const mat_projection = mat4.create();

	/*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
	const mat_world_to_cam = mat4.create();
	const cam_distance_base = 30;
	
	let cam_angle_z = Math.PI * 0.5; // in radians!
	let cam_angle_y = -Math.PI / 6; // in radians!
	let cam_distance_factor = 0.9;
	let T = 0;

	
	let r = cam_distance_base * 0.9;
	const p0 = [-r* Math.cos(-cam_angle_y) * Math.cos(cam_angle_z), r * Math.cos(-cam_angle_y) * Math.sin(cam_angle_z), r * Math.sin(-cam_angle_y)];
	r = cam_distance_base * 0.85;
	const p1 = [-r* Math.cos(-cam_angle_y) * Math.cos(cam_angle_z - 1.0), r * Math.cos(-cam_angle_y) * Math.sin(cam_angle_z + 1.0), r * Math.sin(-cam_angle_y)];
	r = cam_distance_base * 0.80;
	const p2 = [-r* Math.cos(-cam_angle_y) * Math.cos(cam_angle_z - 2.0), r * Math.cos(-cam_angle_y) * Math.sin(cam_angle_z + 2.0), r * Math.sin(-cam_angle_y)];
	r = cam_distance_base * 1.25;
	const p3 = [-r* Math.cos(-cam_angle_y) * Math.cos(cam_angle_z - 3.0), r * Math.cos(-cam_angle_y) * Math.sin(cam_angle_z + 3.0), r * Math.sin(-cam_angle_y)];
	r = cam_distance_base * 0.9;
	const p4 = [-r* Math.cos(-cam_angle_y) * Math.cos(cam_angle_z - 4.0), r * Math.cos(-cam_angle_y) * Math.sin(cam_angle_z + 4.0), r * Math.sin(-cam_angle_y)];
	cam_angle_z -= 4.0;
	
	function bezier_curve(t) {
		const x = Math.pow((1-t), 4)*p0[0] + 4*Math.pow((1-t), 3)*t*p1[0] + 6*Math.pow((1-t), 2)*Math.pow(t, 2)*p2[0] + 4*Math.pow(t, 3)*(1-t)*p3[0] + Math.pow(t, 4)*p4[0];
		const y = Math.pow((1-t), 4)*p0[1] + 4*Math.pow((1-t), 3)*t*p1[1] + 6*Math.pow((1-t), 2)*Math.pow(t, 2)*p2[1] + 4*Math.pow(t, 3)*(1-t)*p3[1] + Math.pow(t, 4)*p4[1];
		const z = Math.pow((1-t), 4)*p0[2] + 4*Math.pow((1-t), 3)*t*p1[2] + 6*Math.pow((1-t), 2)*Math.pow(t, 2)*p2[2] + 4*Math.pow(t, 3)*(1-t)*p3[2] + Math.pow(t, 4)*p4[2];
		return [x, y, z];
	}

	function update_cam_transform(p = undefined) {
		let r = cam_distance_base * cam_distance_factor;
		// Example camera matrix, looking along forward-X, edit this
		if (!p) {
			p = [-r* Math.cos(-cam_angle_y) * Math.cos(cam_angle_z), r * Math.cos(-cam_angle_y) * Math.sin(cam_angle_z), r * Math.sin(-cam_angle_y)];
		}
		const look_at = mat4.lookAt(mat4.create(), 
			p, // camera position in world coord
			[0, 0, 0], // view target point
			[0, 0, 1], // up vector
		);
		// Store the combined transform in mat_world_to_cam
		// mat_world_to_cam = A * B * ...
		mat4_matmul_many(mat_world_to_cam, look_at);
	}

	update_cam_transform();

	// Rotate camera position by dragging with the mouse
	canvas_elem.addEventListener('mousemove', (event) => {
		// if left or middle button is pressed
		if (event.buttons & 1 || event.buttons & 4) {
			cam_angle_z += event.movementX*0.005;
			cam_angle_y = Math.min(1.57, Math.max(cam_angle_y + -event.movementY*0.005, -1.57));

			console.log(cam_angle_y);
			update_cam_transform();
		}
	});

	canvas_elem.addEventListener('wheel', (event) => {
		// scroll wheel to zoom in or out
		const factor_mul_base = 1.08;
		const factor_mul = (event.deltaY > 0) ? factor_mul_base : 1./factor_mul_base;
		cam_distance_factor *= factor_mul;
		cam_distance_factor = Math.max(0.1, Math.min(cam_distance_factor, 4));
		update_cam_transform();
	})

	/*---------------------------------------------------------------
		Actors
	---------------------------------------------------------------*/
	// I just changed the values until I had a satisfiying output
	const MIN_SCALE = 1.0;
	const MAX_SCALE = 10.0;
	const MIN_VALUE = 0.0;
	const MAX_VALUE = 10.0
	function map_value(x) {
		return MIN_SCALE + ((x - MIN_VALUE) * (MAX_SCALE - MIN_SCALE) / (MAX_VALUE - MIN_VALUE));
	}
	
	function fft(x) {
        var n = x.length;

        // base case
		if (n == 1) {
			return [math.complex(x[0])];
		}

        // radix 2 Cooley-Tukey FFT
        if (n % 2 != 0) {
			console.log(n)
            throw new IllegalArgumentException("n is not a power of 2");
        }

		// compute FFT of even terms
        var even = new Array();
        for (var k = 0; k < n/2; k++) {
            even.push(x[2*k]);
		}
        var evenFFT = fft(even);

        // compute FFT of odd terms
        var odd  = new Array();  // reuse the array (to avoid n log n space)
        for (var k = 0; k < n/2; k++) {
            odd.push(x[2*k + 1]);
        }
        var oddFFT = fft(odd);

		// combine
        var y = new Array(n);
        for (var k = 0; k < n/2; k++) {
            var kth = -2 * k * Math.PI / n;
            var wk = math.complex(Math.cos(kth), Math.sin(kth));
            y[k]   = math.add(evenFFT[k], math.multiply(wk, oddFFT[k]));
            y[k + n/2] = math.subtract(evenFFT[k], math.multiply(wk, oddFFT[k]));
        }
        return y;
    }

	function play(audioBuffer) {
		const source = context.createBufferSource();
		source.playbackRate.value = 1.0
		source.buffer = audioBuffer;
		source.connect(context.destination);
		source.start();
	}
	
	const URL = './audio_samples/mgmt.mp3';
	const context = new AudioContext();

	const response = await window.fetch(URL);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await context.decodeAudioData(arrayBuffer);

	const leftChannelData = audioBuffer.getChannelData(0);
	const rightChannelData = audioBuffer.getChannelData(1);
	const BINS = 512;
	var start = 0;
	var end = BINS;

	function get_amplitude(call, previous) {
		if (call > 0 && end + BINS < leftChannelData.length) {
			start += BINS;
			end += BINS;
		}
		var x = new Array();
		for (var i = start; i < end; i++) {
			x.push(math.complex((leftChannelData[i] + rightChannelData[i])/2))
		}

		var ff = fft(x);
		var amp = [];
		for (var i = 0; i < BINS; i++) {
			amp.push(map_value(Math.min(math.norm(ff[i])), previous[i]*0.995));
		}
		return amp;
	}
	var amps = new Array(Math.floor(audioBuffer.duration)*94);
	amps[0] = get_amplitude(0, 0);
	for (var i = 1; i < amps.length; i++) {
		amps[i] = get_amplitude(1, amps[i - 1]);
	}

	// actors in the order they should be drawn
	const N = 16;
	const actors_list = [];
	const size = 0.5;
	const offset = 0.1;
	for(let j = -N/2; j < N/2; j++) {
		for(let i = -N/2; i < N/2; i++) {
			actors_list.push(new PhongActor({
				name: 'cube ('+i +', ' + j +')',
				size: size,
				tX: i*(2 * size + offset),
				tY: j*(2 * size + offset),
				material: [1.0, 0.0, 0.0],
				shininess : 8,
				ambient : 0.2,
				scale: amps[0][(j + N/2) * N + i + N/2],
			}, regl, resources));
		}
	}

	const actors_by_name = {};

	for (const actor of actors_list) {
		actors_by_name[actor.name] = actor;
	}

	/*
		Center camera on selected planet
	*/
	let selected_planet_name = 'cube (0, 0)';

	/*
		Start
	*/
	let is_started = false;
	register_keyboard_action('s', () => {
		if (!is_started) {
			is_started = true;
			play(audioBuffer);	
		}
	});

	/*
		Pause
	*/
	let is_paused = false;
	let sim_time = 0;
	let prev_regl_time = 0;

	register_keyboard_action('p', () => {
		if (is_paused) {
			context.resume();
		} else {
			context.suspend();
		}
		is_paused = !is_paused;
	});

	// Grid, to demonstrate keyboard shortcuts
	const draw_grid = make_grid_pipeline(regl);
	let grid_on = true;
	register_keyboard_action('g', () => grid_on = !grid_on);

	const grid_actor_interface = {
		draw: ({mat_projection, mat_view}) => {
			if(grid_on) draw_grid(mat_projection, mat_view);
		}
	};

	/*---------------------------------------------------------------
		Frame render
	---------------------------------------------------------------*/

	// List of objects to draw
	const draw_list = actors_list.slice();
	draw_list.push(grid_actor_interface);

	// Consider the sun, which locates at [0, 0, 0], as the only light source
	const light_position_world = [0, -1.5, 6, 1];
	const light_position_cam = [0, 0, 0, 1];
	const light_color = [1.0, 0.941, 0.898];

	//add the light_color to the planets except sun and billboard
	for (const actor of actors_list){
		if(actor instanceof PhongActor){
			actor.light_color = light_color;
		}
	}


	const mat_view = mat4.create();
	const camera_position = [0, 0, 0];

	regl.frame((frame) => {
		if (!is_paused && is_started) {
			const dt = frame.time - prev_regl_time;
			sim_time += dt;
			var amp = amps[Math.round(sim_time*94)];
			for (var i = 0; i < BINS/2; i++) {
				actors_list[i].scale = amp[i];
			}
		}
		T = sim_time/40.0;
		prev_regl_time = frame.time;
		if (T <= 1.0)
			update_cam_transform(bezier_curve(T));

		mat4.perspective(mat_projection, 
			deg_to_rad * 60, // fov y
			frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
			0.01, // near
			100, // far
		)

		// Calculate model matrices
		for (const actor of actors_list) {
			actor.calculate_model_matrix({sim_time: sim_time});
		}

		// Calculate view matrix, view centered on chosen planet
		{
			const selected_planet_model_mat = actors_by_name[selected_planet_name].mat_model_to_world;
			const selected_planet_position = mat4.getTranslation([0, 0, 0], selected_planet_model_mat);
			vec3.scale(selected_planet_position, selected_planet_position, -1);
			const selected_planet_translation_mat = mat4.fromTranslation(mat4.create(), selected_planet_position);
			mat4_matmul_many(mat_view, mat_world_to_cam, selected_planet_translation_mat);
		}

		// Calculate light position in camera frame
		vec4.transformMat4(light_position_cam, light_position_world, mat_view);

		// Calculate camera position and store it in `camera_position`, it will be needed for the billboard
		{
			/*
			Camera is at [0, 0, 0] in camera coordinates.
			mat_view is a transformation from world to camera coordinates.
			The inverse of mat_view is a transformation from camera to world coordinates.
			Transforming [0, 0, 0] from camera to world we obtain the world position of the camera.
				cam_pos = mat_view^-1 * [0, 0, 0]^T
			*/
			const mat_camera_to_world = mat4.invert(mat4.create(), mat_view);

			// Transform [0, 0, 0] from camera to world:
			//const camera_position = vec3.transformMat4([0, 0, 0], [0, 0, 0], mat_view_invert);
			// But the rotation and scale parts of the matrix do no affect [0, 0, 0] so, we can just get the translation, its cheaper:
			mat4.getTranslation(camera_position, mat_camera_to_world);
		}

		const draw_info = {
			sim_time: sim_time,
			mat_view: mat_view,
			mat_projection: mat_projection,
			light_position_cam: light_position_cam,
			camera_position: camera_position,
		}

		// Set the whole image to black
		regl.clear({color: [0, 0, 0, 1]});

		for (const actor of draw_list) {
			try {
				actor.draw(draw_info)
			} catch (e) {
				console.error('Error when rendering actor:', actor);
				throw e;
			}
		}

		debug_text.textContent = `
Hello! Sim time is ${sim_time.toFixed(2)} s
Camera: angle_z ${(cam_angle_z / deg_to_rad).toFixed(1)}, angle_y ${(cam_angle_y / deg_to_rad).toFixed(1)}, distance ${(cam_distance_factor*cam_distance_base).toFixed(1)}
cam pos ${vec_to_string(camera_position)}
`;
	})
}

DOM_loaded_promise.then(main);

