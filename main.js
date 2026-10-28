import { Agent } from "./Agent.js";
import { FlowField } from "./FlowField.js";
import { Flocking } from "./Flocking.js";
import { Physarum } from "./Physarum.js";

const AUDIO_PATH = "./凡愚 (feat. 知声).mp3";
const VIDEO_PATH = "./YTDown.com_YouTube_Media_2y6t8q3GCLs_凡愚-知声_001_1080p.mp4";
const AGENT_COUNT = 300;

const scenes = [
  {
    label: "紫 / Violeta",
    background: "#7100a1",
    ink: "#160021",
    ornament: "#37005b",
    accent: "#baff45",
    agent: "#f7f0e2",
    trail: [245, 74, 255],
    orientation: -Math.PI / 2,
    scale: 2.2,
    pattern: "violet",
  },
  {
    label: "灰 / Interferencia",
    background: "#55545a",
    ink: "#17131d",
    ornament: "#7200aa",
    accent: "#dcff54",
    agent: "#f7f0e2",
    trail: [202, 85, 243],
    orientation: -0.5,
    scale: 3.1,
    pattern: "interference",
  },
  {
    label: "緑 / Señal",
    background: "#003a08",
    ink: "#001605",
    ornament: "#c5ffbb",
    accent: "#f5ffe7",
    agent: "#e5ff83",
    trail: [125, 255, 116],
    orientation: 0.5,
    scale: 1.5,
    pattern: "signal",
  },
  {
    label: "琥珀 / Órbita",
    background: "#f2a600",
    ink: "#100718",
    ornament: "#5300a2",
    accent: "#270046",
    agent: "#21102a",
    trail: [105, 0, 173],
    orientation: -2.3,
    scale: 2.8,
    pattern: "orbit",
  },
  {
    label: "波 / Mareas",
    background: "#756456",
    ink: "#19151b",
    ornament: "#d5b388",
    accent: "#f4e3bd",
    agent: "#fcf4e8",
    trail: [214, 188, 144],
    orientation: -0.9,
    scale: 1.7,
    pattern: "waves",
  },
];

const presets = {
  still: {
    label: "静 / Suspensión",
    energy: 0.18,
    grouping: 0.9,
    memory: 0.78,
    reach: 0.3,
    snap: 0.12,
    burst: 0.12,
    turn: 0,
    fieldScale: 0.85,
    accent: "#d8ff6a",
    particleShape: "triangle",
    particleSize: 4.1,
    palette: {
      background: "#525159",
      ink: "#0a090c",
      ornament: "#8e8792",
      accent: "#d8ff6a",
      agent: "#fff8ed",
      trail: [207, 183, 223],
      pattern: "still",
    },
  },
  surge: {
    label: "奔 / Oleada",
    energy: 0.92,
    grouping: 0.66,
    memory: 0.88,
    reach: 0.82,
    snap: 0.78,
    burst: 0.56,
    turn: 0.72,
    fieldScale: 1.25,
    accent: "#f6f0ff",
    particleShape: "circle",
    particleSize: 3.8,
    palette: {
      background: "#7900bf",
      ink: "#170024",
      ornament: "#e437ff",
      accent: "#c5ff49",
      agent: "#fff9ee",
      trail: [243, 75, 255],
      pattern: "surge",
    },
  },
  fracture: {
    label: "断 / Fractura",
    energy: 0.84,
    grouping: 0.12,
    memory: 0.22,
    reach: 1,
    snap: 1.35,
    burst: 0.82,
    turn: -1.2,
    fieldScale: 0.72,
    accent: "#b9fff0",
    particleShape: "square",
    particleSize: 3.5,
    palette: {
      background: "#0c3935",
      ink: "#020807",
      ornament: "#b6d2c2",
      accent: "#c7ff61",
      agent: "#f2fff8",
      trail: [59, 255, 197],
      pattern: "fracture",
    },
  },
  burst: {
    label: "爆 / Estallido",
    energy: 1,
    grouping: 0.08,
    memory: 0.62,
    reach: 0.94,
    snap: 1.8,
    burst: 1,
    turn: 2.2,
    fieldScale: 1.7,
    accent: "#ab2cff",
    particleShape: "x",
    particleSize: 4.5,
    palette: {
      background: "#f2a600",
      ink: "#12071a",
      ornament: "#7200ca",
      accent: "#b100ee",
      agent: "#fff4d8",
      trail: [163, 0, 226],
      pattern: "burst",
    },
  },
};

