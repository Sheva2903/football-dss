function buildFeatureVector(player) {
  return [
    Number(player.age) || 0,
    Number(player.recentMinutes) || 0,
    Number(player.recentAppearances) || 0,
    Number(player.productionScore) || 0,
    Number(player.valueScore) || 0,
    Number(player.disciplineScore) || 0,
    Number(player.reliabilityScore) || 0,
    Number(player.smartValueIndex) || 0,
    Number(player.marketValueEur) || 0,
  ];
}

function normalizeMatrix(vectors) {
  const dimensions = vectors[0]?.length ?? 0;
  const means = Array(dimensions).fill(0);
  const stdDevs = Array(dimensions).fill(0);

  for (const vector of vectors) {
    vector.forEach((value, index) => {
      means[index] += value;
    });
  }

  means.forEach((_, index) => {
    means[index] = means[index] / vectors.length;
  });

  for (const vector of vectors) {
    vector.forEach((value, index) => {
      stdDevs[index] += (value - means[index]) ** 2;
    });
  }

  stdDevs.forEach((_, index) => {
    stdDevs[index] = Math.sqrt(stdDevs[index] / vectors.length) || 1;
  });

  return vectors.map((vector) => vector.map((value, index) => (value - means[index]) / stdDevs[index]));
}

function cosineSimilarity(left, right) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function rankSimilarAlternatives(target, candidates, filters) {
  if (!target || candidates.length === 0) {
    return [];
  }

  const targetVector = buildFeatureVector(target);
  const candidateVectors = candidates.map((candidate) => buildFeatureVector(candidate));
  const [normalizedTarget, ...normalizedCandidates] = normalizeMatrix([targetVector, ...candidateVectors]);
  const targetMarketValue = Number(target.marketValueEur) || 1;

  return candidates
    .map((candidate, index) => {
      const cosine = cosineSimilarity(normalizedTarget, normalizedCandidates[index]);
      const similarityScore = Math.max(0, Math.min(100, cosine * 100));
      const affordabilityScore = Math.max(0, Math.min(100, 100 * (1 - Number(candidate.marketValueEur) / targetMarketValue)));
      const alternativeScore = Math.round(
        0.55 * similarityScore + 0.25 * affordabilityScore + 0.20 * Number(candidate.smartValueIndex)
      );

      return {
        ...candidate,
        similarityScore: Math.round(similarityScore * 100) / 100,
        affordabilityScore: Math.round(affordabilityScore * 100) / 100,
        alternativeScore,
        reasons: {
          cheaperThanTarget: Number(candidate.marketValueEur) < targetMarketValue,
          samePosition: candidate.position === target.position,
          evidenceWindow: filters.evidenceWindow,
        },
      };
    })
    .filter((candidate) => candidate.similarityScore >= filters.minSimilarity)
    .sort((left, right) => {
      if (right.alternativeScore !== left.alternativeScore) {
        return right.alternativeScore - left.alternativeScore;
      }

      if (right.similarityScore !== left.similarityScore) {
        return right.similarityScore - left.similarityScore;
      }

      if (left.marketValueEur !== right.marketValueEur) {
        return left.marketValueEur - right.marketValueEur;
      }

      return right.smartValueIndex - left.smartValueIndex;
    })
    .slice(0, filters.limit);
}
