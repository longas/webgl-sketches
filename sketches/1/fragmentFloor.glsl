uniform float time;
uniform float playhead;
uniform float level;
uniform float black;
varying vec2 vUv;
float PI = 3.1415926538;

void main() {
  float w = 0.0005;
  float smoothness = 0.005;
  float border1 = smoothstep(w, w + smoothness, vUv.x);
  float border2 = smoothstep(w, w + smoothness, 1. - vUv.x);
  float border3 = smoothstep(w, w + smoothness, vUv.y);
  float border4 = smoothstep(w, w + smoothness, 1. - vUv.y);
  float finalBorder = border1 * border2 * border3 * border4;

  if (finalBorder == 1.) discard;

  gl_FragColor = vec4(vec3(0.267, 0.97, 0.97), 1.);
}