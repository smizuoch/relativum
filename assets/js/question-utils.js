import { QUESTIONS } from "./questions.js";

export function getAllQuestions(state) {
  const custom = Array.isArray(state?.customQuestions) ? state.customQuestions : [];
  const normalizedCustom = custom
    .filter((q) => q && q.id && q.text)
    .map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category || "Custom",
      weight: Number.isFinite(q.weight) ? q.weight : 1.0,
      custom: true,
    }));
  return [...QUESTIONS, ...normalizedCustom];
}

export function getQuestionCategories(state) {
  const categories = new Set();
  getAllQuestions(state).forEach((q) => {
    if (q.category) categories.add(q.category);
  });
  return Array.from(categories);
}

export function createCustomQuestion(text, category) {
  const id = `U${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return {
    id,
    text: String(text || "").trim(),
    category: String(category || "Custom").trim() || "Custom",
    weight: 1.0,
    custom: true,
  };
}
