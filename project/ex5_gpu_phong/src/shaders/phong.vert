// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;
// attribute vec2 tex_coord;
attribute vec3 normal;

// Per-vertex outputs passed on to the fragment shader
// varying vec2 v2f_tex_coord;
varying vec3 v2f_normal; // normal vector in camera coordinates
varying vec3 v2f_dir_to_light; // direction to light source
varying vec3 v2f_dir_from_view; // viewing vector (from eye to vertex in view coordinates)

// Global variables specified in "uniforms" entry of the pipeline

uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals; // mat3 not 4, because normals are only rotated and not translated

uniform vec4 light_position; //in camera space coordinates already
uniform vec3 material;
uniform float sim_time;
uniform float scale;

void main() {
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	vec3 pos = (mat_model_view * vec4(position, 1)).xyz;
	v2f_dir_from_view = normalize(pos); // TODO calculate
	// direction to light source
	v2f_dir_to_light = normalize(light_position.xyz - pos); // TODO calculate
	// transform normal to camera coordinates
	v2f_normal = normalize(mat_normals * normal); // TODO apply normal transformation
	if (position.z > 0.0) {
		gl_Position = mat_mvp * vec4(position.xy, mod(position.z*scale, 12.0), 1);
	} else {
		gl_Position = mat_mvp * vec4(position, 1); // TODO apply mvp matrix
	}
}

