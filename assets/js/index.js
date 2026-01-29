import { QUESTIONS, QUESTION_CATEGORIES } from "./questions.js";
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

let state = loadState();
applyA11yState(state);
let currentPersonId = state.settings?.lastPersonId || null;

const elements = {
  newName: byId("new-person-name"),
  addPerson: byId("add-person"),
  peopleList: byId("people-list"),
  personSelect: byId("person-select"),
  categoryFilter: byId("category-filter"),
  questionList: byId("question-list"),
  progressText: byId("progress-text"),
  exportJson: byId("export-json"),
  importJson: byId("import-json"),
  status: byId("status"),
};

function persist() {
  state.settings.lastPersonId = currentPersonId;
  saveState(state);
}

function renderPeopleList() {
  elements.peopleList.innerHTML = "";
  if (!state.people.length) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = "まだ登録がありません。";
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
    nameInput.setAttribute("aria-label", `${person.displayName} の名前`);
    nameInput.addEventListener("input", () => {
      person.displayName = nameInput.value;
      renderPersonSelect();
      persist();
    });
    const notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.placeholder = "メモ (任意)";
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
    selectButton.textContent = "回答する";
    selectButton.addEventListener("click", () => {
      currentPersonId = person.id;
      renderPersonSelect();
      renderQuestions();
      persist();
    });
    const deleteButton = document.createElement("button");
    deleteButton.className = "secondary";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      if (!confirm("この人を削除しますか？")) return;
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

function renderCategoryFilter() {
  elements.categoryFilter.innerHTML = "";
  elements.categoryFilter.appendChild(createOption("all", "すべて", true));
  QUESTION_CATEGORIES.forEach((category) => {
    elements.categoryFilter.appendChild(createOption(category, category, false));
  });
}

function renderQuestions() {
  elements.questionList.innerHTML = "";
  if (!currentPersonId) {
    const empty = document.createElement("p");
    empty.className = "small";
    empty.textContent = "先に対象の人を選択してください。";
    elements.questionList.appendChild(empty);
    elements.progressText.textContent = "回答: 0/36";
    return;
  }
  const filter = elements.categoryFilter.value;
  const selectedQuestions = filter === "all" ? QUESTIONS : QUESTIONS.filter((q) => q.category === filter);
  ensureRatingsForPerson(state, currentPersonId);

  selectedQuestions.forEach((question) => {
    const item = document.createElement("div");
    item.className = "question-item";
    const title = document.createElement("h4");
    title.textContent = `${question.id} ${question.text}`;
    item.appendChild(title);

    const group = document.createElement("div");
    group.className = "radio-group";
    const options = [
      { label: "+1 思う", value: "1" },
      { label: "-1 思わない", value: "-1" },
      { label: "0 わからない", value: "0" },
      { label: "未回答", value: "null" },
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

  updateProgress();
}

function updateProgress() {
  if (!currentPersonId) return;
  const answered = getAnsweredCount(state, currentPersonId);
  elements.progressText.textContent = `回答: ${answered}/36`;
}

function addPerson() {
  const name = elements.newName.value.trim();
  if (!name) {
    announce("名前を入力してください。", elements.status);
    return;
  }
  const person = createPerson(name);
  state.people.push(person);
  ensureRatingsForPerson(state, person.id);
  currentPersonId = person.id;
  elements.newName.value = "";
  renderPeopleList();
  renderPersonSelect();
  renderQuestions();
  persist();
  announce("追加しました。", elements.status);
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
  elements.categoryFilter.addEventListener("change", renderQuestions);
  elements.exportJson.addEventListener("click", () => exportState(state));
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
      currentPersonId = state.settings?.lastPersonId || state.people[0]?.id || null;
      applyA11yState(state);
      renderPeopleList();
      renderPersonSelect();
      renderQuestions();
      persist();
      announce("インポートしました。", elements.status);
    } catch (err) {
      announce(`インポートに失敗しました: ${err.message}`, elements.status);
    }
    event.target.value = "";
  });
}

renderCategoryFilter();
renderPeopleList();
renderPersonSelect();
renderQuestions();
bindEvents();
