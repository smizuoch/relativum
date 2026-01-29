import { createDefaultState } from "./app-state.js";

export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relativum-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importStateFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function validateImportedState(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "JSONの形式が不正です。" };
  }
  if (!Array.isArray(raw.people) || typeof raw.ratings !== "object") {
    return { ok: false, error: "people または ratings が不足しています。" };
  }
  return { ok: true, value: raw };
}

export function sampleState() {
  const state = createDefaultState();
  state.people = [
    { id: "p_self", displayName: "自分", notes: "サンプル" },
    { id: "p_a", displayName: "Aさん", notes: "チーム" },
    { id: "p_b", displayName: "Bさん", notes: "友人" },
  ];
  state.settings.selfPersonId = "p_self";
  state.ratings = {
    p_self: {
      Q01: 1,
      Q02: -1,
      Q03: 1,
      Q04: -1,
      Q05: 1,
      Q06: 0,
      Q07: 1,
      Q08: -1,
      Q09: 1,
      Q10: -1,
      Q11: 1,
      Q12: -1,
      Q13: 1,
      Q14: -1,
      Q15: 1,
      Q16: 0,
      Q17: 1,
      Q18: -1,
      Q19: 1,
      Q20: -1,
      Q21: 1,
      Q22: -1,
      Q23: 1,
      Q24: -1,
      Q25: 1,
      Q26: -1,
      Q27: 1,
      Q28: -1,
      Q29: 1,
      Q30: -1,
      Q31: 1,
      Q32: -1,
      Q33: 1,
      Q34: -1,
      Q35: 1,
      Q36: -1,
    },
    p_a: {
      Q01: 1,
      Q02: 0,
      Q03: 1,
      Q04: 0,
      Q05: 1,
      Q06: -1,
      Q07: 1,
      Q08: 0,
      Q09: 1,
      Q10: 0,
      Q11: 1,
      Q12: 0,
      Q13: 1,
      Q14: 0,
      Q15: 1,
      Q16: 0,
      Q17: 1,
      Q18: 0,
      Q19: 1,
      Q20: 0,
      Q21: 1,
      Q22: 0,
      Q23: 1,
      Q24: 0,
      Q25: 1,
      Q26: 0,
      Q27: 1,
      Q28: 0,
      Q29: 1,
      Q30: 0,
      Q31: 1,
      Q32: 0,
      Q33: 1,
      Q34: 0,
      Q35: 1,
      Q36: 0,
    },
    p_b: {
      Q01: -1,
      Q02: 1,
      Q03: -1,
      Q04: 1,
      Q05: 0,
      Q06: 1,
      Q07: -1,
      Q08: 1,
      Q09: -1,
      Q10: 1,
      Q11: -1,
      Q12: 1,
      Q13: -1,
      Q14: 1,
      Q15: -1,
      Q16: 1,
      Q17: -1,
      Q18: 1,
      Q19: -1,
      Q20: 1,
      Q21: -1,
      Q22: 1,
      Q23: -1,
      Q24: 1,
      Q25: -1,
      Q26: 1,
      Q27: -1,
      Q28: 1,
      Q29: -1,
      Q30: 1,
      Q31: -1,
      Q32: 1,
      Q33: -1,
      Q34: 1,
      Q35: -1,
      Q36: 1,
    },
  };
  return state;
}
