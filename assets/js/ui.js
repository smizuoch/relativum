export function byId(id) {
  return document.getElementById(id);
}

export function createOption(value, text, selected = false) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  option.selected = selected;
  return option;
}

export function formatNumber(value, digits = 3) {
  if (!Number.isFinite(value)) return "-";
  return Number(value).toFixed(digits);
}

export function formatPercentage(value, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(digits)}%`;
}

export function announce(message, region) {
  if (!region) return;
  region.textContent = message;
}
