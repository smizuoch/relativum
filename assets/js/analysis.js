import { QUESTIONS } from "./questions.js";

const MAX_KMEANS_ITER = 50;

export function runAnalysis(state) {
  const people = state.people || [];
  const weights = state.settings?.weights || {};
  const minAnswers = Number(state.settings?.analysis?.minAnswers ?? 7);
  const participationScaling = !!state.settings?.analysis?.participationScaling;
  const stabilityWins = Number(state.settings?.analysis?.stabilityWins ?? 4);

  const questionIds = QUESTIONS.map((q) => q.id);
  const included = [];
  const excluded = [];
  const rawMatrix = [];
  const counts = [];

  for (const person of people) {
    const ratings = state.ratings?.[person.id] || {};
    let answered = 0;
    const row = questionIds.map((qid) => {
      const value = ratings[qid];
      if (value === 1 || value === -1 || value === 0) {
        answered += 1;
        return value;
      }
      return NaN;
    });
    if (answered >= minAnswers) {
      included.push(person);
      rawMatrix.push(row);
      counts.push(answered);
    } else {
      excluded.push({ person, answered });
    }
  }

  const matrix = rawMatrix.map((row) => row.slice());
  const colMeans = computeColumnMeans(matrix);
  const imputed = matrix.map((row) =>
    row.map((value, idx) => (Number.isNaN(value) ? colMeans[idx] : value))
  );

  const centered = imputed.map((row) => row.slice());
  const finalMeans = computeColumnMeans(centered);
  const appliedWeights = questionIds.map((qid) => Number(weights[qid] ?? 1.0));

  for (let i = 0; i < centered.length; i += 1) {
    for (let j = 0; j < centered[i].length; j += 1) {
      centered[i][j] = appliedWeights[j] * (centered[i][j] - finalMeans[j]);
    }
  }

  const coords = computePCA(centered, 3);
  const scaledCoords = participationScaling
    ? coords.map((row, idx) => {
        const cp = counts[idx] || 1;
        const scale = Math.sqrt(questionIds.length / cp);
        return row.map((value) => value * scale);
      })
    : coords.map((row) => row.slice());

  const selfPersonId = state.settings?.selfPersonId || null;
  const translatedCoords = translateToSelf(scaledCoords, included, selfPersonId);

  const clustering = computeClustering(translatedCoords, state.analysisHistory || {}, stabilityWins);

  return {
    people: included,
    excluded,
    questionIds,
    rawMatrix,
    imputedMatrix: imputed,
    centeredMatrix: centered,
    means: finalMeans,
    weights: appliedWeights,
    coords,
    coordsScaled: scaledCoords,
    coordsTranslated: translatedCoords,
    counts,
    clustering,
  };
}

export function translateToSelf(coords, people, selfPersonId) {
  if (!selfPersonId) {
    return coords.map((row) => row.slice());
  }
  const idx = people.findIndex((p) => p.id === selfPersonId);
  if (idx === -1) {
    return coords.map((row) => row.slice());
  }
  const origin = coords[idx];
  return coords.map((row) => row.map((value, dim) => value - origin[dim]));
}

function computeColumnMeans(matrix) {
  if (matrix.length === 0) {
    return Array(QUESTIONS.length).fill(0);
  }
  const cols = matrix[0].length;
  const sums = Array(cols).fill(0);
  const counts = Array(cols).fill(0);
  for (const row of matrix) {
    for (let j = 0; j < cols; j += 1) {
      const v = row[j];
      if (!Number.isNaN(v)) {
        sums[j] += v;
        counts[j] += 1;
      }
    }
  }
  return sums.map((sum, idx) => (counts[idx] ? sum / counts[idx] : 0));
}

