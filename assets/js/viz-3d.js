const PALETTE = [
  "#0f5d5e",
  "#d95f02",
  "#1b9e77",
  "#7570b3",
  "#e7298a",
  "#66a61e",
];

const SHAPES = ["circle", "square", "triangle", "diamond", "cross", "circle"];
const AXIS_COLORS = {
  x: "#d95f02",
  y: "#1b9e77",
  z: "#7570b3",
};

export function create3DScatter(canvas, options = {}) {
  const ctx = canvas.getContext("2d");
  const state = {
    yaw: 0.6,
    pitch: 0.35,
    zoom: 0.75,
    dragging: false,
    lastX: 0,
    lastY: 0,
    points: [],
    options,
  };

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function project(point) {
    const [x, y, z] = point;
    const cy = Math.cos(state.yaw);
    const sy = Math.sin(state.yaw);
    const cx = Math.cos(state.pitch);
    const sx = Math.sin(state.pitch);

    const xz = x * cy + z * sy;
    const zz = -x * sy + z * cy;
    const yz = y * cx - zz * sx;
    const zz2 = y * sx + zz * cx;

    const depth = 6;
    const scale = depth / (depth + zz2 + 6);
    return {
      x: xz * scale,
      y: yz * scale,
      z: zz2,
      scale,
    };
  }

  function render() {
    resize();
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = state.options.highContrast ? "#ffffff" : "#0f1115";
    ctx.fillRect(0, 0, width, height);
    if (!state.points.length) {
      drawEmptyState(ctx, width, height, "データが不足しています", state.options.highContrast);
      return;
    }
    const projected = state.points.map((p) => {
      const proj = project(p.coords);
      return { ...p, proj };
    });
    projected.sort((a, b) => a.proj.z - b.proj.z);

    const zs = projected.map((p) => p.proj.z);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const sceneScale = getSceneScale(state.points);
    const baseScale = Math.min(width, height) * 0.35;
    const canvasScale = (baseScale / sceneScale) * (1 / state.zoom);
    const toCanvas = (proj) => ({
      x: width / 2 + proj.x * canvasScale,
      y: height / 2 - proj.y * canvasScale,
    });

    if (state.options.showGrid) {
      drawGrid(ctx, toCanvas, project, sceneScale, state.options.highContrast);
    }

    if (state.options.showAxes) {
      drawAxes(ctx, toCanvas, project, sceneScale, state.options.highContrast);
    }
    if (state.options.showOrigin) {
      drawOrigin(ctx, toCanvas(project([0, 0, 0])), state.options.highContrast);
    }

    for (const point of projected) {
      const { x, y } = toCanvas(point.proj);
      const size = (state.options.pointSize || 6) * (0.6 + point.proj.scale);
      const baseColor = PALETTE[point.cluster % PALETTE.length];
      const depthT = (point.proj.z - minZ) / (maxZ - minZ || 1);
      const color = applyDepthTint(baseColor, depthT, state.options.highContrast);
      drawShape(ctx, point.shape, x, y, size, color, state.options.highContrast);
      if (state.options.showLabels) {
        ctx.fillStyle = state.options.highContrast ? "#111" : "#e2e8f0";
        ctx.font = "12px 'IBM Plex Sans JP', 'Noto Sans JP', sans-serif";
        ctx.fillText(point.label, x + 6, y - 6);
      }
    }
  }

  function onPointerDown(event) {
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.yaw += dx * 0.01;
    state.pitch += dy * 0.01;
    state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch));
    render();
  }

  function onPointerUp(event) {
    state.dragging = false;
    canvas.releasePointerCapture(event.pointerId);
  }

  function onWheel(event) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    state.zoom = Math.min(3, Math.max(0.2, state.zoom + delta * 0.1));
    render();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  return {
    setData(points, opts = {}) {
      state.points = points || [];
      state.options = { ...state.options, ...opts };
      render();
    },
    render,
    dispose() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    },
  };
}

export function getShapeForCluster(clusterId) {
  return SHAPES[clusterId % SHAPES.length] || "circle";
}