const canvas = document.querySelector("#instrument");
const context = canvas.getContext("2d", { alpha: false });
const song = document.querySelector("#song");
const audioToggle = document.querySelector("#audio-toggle");
const audioStatus = document.querySelector("#audio-status");
const pauseToggle = document.querySelector("#pause-toggle");
const modifiersToggle = document.querySelector("#modifiers-toggle");
const controlsPanel = document.querySelector(".controls");
const controls = {
  energy: document.querySelector("#energy"),
  grouping: document.querySelector("#grouping"),
  memory: document.querySelector("#memory"),
  reach: document.querySelector("#reach"),
};
const toolGlyphs = {
  attract: "凡",
  repel: "愚",
  seed: "知",
  rotate: "声",
};
const readouts = {
  energy: document.querySelector("#energy-value"),
  grouping: document.querySelector("#grouping-value"),
  memory: document.querySelector("#memory-value"),
  reach: document.querySelector("#reach-value"),
  direction: document.querySelector("#direction-value"),
  scene: document.querySelector("#scene-value"),
  tool: document.querySelector("#tool-value"),
  preset: document.querySelector("#preset-value"),
};
const toolNames = {
  attract: "Convocar",
  repel: "Dispersar",
  seed: "Sembrar",
  rotate: "Girar",
};

let width = 1;
let height = 1;
let pixelRatio = 1;
let agents = [];
let paused = false;
let previousTime = 0;
let target = null;
let pointerDown = false;
let cursorPosition = null;
let lastPointerPosition = null;
let activeTool = "attract";
let activeSceneIndex = 0;
let activePresetName = "still";
let activePreset = presets[activePresetName];

const flowField = new FlowField(width, height);
const flocking = new Flocking();
const physarum = new Physarum(width, height);

function compositionBounds() {
  const narrow = width < 700;
  const frameX = narrow ? width * 0.035 : width * 0.16;
  const frameY = narrow ? height * 0.25 : height * 0.16;
  const frameWidth = width - frameX * 2;
  const frameHeight = narrow ? height * 0.42 : height * 0.64;
  return {
    x: frameX + 7,
    y: frameY + 18,
    width: Math.max(1, frameWidth - 14),
    height: Math.max(1, frameHeight - 25),
    frameX,
    frameY,
    frameWidth,
    frameHeight,
  };
}

function resize() {
  const bounds = canvas.getBoundingClientRect();
  width = Math.max(1, bounds.width);
  height = Math.max(1, bounds.height);
  pixelRatio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  flowField.resize(width, height);
  physarum.resize(width, height);
  resetAgents();
}

function resetAgents() {
  const bounds = compositionBounds();
  physarum.clear();
  agents = Array.from({ length: AGENT_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    return new Agent(
      bounds.x + Math.random() * bounds.width,
      bounds.y + Math.random() * bounds.height,
      angle,
    );
  });
  target = null;
}

function gestureRadius() {
  return Math.max(36, Math.min(width, height) * Number(controls.reach.value) * 0.55);
}

function updateReadouts() {
  for (const [name, input] of Object.entries(controls)) {
    readouts[name].value = String(Math.round(Number(input.value) * 100));
  }
  let degrees = Math.round((flowField.orientation * 180 / Math.PI) % 360);
  if (degrees > 180) degrees -= 360;
  if (degrees < -180) degrees += 360;
  readouts.direction.value = `${degrees}°`;
  readouts.scene.value = scenes[activeSceneIndex].label;
  readouts.tool.value = toolNames[activeTool];
  readouts.preset.value = activePreset.label;
  physarum.tune(Number(controls.memory.value));
}