function computePCA(matrix, k) {
  const n = matrix.length;
  if (n === 0) {
    return [];
  }
  const m = matrix[0].length;
  if (n === 1) {
    return [Array(k).fill(0)];
  }
  const cov = computeCovariance(matrix);
  const eigenvectors = [];
  let working = cov.map((row) => row.slice());
  for (let i = 0; i < k; i += 1) {
    const { vector, value } = powerIteration(working, 200);
    if (!vector || !Number.isFinite(value)) {
      eigenvectors.push(Array(m).fill(0));
      continue;
    }
    eigenvectors.push(vector);
    working = deflateMatrix(working, vector, value);
  }
  return multiplyMatrixByVectors(matrix, eigenvectors);
}

function computeCovariance(matrix) {
  const n = matrix.length;
  const m = matrix[0].length;
  const cov = Array.from({ length: m }, () => Array(m).fill(0));
  for (let i = 0; i < n; i += 1) {
    const row = matrix[i];
    for (let a = 0; a < m; a += 1) {
      for (let b = a; b < m; b += 1) {
        cov[a][b] += row[a] * row[b];
      }
    }
  }
  const scale = 1 / Math.max(1, n - 1);
  for (let a = 0; a < m; a += 1) {
    for (let b = a; b < m; b += 1) {
      const value = cov[a][b] * scale;
      cov[a][b] = value;
      cov[b][a] = value;
    }
  }
  return cov;
}

function powerIteration(matrix, iterations = 100) {
  const n = matrix.length;
  let v = Array.from({ length: n }, () => Math.random() - 0.5);
  v = normalize(v);
  let lastValue = 0;
  for (let i = 0; i < iterations; i += 1) {
    const mv = multiplyMatrixVector(matrix, v);
    const normed = normalize(mv);
    const value = dot(normed, multiplyMatrixVector(matrix, normed));
    if (Math.abs(value - lastValue) < 1e-8) {
      v = normed;
      lastValue = value;
      break;
    }
    v = normed;
    lastValue = value;
  }
  return { vector: v, value: lastValue };
}

function deflateMatrix(matrix, vector, eigenvalue) {
  const n = matrix.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      out[i][j] = matrix[i][j] - eigenvalue * vector[i] * vector[j];
    }
  }
  return out;
}

function multiplyMatrixVector(matrix, vector) {
  const out = Array(matrix.length).fill(0);
  for (let i = 0; i < matrix.length; i += 1) {
    let sum = 0;
    for (let j = 0; j < vector.length; j += 1) {
      sum += matrix[i][j] * vector[j];
    }
    out[i] = sum;
  }
  return out;
}

function multiplyMatrixByVectors(matrix, vectors) {
  const out = [];
  for (let i = 0; i < matrix.length; i += 1) {
    const row = matrix[i];
    const coords = vectors.map((vec) => dot(row, vec));
    out.push(coords);
  }
  return out;
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    sum += a[i] * b[i];
  }
  return sum;
}

function normalize(vector) {
  const norm = Math.sqrt(dot(vector, vector)) || 1;
  return vector.map((v) => v / norm);
}

function computeClustering(coords, history, stabilityWins) {
  const n = coords.length;
  if (n === 0) {
    return { labels: [], chosenK: 0, base: null, candidates: [] };
  }
  if (n === 1) {
    return { labels: [0], chosenK: 1, base: null, candidates: [] };
  }

  const baseK = Math.min(100, n);
  const base = baseK >= 2 ? kmeans(coords, baseK) : null;

  const candidates = [];
  const possibleKs = [2, 3, 4, 5].filter((k) => k <= n);
  let best = null;
  for (const k of possibleKs) {
    const result = kmeans(coords, k);
    const score = silhouetteScore(coords, result.labels, k);
    candidates.push({ k, score, labels: result.labels, centroids: result.centroids });
    if (!best || score > best.score || (score === best.score && k < best.k)) {
      best = { k, score, labels: result.labels, centroids: result.centroids };
    }
  }

  let chosenK = best ? best.k : 1;
  let chosenLabels = best ? best.labels : Array(n).fill(0);

  if (best) {
    if (history.lastBestK === best.k) {
      history.streak = (history.streak || 0) + 1;
    } else {
      history.lastBestK = best.k;
      history.streak = 1;
    }

    if (history.chosenK == null) {
      history.chosenK = best.k;
    }

    if (history.streak >= stabilityWins) {
      history.chosenK = best.k;
    }

    chosenK = history.chosenK;
    const chosen = candidates.find((c) => c.k === chosenK) || best;
    chosenLabels = chosen.labels;
  }

  return {
    base,
    candidates,
    chosenK,
    labels: chosenLabels,
  };
}

