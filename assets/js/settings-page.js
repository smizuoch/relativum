import { QUESTIONS } from "./questions.js";
import { applyA11yState, loadState, resetState, saveState } from "./app-state.js";
import { byId, createOption } from "./ui.js";

let state = loadState();
applyA11yState(state);

const elements = {
  selfSelect: byId("self-select"),
  reduceMotion: byId("reduce-motion"),
  highContrast: byId("high-contrast"),
  fontScale: byId("font-scale"),
  minAnswers: byId("min-answers"),
  stabilityWins: byId("stability-wins"),
  participationScaling: byId("participation-scaling"),
  weightsList: byId("weights-list"),
  resetData: byId("reset-data"),
};

function persist() {
  saveState(state);
  applyA11yState(state);
}

function renderSelfSelect() {
  elements.selfSelect.innerHTML = "";
  elements.selfSelect.appendChild(createOption("", "未設定", !state.settings.selfPersonId));
  state.people.forEach((person) => {
    elements.selfSelect.appendChild(
      createOption(person.id, person.displayName, person.id === state.settings.selfPersonId)
    );
  });
}

function renderWeights() {
  elements.weightsList.innerHTML = "";
  QUESTIONS.forEach((question) => {
    const row = document.createElement("div");
    row.className = "person-row";
    const label = document.createElement("div");
    label.innerHTML = `<strong>${question.id}</strong> ${question.text}<div class="small">${question.category}</div>`;

    const inputWrap = document.createElement("div");
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "2";
    input.step = "0.1";
    input.value = state.settings.weights[question.id] ?? 1;
    input.setAttribute("aria-label", `${question.id} 重み`);
    input.addEventListener("input", () => {
      const value = Number(input.value);
      state.settings.weights[question.id] = Number.isFinite(value) ? value : 1;
      persist();
    });
    inputWrap.appendChild(input);

    row.appendChild(label);
    row.appendChild(inputWrap);
    elements.weightsList.appendChild(row);
  });
}

function bindEvents() {
  elements.selfSelect.addEventListener("change", () => {
    const value = elements.selfSelect.value;
    state.settings.selfPersonId = value || null;
    persist();
  });

  elements.reduceMotion.addEventListener("change", () => {
    state.settings.viz.reduceMotion = elements.reduceMotion.checked;
    persist();
  });

  elements.highContrast.addEventListener("change", () => {
    state.settings.viz.highContrast = elements.highContrast.checked;
    persist();
  });

  elements.fontScale.addEventListener("input", () => {
    state.settings.viz.fontScale = Number(elements.fontScale.value);
    persist();
  });

  elements.minAnswers.addEventListener("input", () => {
    const value = Number(elements.minAnswers.value);
    state.settings.analysis.minAnswers = Number.isFinite(value) ? value : 7;
    persist();
  });

  elements.stabilityWins.addEventListener("input", () => {
    const value = Number(elements.stabilityWins.value);
    state.settings.analysis.stabilityWins = Number.isFinite(value) ? value : 4;
    persist();
  });

  elements.participationScaling.addEventListener("change", () => {
    state.settings.analysis.participationScaling = elements.participationScaling.checked;
    persist();
  });

  elements.resetData.addEventListener("click", () => {
    if (!confirm("ローカルデータをすべて削除しますか？")) return;
    resetState();
    location.reload();
  });
}

function initControls() {
  elements.reduceMotion.checked = !!state.settings.viz.reduceMotion;
  elements.highContrast.checked = !!state.settings.viz.highContrast;
  elements.fontScale.value = state.settings.viz.fontScale || 1;
  elements.minAnswers.value = state.settings.analysis.minAnswers ?? 7;
  elements.stabilityWins.value = state.settings.analysis.stabilityWins ?? 4;
  elements.participationScaling.checked = !!state.settings.analysis.participationScaling;
}

renderSelfSelect();
renderWeights();
initControls();
bindEvents();
