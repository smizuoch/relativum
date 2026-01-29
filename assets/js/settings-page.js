import { getAllQuestions, createCustomQuestion } from "./question-utils.js";
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
  customQuestionText: byId("custom-question-text"),
  addCustomQuestion: byId("add-custom-question"),
  customQuestionsList: byId("custom-questions-list"),
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
  const questions = getAllQuestions(state);
  elements.minAnswers.max = String(questions.length);
  questions.forEach((question) => {
    const row = document.createElement("div");
    row.className = "person-row";
    const label = document.createElement("div");
    label.innerHTML = `<strong>${question.id}</strong> ${question.text}`;

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

function renderCustomQuestions() {
  elements.customQuestionsList.innerHTML = "";
  const custom = Array.isArray(state.customQuestions) ? state.customQuestions : [];
  if (!custom.length) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = "カスタム質問はまだありません。";
    elements.customQuestionsList.appendChild(empty);
    return;
  }
  custom.forEach((question) => {
    const row = document.createElement("div");
    row.className = "person-row";
    const fields = document.createElement("div");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = question.text;
    textInput.setAttribute("aria-label", `${question.id} 質問文`);
    textInput.addEventListener("input", () => {
      question.text = textInput.value;
      persist();
      renderWeights();
    });
    fields.appendChild(textInput);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const removeButton = document.createElement("button");
    removeButton.className = "secondary";
    removeButton.textContent = "削除";
    removeButton.addEventListener("click", () => {
      if (!confirm("このカスタム質問を削除しますか？")) return;
      state.customQuestions = custom.filter((q) => q.id !== question.id);
      delete state.settings.weights[question.id];
      persist();
      renderCustomQuestions();
      renderWeights();
    });
    actions.appendChild(removeButton);

    row.appendChild(fields);
    row.appendChild(actions);
    elements.customQuestionsList.appendChild(row);
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

  elements.addCustomQuestion.addEventListener("click", () => {
    const text = elements.customQuestionText.value.trim();
    if (!text) return;
    const question = createCustomQuestion(text);
    state.customQuestions = Array.isArray(state.customQuestions) ? state.customQuestions : [];
    state.customQuestions.push(question);
    state.settings.weights[question.id] = 1;
    elements.customQuestionText.value = "";
    persist();
    renderCustomQuestions();
    renderWeights();
  });

  elements.customQuestionText.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      elements.addCustomQuestion.click();
    }
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
renderCustomQuestions();
renderWeights();
initControls();
bindEvents();