function kmeans(points, k) {
  const n = points.length;
  const dims = points[0].length;
  let centroids = initKmeansPlusPlus(points, k);
  let labels = Array(n).fill(0);

  for (let iter = 0; iter < MAX_KMEANS_ITER; iter += 1) {
    let changed = false;
    for (let i = 0; i < n; i += 1) {
      const idx = closestCentroid(points[i], centroids);
      if (labels[i] !== idx) {
        labels[i] = idx;
        changed = true;
      }
    }
    const nextCentroids = Array.from({ length: k }, () => Array(dims).fill(0));
    const counts = Array(k).fill(0);
    for (let i = 0; i < n; i += 1) {
      const label = labels[i];
      counts[label] += 1;
      for (let d = 0; d < dims; d += 1) {
        nextCentroids[label][d] += points[i][d];
      }
    }
    for (let c = 0; c < k; c += 1) {
      if (counts[c] === 0) {
        nextCentroids[c] = points[Math.floor(Math.random() * n)].slice();
      } else {
        for (let d = 0; d < dims; d += 1) {
          nextCentroids[c][d] /= counts[c];
        }
      }
    }
    centroids = nextCentroids;
    if (!changed) {
      break;
    }
  }

  return { labels, centroids };
}

function initKmeansPlusPlus(points, k) {
  const centroids = [];
  const n = points.length;
  centroids.push(points[Math.floor(Math.random() * n)].slice());
  while (centroids.length < k) {
    const distances = points.map((p) => {
      const closest = closestCentroidDistance(p, centroids);
      return closest * closest;
    });
    const total = distances.reduce((sum, v) => sum + v, 0) || 1;
    let pick = Math.random() * total;
    let idx = 0;
    for (; idx < distances.length; idx += 1) {
      pick -= distances[idx];
      if (pick <= 0) break;
    }
    centroids.push(points[Math.min(idx, n - 1)].slice());
  }
  return centroids;
}

function closestCentroid(point, centroids) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < centroids.length; i += 1) {
    const dist = squaredDistance(point, centroids[i]);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function closestCentroidDistance(point, centroids) {
  let bestDist = Infinity;
  for (let i = 0; i < centroids.length; i += 1) {
    const dist = squaredDistance(point, centroids[i]);
    if (dist < bestDist) {
      bestDist = dist;
    }
  }
  return Math.sqrt(bestDist);
}

function squaredDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
}

function silhouetteScore(points, labels, k) {
  const n = points.length;
  const clusters = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i += 1) {
    clusters[labels[i]].push(i);
  }
  const distances = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const d = Math.sqrt(squaredDistance(points[i], points[j]));
      distances[i][j] = d;
      distances[j][i] = d;
    }
  }
  const silhouettes = [];
  for (let i = 0; i < n; i += 1) {
    const label = labels[i];
    const sameCluster = clusters[label];
    let a = 0;
    if (sameCluster.length > 1) {
      a = sameCluster.reduce((sum, idx) => sum + distances[i][idx], 0) / (sameCluster.length - 1);
    }
    let b = Infinity;
    for (let c = 0; c < clusters.length; c += 1) {
      if (c === label || clusters[c].length === 0) continue;
      const avg = clusters[c].reduce((sum, idx) => sum + distances[i][idx], 0) / clusters[c].length;
      if (avg < b) b = avg;
    }
    const s = b === Infinity && a === 0 ? 0 : (b - a) / Math.max(a, b);
    silhouettes.push(s);
  }
  const total = silhouettes.reduce((sum, v) => sum + v, 0);
  return total / silhouettes.length;
}
