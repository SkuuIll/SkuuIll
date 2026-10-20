// Load the 3D engine only as a scene approaches the viewport. The initial hero
// keeps its small Canvas renderer; the cinematic scenes are independent.
const root = document.documentElement;
const hosts = [...document.querySelectorAll<HTMLElement>("[data-spatial]")];
const cleanups: Array<() => void> = [];
let disposed = false;

async function mount(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>("canvas")!;
  const context = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!context) {
    host.dataset.renderer = "fallback";
    return;
  }
  try {
    const T = await import("three");
    if (disposed) {
      context.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    const journey = host.dataset.spatial === "journey";
    const renderer = new T.WebGLRenderer({
      canvas,
      context,
      alpha: false,
      antialias: false,
    });
    const economical =
      matchMedia("(pointer: coarse)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData;
    renderer.setPixelRatio(Math.min(devicePixelRatio, economical ? 1 : 1.5));
    const scene = new T.Scene();
    const camera = journey
      ? new T.PerspectiveCamera(65, 1, 0.1, 110)
      : new T.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    const groups: import("three").Group[] = [];
    let texture: import("three").Texture | undefined;
    let photo: import("three").ShaderMaterial | undefined;
    let sculpture: import("three").Mesh | undefined;
    let time = 0,
      last = 0,
      frame = 0,
      progress = 0,
      smoothProgress = 0;
    let px = 0,
      py = 0,
      sx = 0,
      sy = 0,
      visible = false,
      ready = journey,
      lost = false;
    let live = true,
      suspended = false;
    const accent = new T.Color();
    const secondary = new T.Color();
    const materials: import("three").Material[] = [];
    const geometries: import("three").BufferGeometry[] = [];
    const journeySection = host.closest<HTMLElement>(".portal-journey");
    const readColors = () => {
      const css = getComputedStyle(root);
      accent.set(css.getPropertyValue("--accent").trim());
      secondary.set(css.getPropertyValue("--signal-blue").trim());
      // Cinematic space stays dark in both themes; brighten light-theme accents.
      if (root.dataset.theme === "light") {
        accent.lerp(new T.Color("#b8ffdf"), 0.65);
        secondary.lerp(new T.Color("#9ccaff"), 0.65);
      }
    };
    readColors();
    if (journey) {
      scene.background = new T.Color("#050b10");
      scene.fog = new T.FogExp2("#050b10", 0.035);
      scene.add(new T.AmbientLight("#a7cbd3", 1.5));
      const lamp = new T.DirectionalLight("#ffffff", 3);
      lamp.position.set(3, 5, 6);
      scene.add(lamp);
      const lineGeometry = new T.EdgesGeometry(new T.BoxGeometry(10, 8, 0.12));
      const ringGeometry = new T.TorusGeometry(
        4.1,
        0.04,
        4,
        economical ? 64 : 96,
      );
      geometries.push(lineGeometry, ringGeometry);
      const mint = new T.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.8,
      });
      const blue = new T.MeshBasicMaterial({ color: secondary });
      materials.push(mint, blue);
      const beamGeometry = new T.BoxGeometry(1, 1, 1);
      const beamMaterial = new T.MeshStandardMaterial({
        color: "#19323b",
        emissive: accent,
        emissiveIntensity: 0.12,
        metalness: 0.72,
        roughness: 0.35,
      });
      geometries.push(beamGeometry);
      materials.push(beamMaterial);
      for (let i = 0; i < 32; i++) {
        const group = new T.Group();
        group.position.z = -i * 3.2;
        group.position.x = Math.sin(i * 0.3) * 1.2;
        group.position.y = Math.cos(i * 0.25) * 0.7;
        group.rotation.z = i * 0.075;
        const lines = new T.LineSegments(lineGeometry, mint);
        const ring = new T.Mesh(ringGeometry, blue);
        ring.scale.set(1.1, 0.88, 1);
        group.add(i % 3 === 0 ? ring : lines);
        if (i % 3 !== 0) {
          for (const [x, y, width, height] of [
            [0, 4, 10, 0.065],
            [0, -4, 10, 0.065],
            [-5, 0, 0.065, 8],
            [5, 0, 0.065, 8],
          ]) {
            const beam = new T.Mesh(beamGeometry, beamMaterial);
            beam.position.set(x, y, 0);
            beam.scale.set(width, height, 0.2);
            group.add(beam);
          }
        }
        scene.add(group);
        groups.push(group);
      }
      const gemGeometry = new T.IcosahedronGeometry(1.25, 1);
      const gemMaterial = new T.MeshStandardMaterial({
        color: accent,
        roughness: 0.22,
        metalness: 0.8,
        flatShading: true,
      });
      sculpture = new T.Mesh(gemGeometry, gemMaterial);
      sculpture.position.set(0, 0, -78);
      scene.add(sculpture);
      materials.push(gemMaterial);
      geometries.push(gemGeometry);
      let seed = Number(root.dataset.seed || 7) + 1;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const stars = new Float32Array((economical ? 220 : 500) * 3);
      for (let i = 0; i < stars.length; i += 3) {
        stars[i] = (random() - 0.5) * 22;
        stars[i + 1] = (random() - 0.5) * 16;
        stars[i + 2] = -random() * 104;
      }
      const particles = new T.BufferGeometry();
      particles.setAttribute("position", new T.BufferAttribute(stars, 3));
      const pointMaterial = new T.PointsMaterial({
        color: accent,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
      });
      scene.add(new T.Points(particles, pointMaterial));
      materials.push(pointMaterial);
      geometries.push(particles);
    } else {
      camera.position.z = 1;
      photo = new T.ShaderMaterial({
        uniforms: {
          image: { value: null },
          pointer: { value: new T.Vector2() },
          amount: { value: 1 },
          viewport: { value: new T.Vector2(1, 1) },
          imageAspect: { value: 1.5 },
          clock: { value: 0 },
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
        // An art-directed depth field, not an inferred or captured 3D model.
        // Foreground architecture and the central orb move more than distant fog.
        fragmentShader: `precision highp float;
          uniform sampler2D image; uniform vec2 pointer,viewport; uniform float amount,imageAspect,clock;
          varying vec2 vUv;
          void main(){
            vec2 uv=vUv; float aspect=viewport.x/viewport.y;
            vec2 cover=vec2(min(1.,aspect/imageAspect),min(1.,imageAspect/aspect));
            uv=(uv-.5)*cover*.92+.5;
            float edge=smoothstep(.22,.49,abs(uv.x-.5));
            float orb=exp(-dot((uv-vec2(.5,.54))*vec2(4.,3.),(uv-vec2(.5,.54))*vec2(4.,3.))*3.);
            float depth=clamp(edge*.8+orb*.4+(1.-uv.y)*.12,0.,1.);
            vec2 drift=pointer+vec2(sin(clock*.23),cos(clock*.19))*.09;
            uv+=drift*depth*.036*amount;
            vec3 col=texture2D(image,clamp(uv,.005,.995)).rgb;
            gl_FragColor=vec4(col,1.);
            #include <colorspace_fragment>
          }`,
      });
      const geometry = new T.PlaneGeometry(2, 2);
      scene.add(new T.Mesh(geometry, photo));
      materials.push(photo);
      geometries.push(geometry);
      const image = host.querySelector<HTMLImageElement>("img")!;
      const loader = new T.TextureLoader();
      loader.load(
        image.currentSrc || image.src,
        (loaded) => {
          if (!live) {
            loaded.dispose();
            return;
          }
          texture = loaded;
          texture.colorSpace = T.SRGBColorSpace;
          photo!.uniforms.image.value = texture;
          photo!.uniforms.imageAspect.value =
            loaded.image.width / loaded.image.height;
          ready = true;
          sync();
        },
        undefined,
        () => {
          host.dataset.renderer = "fallback";
        },
      );
      const depth = document.querySelector<HTMLInputElement>("#spatial-depth");
      depth?.addEventListener("input", () => {
        photo!.uniforms.amount.value = Number(depth.value) / 50;
        document.querySelector("#spatial-depth-value")!.textContent =
          depth.value;
      });
      document.querySelector<HTMLElement>(".spatial-tools")!.hidden = false;
    }
    const resize = () => {
      const width = host.clientWidth,
        height = host.clientHeight;
      renderer.setSize(width, height, false);
      if (camera instanceof T.PerspectiveCamera) {
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      }
      photo?.uniforms.viewport.value.set(width, height);
    };
    const scroll = () => {
      if (journeySection) {
        const rect = journeySection.getBoundingClientRect();
        progress = Math.min(
          1,
          Math.max(0, -rect.top / Math.max(1, rect.height - host.clientHeight)),
        );
        journeySection.style.setProperty(
          "--journey-progress",
          String(progress),
        );
        const chapter = Math.min(2, Math.floor(progress * 3));
        const labels = ["01 / ENTRAR", "02 / ATRAVESAR", "03 / DESCUBRIR"];
        const lines = [
          "Todo empieza con un gesto.",
          "La perspectiva cambia todo.",
          "Ahora, probá tus propias ideas.",
        ];
        host.querySelector("[data-journey-label]")!.textContent =
          labels[chapter];
        host.querySelector("[data-journey-line]")!.textContent = lines[chapter];
      } else {
        const rect = host.getBoundingClientRect();
        py = Math.min(
          1,
          Math.max(
            -1,
            (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight,
          ),
        );
      }
    };
    const allowed = () =>
      live &&
      !suspended &&
      ready &&
      visible &&
      !lost &&
      !document.hidden &&
      !document.querySelector("dialog[open]");
    const render = (stamp: number) => {
      frame = 0;
      if (!allowed()) {
        canvas.dataset.running = "false";
        last = 0;
        return;
      }
      const delta = last ? Math.min(0.05, (stamp - last) / 1000) : 0;
      last = stamp;
      time += delta;
      const easing = 1 - Math.exp(-delta * 7);
      sx += (px - sx) * easing;
      sy += (py - sy) * easing;
      smoothProgress += (progress - smoothProgress) * easing;
      if (journey) {
        const z = 8 - smoothProgress * 74;
        camera.position.set(
          Math.sin(smoothProgress * 5) * 0.7 + sx * 0.7,
          Math.cos(smoothProgress * 4) * 0.35 - sy * 0.45,
          z,
        );
        camera.lookAt(Math.sin(smoothProgress * 5 + 0.3) * 0.7, 0, z - 10);
        camera.rotation.z =
          Math.sin(smoothProgress * Math.PI * 2) * 0.12 + sx * 0.025;
        groups.forEach((group, i) => {
          group.rotation.z = i * 0.075 + Math.sin(time * 0.16 + i * 0.1) * 0.08;
        });
        if (sculpture) {
          sculpture.rotation.x = time * 0.12;
          sculpture.rotation.y = time * 0.2;
        }
      } else if (photo) {
        photo.uniforms.pointer.value.set(sx, sy);
        photo.uniforms.clock.value = time;
      }
      renderer.render(scene, camera);
      host.dataset.ready = "true";
      canvas.dataset.running = "true";
      frame = requestAnimationFrame(render);
    };
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      canvas.dataset.running = "false";
      if (allowed()) frame = requestAnimationFrame(render);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio > 0.15;
        scroll();
        sync();
      },
      { threshold: [0, 0.15] },
    );
    observer.observe(host);
    const size = new ResizeObserver(resize);
    size.observe(host);
    const dialog = new MutationObserver(sync);
    document.querySelectorAll("dialog").forEach((element) =>
      dialog.observe(element, {
        attributes: true,
        attributeFilter: ["open"],
      }),
    );
    const colors = new MutationObserver(() => {
      readColors();
      if (journey)
        materials.forEach((material, i) => {
          if ("color" in material)
            (material as import("three").MeshBasicMaterial).color.copy(
              i === 1 ? secondary : accent,
            );
        });
    });
    colors.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      px = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
      );
      py = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };
    const leave = () => {
      px = 0;
      py = 0;
    };
    host.addEventListener("pointermove", pointer, { passive: true });
    host.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    const suspend = () => {
      suspended = true;
      sync();
    };
    const resume = () => {
      suspended = false;
      scroll();
      sync();
    };
    window.addEventListener("pagehide", suspend);
    window.addEventListener("pageshow", resume);
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      lost = true;
      delete host.dataset.ready;
      sync();
    });
    canvas.addEventListener("webglcontextrestored", () => {
      lost = false;
      resize();
      sync();
    });
    resize();
    scroll();
    sync();
    host.dataset.renderer = "webgl2";
    const release = () => {
      live = false;
      sync();
      delete host.dataset.ready;
      observer.disconnect();
      size.disconnect();
      dialog.disconnect();
      colors.disconnect();
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pagehide", suspend);
      window.removeEventListener("pageshow", resume);
      host.removeEventListener("pointermove", pointer);
      host.removeEventListener("pointerleave", leave);
      texture?.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    };
    cleanups.push(release);
  } catch {
    host.dataset.renderer = "fallback";
    context.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

const near = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        near.unobserve(entry.target);
        void mount(entry.target as HTMLElement);
      }
  },
  { rootMargin: "350px" },
);
hosts.forEach((host) => near.observe(host));
window.addEventListener("pagehide", (event) => {
  // A bfcache page remains alive. Visibility observers stop its loops and it can resume.
  if (event.persisted) return;
  disposed = true;
  near.disconnect();
  cleanups.forEach((release) => release());
});
