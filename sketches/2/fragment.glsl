uniform float time;
uniform float playhead;
uniform float offset;
uniform float level;
uniform vec3 color;
varying vec2 vUv;
float PI = 3.1415926538;

float quadraticInOut(float t) {
  float p = 2.0 * t * t;
  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

void main() {
  float progress = mod(playhead * 2. + offset * 2., 2.);
  progress = quadraticInOut(progress / 2.) * 2.;

  if (vUv.x > progress || vUv.x + 1. < progress) discard;

  gl_FragColor = vec4(color, 1.);
}