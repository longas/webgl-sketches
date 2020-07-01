// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const {
  PlaneBufferGeometry,
  Mesh,
  Group,
  ShaderMaterial,
  Vector3,
  CatmullRomCurve3,
  TubeBufferGeometry,
  MeshNormalMaterial,
  Color,
  BackSide,
} = require("three");

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const colors = require("nice-color-palettes");

const palette = colors[Math.floor(Math.random() * 100)];

const settings = {
  dimensions: [1080, 920],
  pixelRatio: 2,
  // duration: 1.5,
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
  camera.position.set(2, 2, 8);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // ###

  function range(min, max) {
    return min + Math.random() * (max - min);
  }

  const number = 350;
  const precision = 100;
  const animated = [];

  const shaderMat = new ShaderMaterial({
    uniforms: {
      time: { type: "f", value: 0 },
      playhead: { type: "f", value: 0 },
      offset: { type: "f", value: 0 },
      color: { type: "v4", value: new Color("black") },
    },
    fragmentShader: fragment,
    vertexShader: vertex,
  });

  for (let i = 0; i < number; i++) {
    const level = range(-4, 4);
    const normalizedLevel = level / 4;
    const radius = 1 * normalizedLevel + Math.random() * 0.18;
    const spline = [];

    const offset = Math.abs(normalizedLevel);
    const width = Math.random() * 0.5 + 0.5;
    const angle = range(0, Math.PI * 2);

    const center = {
      x: range(-0.02, -0.02),
      y: range(-0.02, -0.02),
    };

    // const center = {
    //   x: 0,
    //   y: 0,
    // };

    for (let j = 0; j < precision * width; j++) {
      let x = center.x + Math.cos((Math.PI * 2 * j) / precision) * radius;
      let z = center.y + Math.sin((Math.PI * 2 * j) / precision) * radius;
      spline.push(new Vector3(x, level, z));
    }

    const curve = new CatmullRomCurve3(spline);
    const tubeParams = {
      extrusionSegments: 75,
      radiusSegments: 10,
      closed: false,
    };
    const tubeGeometry = new TubeBufferGeometry(
      curve,
      tubeParams.extrusionSegments,
      0.007,
      tubeParams.radiusSegments,
      tubeParams.closed
    );
    const shadowTubeGeometry = new TubeBufferGeometry(
      curve,
      tubeParams.extrusionSegments,
      0.007 * 1.5,
      tubeParams.radiusSegments,
      tubeParams.closed
    );

    const material = shaderMat.clone();
    material.uniforms.color.value = new Color(
      palette[Math.floor(Math.random() * 5)]
    );
    material.uniforms.offset.value = offset;
    const borderMaterial = shaderMat.clone();
    borderMaterial.uniforms.offset.value = offset;
    borderMaterial.side = BackSide;

    const mesh = new Mesh(tubeGeometry, material);
    const borderMesh = new Mesh(shadowTubeGeometry, borderMaterial);

    mesh.rotateY(angle);
    borderMesh.rotateY(angle);

    scene.add(mesh, borderMesh);
    scene.rotateZ(45);

    animated.push({ mesh, material, borderMaterial });
  }

  // ###

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
      animated.forEach((e) => {
        e.material.uniforms.playhead.value = time / 1.5;
        e.borderMaterial.uniforms.playhead.value = time / 1.5;
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
