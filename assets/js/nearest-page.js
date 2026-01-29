import { loadState, saveState, applyA11yState } from "./app-state.js";
import { runAnalysis } from "./analysis.js";
import { getAllQuestions } from "./question-utils.js";
import { byId, createOption, formatNumber } from "./ui.js";

let state = loadState();
applyA11yState(state);

const elements = {
  referenceSelect: byId("reference-select"),
  metricSelect: byId("metric-select"),
  note: byId("reference-note"),
  table: byId("nearest-table"),
};

let analysis = null;

function buildAnalysis() {
  analysis = runAnalysis(state);
  saveState(state);
}

function renderReferenceOptions() {
  elements.referenceSelect.innerHTML = "";
  const self = state.settings?.selfPersonId;
  if (!self) {
    elements.referenceSelect.appendChild(createOption("centroid", "重心 (全体の中心)", true));
  } else {
    const selfPerson = state.people.find((p) => p.id === self);
    elements.referenceSelect.appendChild(createOption(self, `自己 (${selfPerson?.displayName || "未設定"})`, true));
  }
  state.people.forEach((person) => {
    elements.referenceSelect.appendChild(createOption(person.id, person.displayName));
  });
  if (!state.people.length) {
    elements.referenceSelect.disabled = true;
  }
}

function getReferenceCoords(metric) {
  const ref = elements.referenceSelect.value;
  const coords = analysis.coordsTranslated;
  if (ref === "centroid") {
    const dims = coords[0]?.length || 3;
    const sum = Array(dims).fill(0);
    coords.forEach((row) => {
      for (let d = 0; d < dims; d += 1) sum[d] += row[d];
    });
    return sum.map((v) => v / coords.length);
  }
  const idx = analysis.people.findIndex((p) => p.id === ref);
  if (idx === -1) return coords[0] || [0, 0, 0];
  return coords[idx];
}

function distanceEmbedding(idx, referenceCoords) {
  const coords = analysis.coordsTranslated[idx];
  let sum = 0;
  for (let i = 0; i < coords.length; i += 1) {
    const d = coords[i] - referenceCoords[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function distanceRaw(personId, referenceId) {
  const weights = state.settings?.weights || {};
  const ratingsA = state.ratings?.[personId] || {};
  const ratingsB = state.ratings?.[referenceId] || {};
  let sum = 0;
  let count = 0;
  getAllQuestions(state).forEach((q) => {
    const a = ratingsA[q.id];
    const b = ratingsB[q.id];
    if ((a === 1 || a === 0 || a === -1) && (b === 1 || b === 0 || b === -1)) {
      const w = Number(weights[q.id] ?? 1);
      const diff = (a - b) * w;
      sum += diff * diff;
      count += 1;
    }
  });
  if (count === 0) return null;
  return Math.sqrt(sum / count);
}

function highlightDifferences(personId, referenceId) {
  const weights = state.settings?.weights || {};
  const ratingsA = state.ratings?.[personId] || {};
  const ratingsB = state.ratings?.[referenceId] || {};
  const diffs = [];
  getAllQuestions(state).forEach((q) => {
    const a = ratingsA[q.id];
    const b = ratingsB[q.id];
    if ((a === 1 || a === 0 || a === -1) && (b === 1 || b === 0 || b === -1)) {
      const w = Number(weights[q.id] ?? 1);
      const diff = Math.abs(a - b) * w;
      if (diff > 0) {
        diffs.push({ id: q.id, diff, a, b, text: q.text });
      }
    }
  });
  diffs.sort((x, y) => y.diff - x.diff);
  const top = diffs.slice(0, 2).map((d) => `${d.id}: ${d.a}/${d.b}`);
  return top.join(" · ") || "一致度が高い";
}

function renderTable() {
  elements.table.innerHTML = "";
  if (!analysis.people.length) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan=\"5\">データが不足しています。</td>";
    elements.table.appendChild(row);
    return;
  }

  const metric = elements.metricSelect.value;
  const referenceId = elements.referenceSelect.value;
  const referenceCoords = metric === "embedding" ? getReferenceCoords(metric) : null;

  const rows = analysis.people.map((person, idx) => {
    const cluster = analysis.clustering?.labels?.[idx] ?? 0;
    let distance = null;
    if (metric === "embedding") {
      distance = distanceEmbedding(idx, referenceCoords);
    } else if (referenceId !== "centroid") {
      distance = distanceRaw(person.id, referenceId);
    }
    return {
      person,
      cluster,
      distance,
      highlight: referenceId !== "centroid" ? highlightDifferences(person.id, referenceId) : "-",
    };
  });

  rows.sort((a, b) => {
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.person.displayName}</td>
      <td>${row.distance == null ? "-" : formatNumber(row.distance, 3)}</td>
      <td>Cluster ${row.cluster + 1}</td>
      <td>${row.highlight}</td>
    `;
    elements.table.appendChild(tr);
  });
}

function updateNote() {
  if (state.settings?.selfPersonId) {
    elements.note.textContent = "selfPersonId が設定されている場合は自己が基準になります。";
  } else {
    elements.note.textContent = "self が未設定の場合は重心、または任意の人を基準にできます。";
  }
}

function bindEvents() {
  elements.referenceSelect.addEventListener("change", renderTable);
  elements.metricSelect.addEventListener("change", renderTable);
}

buildAnalysis();
renderReferenceOptions();
updateNote();
renderTable();
bindEvents();
