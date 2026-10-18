import * as THREE from "three";

const WIDTH = 1280,
  HEIGHT = 720,
  DURATION = 16;
const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const status = document.getElementById("status");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#eff3ed");
scene.fog = new THREE.Fog("#eff3ed", 7, 18);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
const camera = new THREE.OrthographicCamera(
  -1.9,
  1.9,
  1.06875,
  -1.06875,
  0.1,
  30,
);
camera.position.set(3.6, 2.1, 4.4);
camera.lookAt(-0.35, 0.745, 0.28);
scene.add(new THREE.HemisphereLight("#f9fff5", "#8f9e8a", 2.1));
const key = new THREE.DirectionalLight("#fff8e8", 3.2);
key.position.set(1.3, 4, 3);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -3;
key.shadow.camera.right = 3;
key.shadow.camera.top = 3;
key.shadow.camera.bottom = -3;
key.shadow.bias = -0.0008;
key.shadow.normalBias = 0.025;
scene.add(key);
const rim = new THREE.DirectionalLight("#c2dbd1", 1.5);
rim.position.set(-3, 2, -1);
scene.add(rim);
const material = (color, roughness = 0.85) =>
  new THREE.MeshStandardMaterial({ color, roughness });
const skin = material("#d3ad91"),
  shirt = material("#387c68"),
  pants = material("#40514a"),
  shoe = material("#e6e4d9"),
  sole = material("#bdc8ba"),
  wood = material("#c0a482"),
  metal = material("#83958a"),
  hair = material("#685c51");
