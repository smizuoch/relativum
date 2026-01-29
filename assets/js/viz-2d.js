const PALETTE = [
  "#0f5d5e",
  "#d95f02",
  "#1b9e77",
  "#7570b3",
  "#e7298a",
  "#66a61e",
];

export function draw2DScatter(canvas, points, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.clearRect(0, 0, width, height);
  if (points.length === 0) {
    drawEmptyState(ctx, width, height, "データが不足しています");
    return;
  }

  const padding = 40;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scaleX = (width - padding * 2) / (maxX - minX || 1);
  const scaleY = (height - padding * 2) / (maxY - minY || 1);

  const originX = padding + (0 - minX) * scaleX;
  const originY = height - (padding + (0 - minY) * scaleY);

  ctx.strokeStyle = options.highContrast ? "#111" : "#3b3b3b";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(originX, padding);
  ctx.lineTo(originX, height - padding);
  ctx.moveTo(padding, originY);
  ctx.lineTo(width - padding, originY);
  ctx.stroke();
  ctx.setLineDash([]);

  points.forEach((point) => {
    const x = padding + (point.x - minX) * scaleX;
    const y = height - (padding + (point.y - minY) * scaleY);
    const color = PALETTE[point.cluster % PALETTE.length];
    const size = options.pointSize || 6;
    drawShape(ctx, point.shape, x, y, size, color, options.highContrast);
    if (options.showLabels) {
      ctx.fillStyle = options.highContrast ? "#111" : "#222";
      ctx.font = "12px 'IBM Plex Sans JP', 'Noto Sans JP', sans-serif";
      ctx.fillText(point.label, x + 6, y - 6);
    }
  });
}

function drawShape(ctx, shape, x, y, size, color, highContrast) {
  ctx.save();
  ctx.strokeStyle = highContrast ? "#111" : color;
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

function drawEmptyState(ctx, width, height, message) {
  ctx.fillStyle = "#666";
  ctx.font = "14px 'IBM Plex Sans JP', 'Noto Sans JP', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(message, width / 2, height / 2);
  ctx.textAlign = "left";
}