function drawOutsideTypography() {
  context.save();
  context.fillStyle = "rgba(248, 246, 239, 0.94)";
  context.font = `500 ${Math.max(42, Math.min(width * 0.105, 118))}px "Yu Mincho", "Noto Serif JP", serif`;
  context.textBaseline = "alphabetic";
  context.fillText("凡愚", width * 0.025, height * 0.82);
  context.restore();
}

function drawPresetPattern(bounds, preset) {
  const { x, y, width: sceneWidth, height: sceneHeight } = bounds;
  const centerX = x + sceneWidth * 0.5;
  const centerY = y + sceneHeight * 0.5;
  const scale = Math.min(sceneWidth, sceneHeight);

  context.save();
  if (preset === "still") {
    context.globalAlpha = 0.78;
    context.fillStyle = "#7200aa";
    context.fillRect(x, y, sceneWidth * 0.37, sceneHeight * 0.56);
    context.beginPath();
    context.moveTo(x + sceneWidth * 0.26, y);
    context.lineTo(x + sceneWidth * 0.45, y);
    context.lineTo(x + sceneWidth * 0.36, y + sceneHeight * 0.37);
    context.lineTo(x + sceneWidth * 0.16, y + sceneHeight * 0.62);
    context.lineTo(x, y + sceneHeight * 0.49);
    context.closePath();
    context.fill();
    context.globalAlpha = 0.46;
    context.fillStyle = "#1b1920";
    context.fillRect(x + sceneWidth * 0.63, y + sceneHeight * 0.1, sceneWidth * 0.28, sceneHeight * 0.21);
  } else if (preset === "surge") {
    context.globalAlpha = 0.52;
    context.fillStyle = "#ed00ff";
    context.fillRect(x, y, sceneWidth, sceneHeight);
    context.globalAlpha = 0.88;
    context.fillStyle = "#11001b";
    context.beginPath();
    context.arc(centerX, centerY, scale * 0.3, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffb8ff";
    context.lineWidth = Math.max(2, scale * 0.012);
    context.beginPath();
    context.arc(centerX, centerY, scale * 0.4, 0, Math.PI * 2);
    context.stroke();
  } else if (preset === "fracture") {
    context.globalAlpha = 0.75;
    context.fillStyle = "#c5d5c7";
    context.fillRect(x, y, sceneWidth, sceneHeight * 0.47);
    context.fillStyle = "#103d36";
    const spacing = Math.max(13, scale * 0.055);
    for (let column = 0; column < Math.ceil(sceneWidth / spacing); column += 1) {
      const columnX = x + column * spacing;
      context.fillRect(columnX, y, spacing * 0.48, sceneHeight * 0.47);
      context.beginPath();
      context.moveTo(columnX + spacing * 0.48, y + sceneHeight * 0.47);
      context.lineTo(columnX + spacing, y + sceneHeight * 0.47);
      context.lineTo(columnX + spacing * 0.74, y + sceneHeight * 0.24);
      context.closePath();
      context.fill();
    }
    context.globalAlpha = 0.55;
    context.fillStyle = "#020807";
    context.fillRect(x, y + sceneHeight * 0.47, sceneWidth, sceneHeight * 0.53);
    context.strokeStyle = "#b6d2c2";
    context.lineWidth = 1;
    const tile = Math.max(20, scale * 0.09);
    for (let row = 0; row < Math.ceil(sceneHeight * 0.53 / tile) + 1; row += 1) {
      for (let column = 0; column < Math.ceil(sceneWidth / tile) + 1; column += 1) {
        const tileX = x + column * tile + (row % 2) * tile * 0.5;
        const tileY = y + sceneHeight * 0.47 + row * tile;
        context.strokeRect(tileX, tileY, tile * 0.5, tile * 0.5);
      }
    }
  } else if (preset === "burst") {
    context.globalAlpha = 0.68;
    context.strokeStyle = "#6b00b6";
    context.lineWidth = Math.max(2, scale * 0.016);
    const outerRadius = scale * 0.37;
    for (let index = 0; index < 12; index += 1) {
      const angle = index * Math.PI / 6;
      const startX = centerX + Math.cos(angle) * scale * 0.17;
      const startY = centerY + Math.sin(angle) * scale * 0.17;
      const endX = centerX + Math.cos(angle) * outerRadius;
      const endY = centerY + Math.sin(angle) * outerRadius;
      const headX = centerX + Math.cos(angle) * (outerRadius - scale * 0.08);
      const headY = centerY + Math.sin(angle) * (outerRadius - scale * 0.08);
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.moveTo(headX + Math.cos(angle + 0.6) * scale * 0.08, headY + Math.sin(angle + 0.6) * scale * 0.08);
      context.lineTo(endX, endY);
      context.lineTo(headX + Math.cos(angle - 0.6) * scale * 0.08, headY + Math.sin(angle - 0.6) * scale * 0.08);
      context.stroke();
    }
    context.fillStyle = "#180322";
    context.beginPath();
    context.arc(centerX, centerY, scale * 0.14, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawPattern(bounds, scene) {
  const { x, y, width: sceneWidth, height: sceneHeight } = bounds;
  context.save();
  context.globalAlpha = 0.9;
  context.fillStyle = scene.ink;
  context.strokeStyle = scene.ornament;

  if (scene.pattern === "violet") {
    context.globalAlpha = 0.9;
    context.beginPath();
    context.moveTo(x + sceneWidth * 0.37, y + sceneHeight * 0.78);
    context.lineTo(x + sceneWidth * 0.55, y + sceneHeight * 0.16);
    context.lineTo(x + sceneWidth * 0.73, y + sceneHeight * 0.78);
    context.closePath();
    context.fill();
    context.fillStyle = scene.ornament;
    context.fillRect(x + sceneWidth * 0.77, y + sceneHeight * 0.1, sceneWidth * 0.16, sceneHeight * 0.18);
  } else if (scene.pattern === "interference") {
    context.fillStyle = scene.ornament;
    for (let index = 0; index < 19; index += 1) {
      const step = sceneWidth / 18;
      const offset = Math.sin(index * 2.1) * 8;
      context.fillRect(x + index * step, y + offset, step * 0.42, sceneHeight * 0.38 + offset);
    }
    context.fillStyle = scene.ink;
    context.beginPath();
    context.moveTo(x + sceneWidth * 0.28, y + sceneHeight * 0.61);
    context.lineTo(x + sceneWidth * 0.49, y + sceneHeight * 0.24);
    context.lineTo(x + sceneWidth * 0.7, y + sceneHeight * 0.61);
    context.closePath();
    context.fill();
  } else if (scene.pattern === "signal") {
    context.fillStyle = scene.ornament;
    context.globalAlpha = 0.8;
    context.font = `600 ${Math.max(16, sceneHeight * 0.1)}px "Cascadia Mono", Consolas, monospace`;
    context.textAlign = "center";
    for (let row = 0; row < 5; row += 1) {
      let digits = "";
      for (let column = 0; column < 13; column += 1) {
        digits += ((row * 7 + column * 3) % 5 < 2) ? "1" : "0";
      }
      context.fillText(digits, x + sceneWidth * 0.5, y + sceneHeight * (0.18 + row * 0.16));
    }
  } else if (scene.pattern === "waves") {
    context.strokeStyle = scene.ornament;
    context.lineWidth = 1.4;
    context.globalAlpha = 0.75;
    const spacing = Math.max(15, sceneHeight * 0.085);
    const radius = spacing * 0.52;
    for (let row = 0; row < Math.ceil(sceneHeight / spacing) + 1; row += 1) {
      const offset = row % 2 ? radius : 0;
      for (let column = -1; column < Math.ceil(sceneWidth / (radius * 2)) + 1; column += 1) {
        const centerX = x + column * radius * 2 + offset;
        const centerY = y + row * spacing;
        context.beginPath();
        context.arc(centerX, centerY, radius, Math.PI, 0);
        context.stroke();
      }
    }
  } else {
    context.strokeStyle = scene.ornament;
    context.lineWidth = 2.2;
    context.globalAlpha = 0.95;
    const centerX = x + sceneWidth * 0.5;
    const centerY = y + sceneHeight * 0.48;
    for (let index = 0; index < 8; index += 1) {
      const angle = index * Math.PI / 4;
      const orbitX = centerX + Math.cos(angle) * sceneHeight * 0.29;
      const orbitY = centerY + Math.sin(angle) * sceneHeight * 0.29;
      context.save();
      context.translate(orbitX, orbitY);
      context.rotate(angle);
      context.beginPath();
      context.moveTo(-12, 0);
      context.quadraticCurveTo(0, -9, 12, 0);
      context.quadraticCurveTo(0, 9, -12, 0);
      context.stroke();
      context.restore();
    }
  }
  context.restore();
}

function drawWindowFrame(bounds, scene) {
  const { frameX, frameY, frameWidth, frameHeight } = bounds;
  context.save();
  context.strokeStyle = "#18312f";
  context.lineWidth = 5;
  context.strokeRect(frameX - 2, frameY - 2, frameWidth + 4, frameHeight + 4);
  context.fillStyle = "#345b57";
  context.fillRect(frameX, frameY, frameWidth, 13);
  context.strokeStyle = "#82a19a";
  context.lineWidth = 1;
  context.strokeRect(frameX + 0.5, frameY + 0.5, frameWidth - 1, frameHeight - 1);
  context.fillStyle = "#c8d2c8";
  context.font = '9px "Cascadia Mono", Consolas, monospace';
  context.textBaseline = "middle";
  context.fillText(`VISUAL / ${scene.label} · ${activePreset.label}`, frameX + 8, frameY + 7);
  for (let index = 0; index < 3; index += 1) {
    context.fillStyle = index === 2 ? "#bf65a6" : "#b8cebf";
    context.fillRect(frameX + frameWidth - 28 + index * 8, frameY + 4, 5, 5);
  }
  context.restore();
}

function draw(time) {
  if (!previousTime) previousTime = time;
  const deltaTime = Math.min(0.04, (time - previousTime) / 1000);
  previousTime = time;
  const bounds = compositionBounds();
  const scene = {
    ...scenes[activeSceneIndex],
    ...activePreset.palette,
    particleShape: activePreset.particleShape,
    particleSize: activePreset.particleSize,
    pattern: scenes[activeSceneIndex].pattern,
  };

  if (!paused) {
    flowField.update(deltaTime, Number(controls.energy.value));
    flocking.calculate(agents);
    for (const agent of agents) {
      agent.calculateAction({
        flowField,
        physarum,
        flocking,
        target,
        energy: Number(controls.energy.value),
        grouping: Number(controls.grouping.value),
        snap: activePreset.snap,
      });
      agent.update(deltaTime, width, height, physarum, bounds);
    }
    physarum.update(deltaTime);
  }

  context.fillStyle = "#050507";
  context.fillRect(0, 0, width, height);
  drawOutsideTypography();

  context.save();
  context.beginPath();
  context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
  context.clip();
  context.fillStyle = scene.background;
  context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  drawPresetPattern(bounds, activePresetName);
  drawPattern(bounds, scene);
  physarum.render(context, scene);
  for (const agent of agents) agent.render(context, scene);
  context.restore();
  drawGlyphCursor(scene, bounds);
  drawWindowFrame(bounds, scene);
  requestAnimationFrame(draw);
}

function drawGlyphCursor(scene, bounds) {
  if (!cursorPosition || !isInsideBounds(cursorPosition, bounds)) return;
  const glyph = toolGlyphs[activeTool];
  context.save();
  context.translate(cursorPosition.x, cursorPosition.y);
  if (activeTool === "rotate") context.rotate(flowField.orientation);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `700 ${Math.max(42, Math.min(68, width * 0.065))}px "Yu Mincho", "Noto Serif JP", "Yu Gothic", serif`;
  context.lineJoin = "round";
  context.lineWidth = 5;
  context.strokeStyle = scene.ink;
  context.shadowColor = scene.ink;
  context.shadowBlur = 12;
  context.strokeText(glyph, 0, 0);
  context.shadowBlur = 0;
  context.fillStyle = scene.accent;
  context.fillText(glyph, 0, 0);
  context.restore();
}

function isInsideBounds(position, bounds) {
  return position.x >= bounds.x
    && position.x <= bounds.x + bounds.width
    && position.y >= bounds.y
    && position.y <= bounds.y + bounds.height;
}

function setPaused(value) {
  paused = value;
  pauseToggle.textContent = paused ? "Continuar" : "Pausar";
  pauseToggle.setAttribute("aria-label", paused ? "Continuar simulación" : "Pausar simulación");
}

function toggleModifiers() {
  const hidden = modifiersToggle.getAttribute("aria-expanded") === "true";
  controlsPanel.classList.toggle("is-hidden", hidden);
  modifiersToggle.setAttribute("aria-expanded", String(!hidden));
  modifiersToggle.innerHTML = hidden
    ? 'Mostrar modificadores <kbd>H</kbd>'
    : 'Ocultar modificadores <kbd>H</kbd>';
}

function setTool(tool) {
  activeTool = tool;
  for (const button of document.querySelectorAll("[data-tool]")) {
    button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
  }
  updateReadouts();
}

function setScene(index) {
  activeSceneIndex = (index + scenes.length) % scenes.length;
  syncFlowField();
  updateReadouts();
}

function syncFlowField() {
  const scene = scenes[activeSceneIndex];
  flowField.orientation = scene.orientation + activePreset.turn;
  flowField.scale = Math.max(0.5, Math.min(5, scene.scale * activePreset.fieldScale));
}

function setPreset(name) {
  activePresetName = name;
  activePreset = presets[name];
  for (const [parameter, input] of Object.entries(controls)) {
    input.value = String(activePreset[parameter]);
  }
  for (const button of document.querySelectorAll("[data-preset]")) {
    button.setAttribute("aria-pressed", String(button.dataset.preset === name));
  }
  document.documentElement.style.setProperty("--accent", activePreset.accent);
  syncFlowField();
  updateReadouts();
  for (const agent of agents) {
    agent.maxSpeed = 0.8 + activePreset.energy * 2.6;
    agent.applyBurst(activePreset.burst);
  }
}

function pointerPosition(event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

function seedBetween(first, second) {
  const distance = Math.hypot(second.x - first.x, second.y - first.y);
  const steps = Math.max(1, Math.ceil(distance / 7));
  for (let step = 1; step <= steps; step += 1) {
    const fraction = step / steps;
    physarum.paint(
      first.x + (second.x - first.x) * fraction,
      first.y + (second.y - first.y) * fraction,
      Math.max(8, gestureRadius() * 0.14),
    );
  }
}

for (const input of Object.values(controls)) {
  input.addEventListener("input", updateReadouts);
}
document.querySelector("#volume").addEventListener("input", (event) => {
  song.volume = Number(event.currentTarget.value);
});
document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});
document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => setPreset(button.dataset.preset));
});
document.querySelector("#scene-next").addEventListener("click", () => setScene(activeSceneIndex + 1));
document.querySelector("#turn-left").addEventListener("click", () => {
  flowField.rotate(-Math.PI / 12);
  updateReadouts();
});
document.querySelector("#turn-right").addEventListener("click", () => {
  flowField.rotate(Math.PI / 12);
  updateReadouts();
});
pauseToggle.addEventListener("click", () => setPaused(!paused));
modifiersToggle.addEventListener("click", toggleModifiers);
document.querySelector("#reset").addEventListener("click", resetAgents);