function mesh(geometry, mat, parent = scene) {
  const m = new THREE.Mesh(geometry, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function oval(position, scale, mat, parent = scene) {
  const m = mesh(new THREE.SphereGeometry(1, 36, 24), mat, parent);
  m.position.set(...position);
  m.scale.set(...scale);
  return m;
}
function beam(a, b, radius, mat, parent = scene) {
  const start = new THREE.Vector3(...a),
    end = new THREE.Vector3(...b),
    direction = end.clone().sub(start);
  const m = mesh(
    new THREE.CapsuleGeometry(
      radius,
      Math.max(0.001, direction.length() - 2 * radius),
      8,
      20,
    ),
    mat,
    parent,
  );
  m.position.copy(start.add(end).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return m;
}
function box(position, scale, mat, parent = scene) {
  const m = mesh(new THREE.BoxGeometry(...scale), mat, parent);
  m.position.set(...position);
  return m;
}
const floor = mesh(new THREE.PlaneGeometry(200, 200), material("#e8eee3"));
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.017;
floor.castShadow = false;
// Chair: stable seat, back rest, four legs. Seat plane stays below the thighs.
box([0, 0.455, 0.015], [0.55, 0.065, 0.53], wood);
box([0, 0.84, -0.205], [0.55, 0.66, 0.055], wood);
for (const x of [-0.23, 0.23])
  for (const z of [-0.2, 0.23]) beam([x, 0.45, z], [x, 0.017, z], 0.018, metal);
// Generic adult avatar. There is no likeness of an existing person or face texture.
oval([0, 0.615, 0.015], [0.205, 0.145, 0.165], pants);
const torso = mesh(
  new THREE.CylinderGeometry(0.205, 0.163, 0.47, 40, 1),
  shirt,
);
torso.scale.z = 0.65;
torso.position.set(0, 0.91, 0.025);
oval([0, 1.125, 0.025], [0.235, 0.115, 0.14], shirt);
beam([0, 1.16, 0.025], [0, 1.29, 0.025], 0.055, skin);
const head = new THREE.Group();
head.position.set(0, 1.4, 0.035);
scene.add(head);
oval([0, 0, 0], [0.104, 0.143, 0.105], skin, head);
// Deliberately abstract facial area, small ears and smooth hair cap.
oval([-0.105, -0.005, -0.007], [0.018, 0.036, 0.02], skin, head);
oval([0.105, -0.005, -0.007], [0.018, 0.036, 0.02], skin, head);
oval([0, 0.078, -0.025], [0.106, 0.073, 0.092], hair, head);
oval([0, -0.003, 0.103], [0.019, 0.03, 0.023], skin, head);
for (const x of [-0.13, 0.13]) {
  beam([x, 0.64, 0.055], [x, 0.545, 0.445], 0.09, pants);
  oval([x, 0.536, 0.455], [0.079, 0.078, 0.085], pants);
}
// Arms rest naturally beside the torso, with forearms on the lap.
for (const sign of [-1, 1]) {
  const shoulder = [sign * 0.218, 1.115, 0.035],
    elbow = [sign * 0.247, 0.86, 0.075],
    wrist = [sign * 0.155, 0.7, 0.32];
  beam(shoulder, elbow, 0.067, shirt);
  oval(elbow, [0.066, 0.066, 0.066], shirt);
  beam(elbow, wrist, 0.048, skin);
  const hand = oval([sign * 0.15, 0.674, 0.36], [0.045, 0.025, 0.073], skin);
  hand.rotation.z = sign * 0.15;
  for (let i = 0; i < 4; i++)
    beam(
      [sign * 0.15 + (i - 1.5) * 0.013, 0.675, 0.383],
      [sign * 0.15 + (i - 1.5) * 0.013, 0.665, 0.438 - i * 0.004],
      0.007,
      skin,
    );
}
const lowerLegs = [];
for (const x of [-0.13, 0.13]) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 0.535, 0.455);
  scene.add(pivot);
  beam([0, -0.015, 0], [0, -0.425, 0], 0.061, pants, pivot);
  oval([0, -0.434, 0], [0.045, 0.055, 0.045], pants, pivot);
  const foot = oval([0, -0.465, 0.065], [0.065, 0.045, 0.14], shoe, pivot);
  const footSole = oval([0, -0.505, 0.065], [0.067, 0.013, 0.144], sole, pivot);
  lowerLegs.push(pivot);
}
// A subtle pad and background props are procedural geometry, not stock images.
const rug = mesh(new THREE.CircleGeometry(1.3, 80), material("#dae5d2"));
rug.rotation.x = -Math.PI / 2;
rug.position.set(0, 0.018, 0.23);
rug.castShadow = false;
const plant = new THREE.Group();
plant.position.set(-0.85, 0.017, -0.52);
scene.add(plant);
const pot = mesh(
  new THREE.CylinderGeometry(0.13, 0.09, 0.21, 32),
  material("#c8cfc0"),
  plant,
);
pot.position.y = 0.105;
for (let i = 0; i < 5; i++) {
  const angle = i * 1.6;
  const endpoint = [
    Math.sin(angle) * 0.17,
    0.4 + i * 0.065,
    Math.cos(angle) * 0.13,
  ];
  beam([0, 0.15, 0], endpoint, 0.007, material("#7b9970"), plant);
  const leaf = oval(endpoint, [0.065, 0.13, 0.025], material("#8aa47d"), plant);
  leaf.rotation.z = -Math.sin(angle) * 0.6;
  leaf.rotation.y = angle;
}

const clamp = (n) => Math.max(0, Math.min(1, n));
const smooth = (t) => {
  const v = clamp(t);
  return v * v * (3 - 2 * v);
};
function kneeAngle(t) {
  if (t < 3.2) return 0;
  if (t < 6.2) return smooth((t - 3.2) / 3) * Math.PI * 0.46;
  if (t < 6.8) return Math.PI * 0.46;
  if (t < 10.4) return (1 - smooth((t - 6.8) / 3.6)) * Math.PI * 0.46;
  return 0;
}
function phase(t) {
  return t < 3.2
    ? ["01", "Aufrecht sitzen", "Beide Füße stehen auf dem Boden."]
    : t < 6.8
      ? ["02", "Langsam strecken", "Ein Knie kontrolliert nach vorn strecken."]
      : t < 10.4
        ? [
            "03",
            "Kontrolliert absenken",
            "Den Fuß langsam wieder zum Boden führen.",
          ]
        : ["04", "Ruhig weiteratmen", "Die Bewegung entspannt beenden."];
}
function rounded(x, y, w, h, r) {
  context.beginPath();
  context.roundRect(x, y, w, h, r);
}
function draw(t) {
  lowerLegs[1].rotation.x = -kneeAngle(t);
  head.rotation.y = 0.03;
  torso.scale.x = 1 + Math.sin(t * 1.6) * 0.006;
  renderer.render(scene, camera);
  context.drawImage(renderer.domElement, 0, 0);
  const gradient = context.createLinearGradient(0, 0, 580, 0);
  gradient.addColorStop(0, "rgba(241,245,237,1)");
  gradient.addColorStop(0.75, "rgba(241,245,237,.96)");
  gradient.addColorStop(1, "rgba(241,245,237,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 600, 720);
  context.fillStyle = "#6c8768";
  context.font = "600 16px Segoe UI";
  context.fillText("PHYSIO GREGOR DRÖSSLER", 52, 58);
  context.fillStyle = "#1f513e";
  context.font = "600 36px Segoe UI";
  context.fillText("Knie im Sitzen", 52, 135);
  context.fillText("strecken", 52, 180);
  const [number, title, description] = phase(t);
  context.fillStyle = "#dce9d3";
  rounded(52, 244, 48, 43, 11);
  context.fill();
  context.fillStyle = "#416e45";
  context.font = "600 19px Segoe UI";
  context.fillText(number, 64, 272);
  context.fillStyle = "#34583e";
  context.font = "600 25px Segoe UI";
  context.fillText(title, 52, 337);
  context.font = "18px Segoe UI";
  context.fillStyle = "#627a5c";
  const words = description.split(" ");
  let line = "",
    row = 0;
  for (const word of words) {
    if (context.measureText(line + " " + word).width > 340) {
      context.fillText(line, 52, 377 + row * 28);
      row++;
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) context.fillText(line, 52, 377 + row * 28);
  context.fillStyle = "#dfe9d8";
  rounded(52, 482, 290, 39, 9);
  context.fill();
  context.fillStyle = "#5d7b55";
  context.font = "14px Segoe UI";
  context.fillText("Eigene 3D-Animation · Deutsch", 67, 507);
  context.fillStyle = "#fffef6";
  rounded(35, 639, 1210, 55, 10);
  context.fill();
  context.fillStyle = "#6d795f";
  context.font = "15px Segoe UI";
  context.fillText(
    "Demonstrationsentwurf · Vor therapeutischer Verwendung fachlich prüfen",
    55,
    673,
  );
  context.fillStyle = "#bdcdb4";
  context.fillRect(52, 584, 340, 4);
  context.fillStyle = "#588754";
  context.fillRect(52, 584, 340 * clamp(t / DURATION), 4);
}
let recording = false,
  started = 0,
  previewTime = 5.5;
function animate(time) {
  const t = recording ? (time - started) / 1000 : previewTime;
  draw(Math.min(t, DURATION));
  if (recording && t >= DURATION) finishRecording();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
document.getElementById("start-pose").onclick = () => {
  previewTime = 1;
  status.textContent = "Vorschau: Ausgangsstellung, beide Füße am Boden.";
};
document.getElementById("extend-pose").onclick = () => {
  previewTime = 6.2;
  status.textContent =
    "Vorschau: Kniestreckung, Oberschenkel bleiben auf der Sitzfläche.";
};
document.getElementById("lower-pose").onclick = () => {
  previewTime = 8.5;
  status.textContent = "Vorschau: kontrolliertes Absenken.";
};
let recorder, audioContext, audioSource, capture;
async function finishRecording() {
  if (!recording) return;
  recording = false;
  recorder.stop();
  capture.getTracks().forEach((t) => t.stop());
  if (audioContext) await audioContext.close();
}
document.getElementById("record").onclick = async () => {
  const button = document.getElementById("record");
  button.disabled = true;
  try {
    status.textContent = "Deutsche Tonspur wird vorbereitet …";
    audioContext = new AudioContext();
    await audioContext.resume();
    const response = await fetch(
      "/api/demo-media/knie-strecken/knie-strecken-de-voice.wav",
    );
    if (!response.ok)
      throw new Error(
        "Bitte zuerst in der App die Patienten-Demonstration öffnen.",
      );
    const buffer = await audioContext.decodeAudioData(
      await response.arrayBuffer(),
    );
    const destination = audioContext.createMediaStreamDestination();
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = buffer;
    audioSource.connect(destination);
    capture = canvas.captureStream(30);
    destination.stream.getAudioTracks().forEach((t) => capture.addTrack(t));
    const mime = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find((t) => MediaRecorder.isTypeSupported(t));
    if (!mime)
      throw new Error("Der Browser unterstützt die Videoaufnahme nicht.");
    const chunks = [];
    recorder = new MediaRecorder(capture, {
      mimeType: mime,
      videoBitsPerSecond: 6500000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const download = document.getElementById("download");
      download.href = url;
      download.hidden = false;
      const result = document.getElementById("result");
      result.src = url;
      result.hidden = false;
      status.textContent = `Fertig: 16 Sekunden, ${Math.round(blob.size / 1024)} KB, eigene 3D-Bewegung mit deutscher Tonspur.`;
      button.disabled = false;
    };
    draw(0);
    recorder.start(200);
    started = performance.now();
    recording = true;
    audioSource.start(audioContext.currentTime + 0.7);
    status.textContent =
      "Aufnahme läuft: 16 Sekunden. Die Szene zeichnet nur die eigene 3D-Animation auf.";
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
    recording = false;
    capture?.getTracks().forEach((t) => t.stop());
    audioContext?.close();
  }
};
status.textContent =
  "Bereit: eigene 3D-Person, deutscher Sprechertext und animierte Kniestreckung.";