function getSceneScale(points) {
  const maxAbs = points.reduce(
    (acc, p) => Math.max(acc, Math.abs(p.coords[0]), Math.abs(p.coords[1]), Math.abs(p.coords[2])),
    0
  );
  return Math.max(1, maxAbs * 1.4);
}

function drawAxes(ctx, toCanvas, project, sceneScale, highContrast) {
  const length = sceneScale * 0.85;
  const origin = project([0, 0, 0]);
  const axes = [
    { label: "PC1", color: AXIS_COLORS.x, end: project([length, 0, 0]) },
    { label: "PC2", color: AXIS_COLORS.y, end: project([0, length, 0]) },
    { label: "PC3", color: AXIS_COLORS.z, end: project([0, 0, length]) },
  ];
  axes.forEach((axis) => {
    const start = toCanvas(origin);
    const end = toCanvas(axis.end);
    ctx.save();
    ctx.strokeStyle = highContrast ? "#111" : axis.color;
    ctx.fillStyle = highContrast ? "#111" : axis.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    drawArrowhead(ctx, start, end, 8);
    ctx.font = "12px 'IBM Plex Sans JP', 'Noto Sans JP', sans-serif";
    ctx.fillText(axis.label, end.x + 6, end.y + 4);
    ctx.restore();
  });
}

function drawGrid(ctx, toCanvas, project, sceneScale, highContrast) {
  const step = sceneScale / 5;
  const color = highContrast ? "#444" : "rgba(148, 163, 184, 0.35)";
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = -sceneScale; i <= sceneScale; i += step) {
    const start = toCanvas(project([i, 0, -sceneScale]));
    const end = toCanvas(project([i, 0, sceneScale]));
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const start2 = toCanvas(project([-sceneScale, 0, i]));
    const end2 = toCanvas(project([sceneScale, 0, i]));
    ctx.beginPath();
    ctx.moveTo(start2.x, start2.y);
    ctx.lineTo(end2.x, end2.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrigin(ctx, point, highContrast) {
  ctx.save();
  ctx.strokeStyle = highContrast ? "#111" : "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(point.x - 8, point.y);
  ctx.lineTo(point.x + 8, point.y);
  ctx.moveTo(point.x, point.y - 8);
  ctx.lineTo(point.x, point.y + 8);
  ctx.stroke();
  ctx.restore();
}

function drawArrowhead(ctx, start, end, size) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - size * Math.cos(angle - Math.PI / 6), end.y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(end.x - size * Math.cos(angle + Math.PI / 6), end.y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function applyDepthTint(color, depthT, highContrast) {
  if (highContrast) return color;
  const clamped = Math.max(0, Math.min(1, depthT));
  const tint = 0.1 + 0.5 * clamped;
  return mixColors(color, "#ffffff", tint);
}

function mixColors(a, b, amount) {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return a;
  const mix = (x, y) => Math.round(x + (y - x) * amount);
  return `rgb(${mix(rgbA.r, rgbB.r)}, ${mix(rgbA.g, rgbB.g)}, ${mix(rgbA.b, rgbB.b)})`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return null;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function drawShape(ctx, shape, x, y, size, color, highContrast) {
  ctx.save();
  ctx.strokeStyle = highContrast ? "#111" : "#101218";
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  const half = size / 2;
  switch (shape) {
    case "square":
      ctx.beginPath();
      ctx.rect(x - half, y - half, size, size);
      ctx.fill();
      ctx.stroke();
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(x, y - half);
      ctx.lineTo(x + half, y + half);
      ctx.lineTo(x - half, y + half);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case "diamond":
      ctx.beginPath();
      ctx.moveTo(x, y - half);
      ctx.lineTo(x + half, y);
      ctx.lineTo(x, y + half);
      ctx.lineTo(x - half, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case "cross":
      ctx.beginPath();
      ctx.moveTo(x - half, y);
      ctx.lineTo(x + half, y);
      ctx.moveTo(x, y - half);
      ctx.lineTo(x, y + half);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, half, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawEmptyState(ctx, width, height, message, highContrast) {
  ctx.fillStyle = highContrast ? "#444" : "#cbd5f0";
  ctx.font = "14px 'IBM Plex Sans JP', 'Noto Sans JP', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(message, width / 2, height / 2);
  ctx.textAlign = "left";
}
