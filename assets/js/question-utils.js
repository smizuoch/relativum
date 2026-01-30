import { QUESTIONS, QUESTION_BY_ID, SIMPLE_QUESTION_IDS, getQuestionText } from "./questions.js";
import { resolveLanguage } from "./i18n.js";

const QUESTION_MODES = {
  simple: "simple",
  detailed: "detailed",
};

function normalizeQuestionMode(mode) {
  return mode === QUESTION_MODES.detailed ? QUESTION_MODES.detailed : QUESTION_MODES.simple;
}

export function getQuestionMode(state) {
  return normalizeQuestionMode(state?.settings?.questionMode);
}

export function getBaseQuestions(mode) {
  const normalized = normalizeQuestionMode(mode);
  if (normalized === QUESTION_MODES.detailed) {
    return QUESTIONS;
  }
  return SIMPLE_QUESTION_IDS.map((id) => QUESTION_BY_ID[id]).filter(Boolean);
}

export function getAllQuestions(state, modeOverride = null, languageOverride = null) {
  const base = getBaseQuestions(modeOverride ?? getQuestionMode(state));
  const language = languageOverride || resolveLanguage(state);
  const localizedBase = base.map((q) => ({
    ...q,
    text: getQuestionText(q, language),
  }));
  const custom = Array.isArray(state?.customQuestions) ? state.customQuestions : [];
  const normalizedCustom = custom
    .filter((q) => q && q.id && q.text)
    .map((q) => ({
      id: q.id,
      text: q.text,
      weight: Number.isFinite(q.weight) ? q.weight : 1.0,
      custom: true,
    }));
  return [...localizedBase, ...normalizedCustom];
}

export function createCustomQuestion(text) {
  const id = `U${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return {
    id,
    text: String(text || "").trim(),
    weight: 1.0,
    custom: true,
  };
}

export function getQuestionModes() {
  return { ...QUESTION_MODES };
}
