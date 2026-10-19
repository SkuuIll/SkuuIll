import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
export async function mountModel(
  stage: HTMLElement,
  url: string,
  shell: HTMLElement,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xe8e5dd, 1);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Prenda 3D interactiva. Usá los botones de giro, color y zoom.",
  );
  stage.append(canvas);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x756d61, 3));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 4, 5);
  scene.add(light);
  const fill = new THREE.DirectionalLight(0xdde8ff, 2);
  fill.position.set(-3, 2, -3);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  camera.position.set(0, 0.15, 3.6);
  const orbit = new OrbitControls(camera, canvas);
  orbit.enablePan = false;
  orbit.enableZoom = false;
  orbit.enableDamping = false;
  orbit.minPolarAngle = Math.PI * 0.22;
  orbit.maxPolarAngle = Math.PI * 0.78;
  canvas.style.touchAction = "pan-y";
  let model: THREE.Group | undefined;
  let disposed = false;
  const material = new THREE.MeshStandardMaterial({
    color: 0xa74c36,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const geometries = new Set<THREE.BufferGeometry>();
  const originals = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };
  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  orbit.addEventListener("change", render);
  const controller = new AbortController();
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    controller.abort();
    observer.disconnect();
    orbit.dispose();
    geometries.forEach((x) => x.dispose());
    originals.forEach((x) => x.dispose());
    textures.forEach((x) => x.dispose());
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
  try {
    const gltf = await new GLTFLoader().loadAsync(url);
    model = gltf.scene;
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const mat of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          originals.add(mat);
          Object.values(mat).forEach((value) => {
            if (value instanceof THREE.Texture) textures.add(value);
          });
        }
        object.material = material;
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const group = new THREE.Group();
    group.add(model);
    group.scale.setScalar(1.7 / Math.max(size.x, size.y, size.z));
    scene.add(group);
    model = group;
    resize();
  } catch (error) {
    cleanup();
    throw error;
  }
  const on = (selector: string, fn: (button: HTMLButtonElement) => void) =>
    shell.querySelectorAll<HTMLButtonElement>(selector).forEach((button) =>
      button.addEventListener("click", () => fn(button), {
        signal: controller.signal,
      }),
    );
  on("[data-model-color]", (button) => {
    material.color.set(button.dataset.modelColor!);
    shell
      .querySelectorAll("[data-model-color]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    render();
  });
  const turn = (amount: number) => {
    if (model) model.rotation.y += amount;
    render();
  };
  on("[data-model-turn]", (button) =>
    turn(Number(button.dataset.modelTurn) * 0.4),
  );
  on("[data-model-zoom]", (button) => {
    camera.position.multiplyScalar(Number(button.dataset.modelZoom));
    camera.position.clampLength(2, 5);
    orbit.update();
    render();
  });
  canvas.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        turn(event.key === "ArrowLeft" ? -0.25 : 0.25);
      }
    },
    { signal: controller.signal },
  );
  return cleanup;
}