audioToggle.addEventListener("click", async () => {
  if (song.paused) {
    try {
      await song.play();
    } catch (error) {
      audioStatus.textContent = `No se pudo reproducir: ${error.message}`;
      return;
    }
  } else {
    song.pause();
  }
});
song.addEventListener("play", () => {
  audioToggle.textContent = "Ⅱ";
  audioToggle.setAttribute("aria-label", "Pausar canción");
  audioStatus.textContent = "Reproduciendo";
});
song.addEventListener("pause", () => {
  audioToggle.textContent = "▶";
  audioToggle.setAttribute("aria-label", "Reproducir canción");
  if (!song.ended) audioStatus.textContent = "En pausa";
});
song.addEventListener("ended", () => {
  audioStatus.textContent = "Canción terminada";
});
song.addEventListener("error", () => {
  audioStatus.textContent = `No se pudo cargar el audio (${AUDIO_PATH})`;
});
song.addEventListener("loadedmetadata", () => {
  audioStatus.textContent = `Lista · ${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, "0")}`;
});

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  pointerDown = true;
  canvas.setPointerCapture(event.pointerId);
  cursorPosition = pointerPosition(event);
  lastPointerPosition = cursorPosition;
  if (activeTool === "attract" || activeTool === "repel") {
    target = { position: cursorPosition, repulse: activeTool === "repel", radius: gestureRadius() };
  } else if (activeTool === "seed") {
    physarum.paint(cursorPosition.x, cursorPosition.y, Math.max(8, gestureRadius() * 0.14));
  }
});
canvas.addEventListener("pointermove", (event) => {
  cursorPosition = pointerPosition(event);
  if (!pointerDown) return;
  const nextPosition = cursorPosition;
  if (activeTool === "attract" || activeTool === "repel") {
    target = { position: nextPosition, repulse: activeTool === "repel", radius: gestureRadius() };
  } else if (activeTool === "seed" && lastPointerPosition) {
    seedBetween(lastPointerPosition, nextPosition);
  } else if (activeTool === "rotate" && lastPointerPosition) {
    flowField.rotate((nextPosition.x - lastPointerPosition.x) * 0.008);
    updateReadouts();
  }
  lastPointerPosition = nextPosition;
});
canvas.addEventListener("pointerup", () => {
  pointerDown = false;
  target = null;
  lastPointerPosition = null;
});
canvas.addEventListener("pointercancel", () => {
  pointerDown = false;
  target = null;
  lastPointerPosition = null;
});
canvas.addEventListener("pointerleave", () => {
  if (!pointerDown) cursorPosition = null;
});
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  flowField.changeScale(event.deltaY > 0 ? -0.15 : 0.15);
}, { passive: false });

