import { QUESTIONS } from "./questions.js";

const STORAGE_KEY = "relativum-state-v1";

export function createDefaultState() {
  const weights = Object.fromEntries(QUESTIONS.map((q) => [q.id, 1.0]));
  return {
    version: 1,
    people: [],
    ratings: {},
    customQuestions: [],
    settings: {
      selfPersonId: null,
      questionMode: "simple",
      weights,
      viz: {
        labels: true,
        pointSize: 6,
        reduceMotion: false,
        highContrast: false,
        fontScale: 1,
      },
      analysis: {
        minAnswers: 7,
        participationScaling: true,
        stabilityWins: 4,
      },
      lastPersonId: null,
    },
    analysisHistory: {
      lastBestK: null,
      streak: 0,
      chosenK: null,
    },
  };
}

export function loadState() {
  const defaultState = createDefaultState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }
  try {
    const parsed = JSON.parse(raw);
    return mergeState(defaultState, parsed);
  } catch (err) {
    console.warn("Failed to parse state, resetting.", err);
    return defaultState;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

function mergeState(base, incoming) {
  const state = { ...base, ...incoming };
  state.people = Array.isArray(incoming?.people) ? incoming.people : base.people;
  state.ratings = typeof incoming?.ratings === "object" && incoming.ratings ? incoming.ratings : base.ratings;
  state.customQuestions = Array.isArray(incoming?.customQuestions) ? incoming.customQuestions : base.customQuestions;
  state.settings = {
    ...base.settings,
    ...(incoming?.settings || {}),
  };
  const incomingMode = incoming?.settings?.questionMode;
  if (incomingMode === "simple" || incomingMode === "detailed") {
    state.settings.questionMode = incomingMode;
  } else {
    state.settings.questionMode = base.settings.questionMode;
  }
  state.settings.viz = { ...base.settings.viz, ...(incoming?.settings?.viz || {}) };
  state.settings.analysis = { ...base.settings.analysis, ...(incoming?.settings?.analysis || {}) };
  state.settings.weights = { ...base.settings.weights, ...(incoming?.settings?.weights || {}) };

  state.analysisHistory = {
    ...base.analysisHistory,
    ...(incoming?.analysisHistory || {}),
  };

  // Ensure all weights exist and are numeric.
  for (const q of QUESTIONS) {
    const value = Number(state.settings.weights[q.id]);
    state.settings.weights[q.id] = Number.isFinite(value) ? value : 1.0;
  }
  for (const q of state.customQuestions || []) {
    const value = Number(state.settings.weights?.[q.id]);
    state.settings.weights[q.id] = Number.isFinite(value) ? value : 1.0;
  }

  // Drop ratings for removed people if any.
  const peopleIds = new Set(state.people.map((p) => p.id));
  Object.keys(state.ratings || {}).forEach((personId) => {
    if (!peopleIds.has(personId)) {
      delete state.ratings[personId];
    }
  });

  return state;
}

export function createPerson(displayName) {
  const safeName = String(displayName || "").trim();
  return {
    id: `p_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    displayName: safeName || "(無名)",
    notes: "",
  };
}

export function ensureRatingsForPerson(state, personId) {
  if (!state.ratings[personId]) {
    state.ratings[personId] = {};
  }
  return state.ratings[personId];
}

export function setRating(state, personId, questionId, value) {
  const ratings = ensureRatingsForPerson(state, personId);
  ratings[questionId] = value;
}

export function getRating(state, personId, questionId) {
  return state.ratings?.[personId]?.[questionId] ?? null;
}

export function getAnsweredCount(state, personId, questionIds = null) {
  const ratings = state.ratings?.[personId] || {};
  const ids = Array.isArray(questionIds) ? questionIds : Object.keys(ratings);
  let count = 0;
  ids.forEach((qid) => {
    const v = ratings[qid];
    if (v === 0 || v === 1 || v === -1) {
      count += 1;
    }
  });
  return count;
}

export function applyA11yState(state) {
  const { reduceMotion, highContrast, fontScale } = state.settings.viz;
  const root = document.documentElement;
  root.style.setProperty("--font-scale", String(fontScale || 1));
  document.body.classList.toggle("reduce-motion", !!reduceMotion);
  document.body.classList.toggle("high-contrast", !!highContrast);
}
