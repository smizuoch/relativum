import { getAllQuestions, getQuestionMode, getQuestionModes } from "./question-utils.js";
import {
  applyA11yState,
  createPerson,
  ensureRatingsForPerson,
  getAnsweredCount,
  getRating,
  loadState,
  saveState,
  setRating,
} from "./app-state.js";
import { exportState, importStateFile, validateImportedState } from "./data-io.js";
import { byId, announce, createOption } from "./ui.js";
import { applyTranslations, getTranslator, resolveLanguage } from "./i18n.js";

let state = loadState();
applyA11yState(state);
applyTranslations(state);
let currentPersonId = state.settings?.lastPersonId || null;

const elements = {
  newName: byId("new-person-name"),
  addPerson: byId("add-person"),
  peopleList: byId("people-list"),
  personSelect: byId("person-select"),
  modeSelect: byId("mode-select"),
  questionList: byId("question-list"),
  progressText: byId("progress-text"),
  exportJson: byId("export-json"),
  importJson: byId("import-json"),
  status: byId("status"),
};

function t(key, vars) {
  return getTranslator(state).t(key, vars);
}

function persist() {
  state.settings.lastPersonId = currentPersonId;
  saveState(state);
}

function renderPeopleList() {
  elements.peopleList.innerHTML = "";
  if (!state.people.length) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = t("index.emptyPeople");
    elements.peopleList.appendChild(empty);
    return;
  }
  state.people.forEach((person) => {
    const row = document.createElement("div");
    row.className = "person-row";

    const fields = document.createElement("div");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = person.displayName;
    nameInput.setAttribute("aria-label", t("index.nameAria", { name: person.displayName }));
    nameInput.addEventListener("input", () => {
      person.displayName = nameInput.value;
      renderPersonSelect();
      persist();
    });
    const notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.placeholder = t("index.notesPlaceholder");
    notesInput.value = person.notes || "";
    notesInput.addEventListener("input", () => {
      person.notes = notesInput.value;
      persist();
    });
    fields.appendChild(nameInput);
    fields.appendChild(notesInput);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const selectButton = document.createElement("button");
    selectButton.className = "secondary";
    selectButton.textContent = t("index.answerButton");
    selectButton.addEventListener("click", () => {
      currentPersonId = person.id;
      renderPersonSelect();
      renderQuestions();
      persist();
    });
    const deleteButton = document.createElement("button");
    deleteButton.className = "secondary";
    deleteButton.textContent = t("index.deleteButton");
    deleteButton.addEventListener("click", () => {
      if (!confirm(t("index.deleteConfirm"))) return;
      state.people = state.people.filter((p) => p.id !== person.id);
      delete state.ratings[person.id];
      if (currentPersonId === person.id) {
        currentPersonId = state.people[0]?.id || null;
      }
      renderPeopleList();
      renderPersonSelect();
      renderQuestions();
      persist();
    });
    actions.appendChild(selectButton);
    actions.appendChild(deleteButton);

    row.appendChild(fields);
    row.appendChild(actions);
    elements.peopleList.appendChild(row);
  });
}

function renderPersonSelect() {
  elements.personSelect.innerHTML = "";
  state.people.forEach((person) => {
    elements.personSelect.appendChild(createOption(person.id, person.displayName, person.id === currentPersonId));
  });
  if (!currentPersonId && state.people.length) {
    currentPersonId = state.people[0].id;
  }
  elements.personSelect.disabled = !state.people.length;
}

function renderModeSelect() {
  const modes = getQuestionModes();
  const current = getQuestionMode(state);
  elements.modeSelect.innerHTML = "";
  const labels = {
    [modes.simple]: t("index.modeSimple"),
    [modes.detailed]: t("index.modeDetailed"),
  };
  Object.values(modes).forEach((mode) => {
    elements.modeSelect.appendChild(createOption(mode, labels[mode] || mode, mode === current));
  });
}

function renderQuestions() {
  elements.questionList.innerHTML = "";
  const questions = getAllQuestions(state);
  const questionIds = questions.map((q) => q.id);
  if (!currentPersonId) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = t("index.selectPersonFirst");
    elements.questionList.appendChild(empty);
    elements.progressText.textContent = t("index.progress", { answered: 0, total: questions.length });
    return;
  }
  ensureRatingsForPerson(state, currentPersonId);

  questions.forEach((question) => {
    const item = document.createElement("div");
    item.className = "question-item";
    const title = document.createElement("h4");
    title.textContent = `${question.id} ${question.text}`;
    item.appendChild(title);

    const group = document.createElement("div");
    group.className = "radio-group";
    const options = [
      { label: t("index.ratingPositive"), value: "1" },
      { label: t("index.ratingNegative"), value: "-1" },
      { label: t("index.ratingUnknown"), value: "0" },
      { label: t("index.ratingUnanswered"), value: "null" },
    ];
    const currentValue = getRating(state, currentPersonId, question.id);

    options.forEach((opt) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q-${question.id}`;
      input.value = opt.value;
      if (
        (currentValue === null && opt.value === "null") ||
        (currentValue !== null && String(currentValue) === opt.value)
      ) {
        input.checked = true;
      }
      input.addEventListener("change", () => {
        const value = input.value === "null" ? null : Number(input.value);
        setRating(state, currentPersonId, question.id, value);
        persist();
        updateProgress();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt.label));
      group.appendChild(label);
    });

    item.appendChild(group);
    elements.questionList.appendChild(item);
  });

  updateProgress(questionIds);
}

function updateProgress(questionIds = null) {
  if (!currentPersonId) return;
  const ids = questionIds || getAllQuestions(state).map((q) => q.id);
  const answered = getAnsweredCount(state, currentPersonId, ids);
  elements.progressText.textContent = t("index.progress", { answered, total: ids.length });
}

function addPerson() {
  const name = elements.newName.value.trim();
  if (!name) {
    announce(t("index.nameRequired"), elements.status);
    return;
  }
  const person = createPerson(name, resolveLanguage(state));
  state.people.push(person);
  ensureRatingsForPerson(state, person.id);
  currentPersonId = person.id;
  elements.newName.value = "";
  renderPeopleList();
  renderPersonSelect();
  renderQuestions();
  persist();
  announce(t("index.added"), elements.status);
}

function bindEvents() {
  elements.addPerson.addEventListener("click", addPerson);
  elements.newName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addPerson();
    }
  });
  elements.personSelect.addEventListener("change", () => {
    currentPersonId = elements.personSelect.value;
    renderQuestions();
    persist();
  });
  elements.modeSelect.addEventListener("change", () => {
    state.settings.questionMode = elements.modeSelect.value;
    renderQuestions();
    persist();
  });
  elements.exportJson.addEventListener("click", () => exportState(state));
  elements.importJson.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!confirm(t("common.importConfirm"))) {
      event.target.value = "";
      return;
    }
    try {
      const raw = await importStateFile(file);
      const validated = validateImportedState(raw);
      if (!validated.ok) {
        const message = validated.errorKey ? t(validated.errorKey) : validated.error;
        throw new Error(message);
      }
      saveState(raw);
      state = loadState();
      currentPersonId = state.settings?.lastPersonId || state.people[0]?.id || null;
      applyA11yState(state);
      applyTranslations(state);
      renderModeSelect();
      renderPeopleList();
      renderPersonSelect();
      renderQuestions();
      persist();
      announce(t("common.imported"), elements.status);
    } catch (err) {
      announce(t("common.importFailed", { error: err.message }), elements.status);
    }
    event.target.value = "";
  });
}

renderModeSelect();
renderPeopleList();
renderPersonSelect();
renderQuestions();
bindEvents();
