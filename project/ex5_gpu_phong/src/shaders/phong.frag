precision highp float;
		
varying vec3 v2f_normal; // normal vector in camera coordinates
varying vec3 v2f_dir_to_light; // direction to light source
varying vec3 v2f_dir_from_view; // viewing vector (from eye to vertex in view coordinates)


uniform vec3  light_color;
uniform float ambient;
uniform float shininess;
uniform vec3 material;
uniform float scale;

uniform sampler2D texture_base_color;

void main() {
    vec3 mat = material;
    if (scale < 2.0) {
        mat = vec3(0.2627, 0.4667, 0.6588);
    } else if (scale < 4.0) {
        mat = vec3(0.3216, 0.7882, 0.4784);
    } else if (scale < 6.0) {
        mat = vec3(0.9216, 0.8667, 0.3765);
    } else {
        mat = vec3(0.9451, 0.0549, 0.0549);
    }
    vec3 color = ambient * light_color * mat;

    float nDotL = dot(v2f_normal, v2f_dir_to_light);

    if (nDotL > 0.0) {
        color += nDotL * light_color * mat;
        vec3 r = normalize(reflect(v2f_dir_to_light, v2f_normal));
        float rDotV = dot(r, v2f_dir_from_view);
        if (rDotV > 0.0) {
            color += mat * light_color * pow(rDotV, shininess);
        }
    }
	gl_FragColor = clamp(vec4(color, 1.), 0.0, 1.0); // output: RGBA in 0..1 range
}

