// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { PlaneBufferGeometry, Mesh, Group, ShaderMaterial } = require("three");

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";
import fragmentFloor from "./fragmentFloor.glsl";

const settings = {
  // dimensions: [1080 * 2, 920 * 2],
  duration: 15,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
    antialias: true,
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, 2);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  const number = 50;
  const geometry = new PlaneBufferGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);

  const shaderMat = new ShaderMaterial({
    extensions: {
      derivatives: "#extensions GL_OES_standard_derivatives : enable",
    },
    uniforms: {
      time: { type: "f", value: 0 },
      level: { type: "f", value: 0 },
      playhead: { type: "f", value: 0 },
      black: { type: "f", value: 0 },
    },
    transparent: true,
    fragmentShader: fragment,
    vertexShader: vertex,
  });

  const floorShaderMat = new ShaderMaterial({
    extensions: {
      derivatives: "#extensions GL_OES_standard_derivatives : enable",
    },
    uniforms: {
      time: { type: "f", value: 0 },
      level: { type: "f", value: 0 },
      playhead: { type: "f", value: 0 },
      black: { type: "f", value: 0 },
    },
    transparent: true,
    fragmentShader: fragmentFloor,
    vertexShader: vertex,
  });

  const group = new Group();
  group.position.y = -0.5;
  scene.add(group);

  const matList = [];

  for (let i = 0; i <= number; i++) {
    const blackMat = shaderMat.clone();
    const whiteMat = shaderMat.clone();

    matList.push(blackMat, whiteMat);

    blackMat.uniforms.black.value = 1;
    blackMat.uniforms.level.value = i / number;
    whiteMat.uniforms.level.value = i / number;

    const blackMesh = new Mesh(geometry, blackMat);
    const whiteMesh = new Mesh(geometry, whiteMat);

    blackMesh.position.y = i / number;
    whiteMesh.position.y = i / number - 0.005;

    group.add(blackMesh);
    group.add(whiteMesh);
  }

  const floorMesh = new Mesh(new PlaneBufferGeometry(1.5, 1.5), floorShaderMat);
  floorMesh.rotateX(-Math.PI / 2);
  floorMesh.position.y = 0.4;

  group.add(floorMesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, playhead }) {
      matList.forEach((m) => {
        m.uniforms.playhead.value = time * 0.065;
      });

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