window.addEventListener("keydown", (event) => {
  const targetElement = event.target;
  if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) return;
  if (targetElement instanceof HTMLButtonElement && event.code === "Space") return;
  if (event.code === "Space") {
    event.preventDefault();
    setPaused(!paused);
  } else if (event.key.toLowerCase() === "h") {
    toggleModifiers();
  } else if (event.key.toLowerCase() === "r") {
    resetAgents();
  } else if (event.key.toLowerCase() === "m") {
    setScene(activeSceneIndex + 1);
  } else if (event.key === "1") {
    setTool("attract");
  } else if (event.key === "2") {
    setTool("repel");
  } else if (event.key === "3") {
    setTool("seed");
  } else if (event.key === "4") {
    setTool("rotate");
  } else if (event.key === "ArrowLeft") {
    flowField.rotate(-Math.PI / 18);
    updateReadouts();
  } else if (event.key === "ArrowRight") {
    flowField.rotate(Math.PI / 18);
    updateReadouts();
  } else if (event.key.toLowerCase() === "q") {
    setPreset("still");
  } else if (event.key.toLowerCase() === "w") {
    setPreset("surge");
  } else if (event.key.toLowerCase() === "e") {
    setPreset("fracture");
  } else if (event.key.toLowerCase() === "t") {
    setPreset("burst");
  }
});

document.querySelector("#video-reference").href = VIDEO_PATH;
window.addEventListener("resize", resize);
song.volume = Number(document.querySelector("#volume").value);
resize();
setTool("attract");
setPreset("still");
requestAnimationFrame(draw);
