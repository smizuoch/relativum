import { loadState, saveState, applyA11yState } from "./app-state.js";
import { runAnalysis } from "./analysis.js";
import { draw2DScatter } from "./viz-2d.js";
import { create3DScatter, getShapeForCluster } from "./viz-3d.js";
import { byId, createOption, formatNumber } from "./ui.js";
import { importStateFile, validateImportedState } from "./data-io.js";

let state = loadState();
applyA11yState(state);

const elements = {
  axisSelect: byId("axis-select"),
  originSelect: byId("origin-select"),
  originNote: byId("origin-note"),
  showLabels: byId("show-labels"),
  pointSize: byId("point-size"),
  downloadAnalysis: byId("download-analysis"),
  importJson: byId("import-json"),
  summary: byId("analysis-summary"),
  warning: byId("analysis-warning"),
  canvas3d: byId("canvas-3d"),
  canvas2d: byId("canvas-2d"),
  pointSelect: byId("point-select"),
  pointDetails: byId("point-details"),
  coordsTable: byId("coords-table"),
};

const viz3d = create3DScatter(elements.canvas3d, {
  showLabels: false,
  pointSize: Number(elements.pointSize.value),
  highContrast: state.settings?.viz?.highContrast,
});

let analysis = null;
let points = [];

function buildPoints() {
  analysis = runAnalysis(state);
  const labels = analysis.clustering?.labels || [];
  points = analysis.people.map((person, idx) => {
    const cluster = labels[idx] ?? 0;
    return {
      id: person.id,
      label: person.displayName,
      cluster,
      shape: getShapeForCluster(cluster),
      coords: analysis.coordsTranslated[idx] || [0, 0, 0],
    };
  });
  saveState(state);
}

function renderOriginSelect() {
  elements.originSelect.innerHTML = "";
  elements.originSelect.appendChild(createOption("", "未設定", !state.settings.selfPersonId));
  state.people.forEach((person) => {
    elements.originSelect.appendChild(
      createOption(person.id, person.displayName, person.id === state.settings.selfPersonId)
    );
  });
  const name =
    state.people.find((p) => p.id === state.settings.selfPersonId)?.displayName || "未設定";
  elements.originNote.textContent = state.settings.selfPersonId
    ? `原点 = ${name}`
    : "self 未設定の場合は原点は平均中心";
}

function renderSummary() {
  const excludedCount = analysis.excluded.length;
  const includedCount = analysis.people.length;
  const chosenK = analysis.clustering?.chosenK ?? 0;
  const minAnswers = state.settings?.analysis?.minAnswers ?? 7;
  const originName =
    state.people.find((p) => p.id === state.settings.selfPersonId)?.displayName || "平均中心";
  elements.summary.textContent = `対象 ${includedCount}人 / 除外 ${excludedCount}人 · クラスタ k=${chosenK} · 原点 ${originName} · 最小回答数 ${minAnswers}`;
  elements.warning.hidden = excludedCount === 0;
}

function renderPointSelect() {
  elements.pointSelect.innerHTML = "";
  elements.pointSelect.appendChild(createOption("", "選択してください", true));
  points.forEach((point) => {
    elements.pointSelect.appendChild(createOption(point.id, point.label));
  });
}

function renderPointDetails() {
  const selected = points.find((p) => p.id === elements.pointSelect.value);
  if (!selected) {
    elements.pointDetails.textContent = "";
    return;
  }
  const coords = selected.coords.map((value) => formatNumber(value, 3));
  elements.pointDetails.textContent = `Cluster ${selected.cluster + 1} · [${coords.join(", ")} ]`;
}

function renderTable() {
  elements.coordsTable.innerHTML = "";
  if (!points.length) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan=\"5\">データが不足しています。</td>";
    elements.coordsTable.appendChild(row);
    return;
  }
  points.forEach((point) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${point.label}</td>
      <td>Cluster ${point.cluster + 1}</td>
      <td>${formatNumber(point.coords[0])}</td>
      <td>${formatNumber(point.coords[1])}</td>
      <td>${formatNumber(point.coords[2])}</td>
    `;
    elements.coordsTable.appendChild(row);
  });
}

function renderViz() {
  const showLabels = elements.showLabels.checked;
  const pointSize = Number(elements.pointSize.value);
  state.settings.viz.labels = showLabels;
  state.settings.viz.pointSize = pointSize;
  saveState(state);
  const highContrast = state.settings?.viz?.highContrast;
  viz3d.setData(points, {
    showLabels,
    pointSize,
    highContrast,
    showAxes: true,
    showOrigin: true,
    showGrid: true,
  });
  const [a, b] = elements.axisSelect.value.split("-").map(Number);
  const data = points.map((p) => ({
    x: p.coords[a],
    y: p.coords[b],
    label: p.label,
    cluster: p.cluster,
    shape: p.shape,
  }));
  const centerOnOrigin =
    !!state.settings.selfPersonId && points.some((p) => p.id === state.settings.selfPersonId);
  draw2DScatter(elements.canvas2d, data, {
    showLabels,
    pointSize,
    highContrast,
    centerOnOrigin,
  });
}

function downloadAnalysis() {
  const payload = {
    generatedAt: new Date().toISOString(),
    people: analysis.people,
    coords: analysis.coordsTranslated,
    coordsRaw: analysis.coords,
    counts: analysis.counts,
    weights: analysis.weights,
    means: analysis.means,
    clustering: analysis.clustering,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relativum-analysis.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function bindEvents() {
  elements.axisSelect.addEventListener("change", renderViz);
  elements.showLabels.addEventListener("change", renderViz);
  elements.pointSize.addEventListener("input", renderViz);
  elements.pointSelect.addEventListener("change", renderPointDetails);
  elements.downloadAnalysis.addEventListener("click", downloadAnalysis);
  elements.originSelect.addEventListener("change", () => {
    state.settings.selfPersonId = elements.originSelect.value || null;
    buildPoints();
    renderOriginSelect();
    renderSummary();
    renderPointSelect();
    renderPointDetails();
    renderTable();
    renderViz();
  });
  elements.importJson.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!confirm("現在のデータを上書きします。続行しますか？")) {
      event.target.value = "";
      return;
    }
    try {
      const raw = await importStateFile(file);
      const validated = validateImportedState(raw);
      if (!validated.ok) {
        throw new Error(validated.error);
      }
      saveState(raw);
      state = loadState();
      applyA11yState(state);
      buildPoints();
      renderOriginSelect();
      renderSummary();
      renderPointSelect();
      renderPointDetails();
      renderTable();
      renderViz();
    } catch (err) {
      alert(`インポートに失敗しました: ${err.message}`);
    }
    event.target.value = "";
  });
  window.addEventListener("resize", renderViz);
}

buildPoints();
elements.showLabels.checked = !!state.settings?.viz?.labels;
elements.pointSize.value = state.settings?.viz?.pointSize ?? 6;
renderOriginSelect();
renderSummary();
renderPointSelect();
renderPointDetails();
renderTable();
renderViz();
bindEvents();
