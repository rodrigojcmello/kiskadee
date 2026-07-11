import { contrastRatio, deltaEOk, type OklchColor } from './color-math.ts';

export type EmittedSample = {
  tone: number;
  hex: string;
  oklch: OklchColor;
  gamutChromaLoss: number;
};

export type EmittedAdjacentDeltaE = {
  fromTone: number;
  toTone: number;
  value: number;
};

export type EmittedContinuityAnchor = {
  incomingDeltaE: number | null;
  outgoingDeltaE: number | null;
  stepImbalance: number | null;
  incomingChromaSlope: number | null;
  outgoingChromaSlope: number | null;
  chromaSlopeChange: number | null;
  chromaExcess: number | null;
  normalizedChromaTurn: number | null;
  localRhythmDeltaE: number | null;
};

export type EmittedContinuityAnalysis = {
  adjacentDeltaE: EmittedAdjacentDeltaE[];
  maxAdjacentDeltaE: number;
  anchor: EmittedContinuityAnchor;
};

export type EmittedCurveFairingTrace = {
  status: 'not-needed' | 'applied' | 'rejected';
  adjustedTones: number[];
  maxLightnessAdjustment: number;
  beforeStepImbalance: number | null;
  beforeChromaSlopeChange: number | null;
  beforeChromaExcess: number | null;
};

export type EmittedContinuityDiagnostics = EmittedContinuityAnalysis & {
  reviewRequired: boolean;
  fairing: EmittedCurveFairingTrace;
};

type FairingParams = {
  tones: readonly number[];
  orientedTargets: number[];
  anchorIndex: number;
  vividThreshold: number;
  foregroundHex: string;
  anchorRelocated: boolean;
  contrastAdjusted: boolean[];
  render: (index: number, oriented: number) => EmittedSample;
  stabilize: (orientedTargets: number[]) => number[];
  orientLightness: (lightness: number) => number;
  isVividTone: (tone: number) => boolean;
};

type AcceptedFairingCandidate = {
  values: number[];
  leftShift: number;
  rightShift: number;
  score: number;
};

type RankedShiftPair = {
  leftShift: number;
  rightShift: number;
  score: number;
  approximatelyAccepted?: boolean;
};

const NUMERIC_EPSILON = 1e-7;
const VIVID_CONTRAST = 3;
const TRIGGER_MAX_DELTA_E = 0.04;
const TRIGGER_RHYTHM_RATIO = 1.8;
const TRIGGER_STEP_IMBALANCE = 2;
const TRIGGER_CHROMA_TURN = 0.2;
const TRIGGER_GAMUT_LOSS = 0.01;
const CUSP_MAX_DELTA_E = 0.03;
const CUSP_RHYTHM_RATIO = 1.3;
const CUSP_MAX_STEP_IMBALANCE = 1.5;
const CUSP_CHROMA_TURN = 0.17;
const MAX_LIGHTNESS_SHIFT = 1.75;
const MIN_LIGHTNESS_GAP = 0.3;
const MIN_SCORE_REDUCTION = 0.2;
const MIN_MAX_EDGE_REDUCTION = 0.15;
const MIN_IMBALANCE_REDUCTION = 0.3;
const TAPER = [1, 0.75] as const;
const JOINT_FINALIST_COUNT = 12;

export function fairEmittedAnchorNeighborhood(params: FairingParams): {
  values: number[];
  trace: EmittedCurveFairingTrace;
} {
  const baseValues = [...params.orientedTargets];
  const baseSamples = renderSamples(baseValues, params.render);
  const before = analyzeEmittedContinuity(baseSamples, params.anchorIndex, params.orientLightness);
  const baseTrace = createFairingTrace('not-needed', before);

  if (!shouldAttemptFairing(params, baseSamples, before)) {
    return { values: baseValues, trace: baseTrace };
  }

  const rhythm = before.anchor.localRhythmDeltaE;
  if (rhythm === null || rhythm <= NUMERIC_EPSILON) {
    return { values: baseValues, trace: createFairingTrace('rejected', before) };
  }

  const leftShift = findFairingShift('incoming', params, baseSamples, rhythm);
  const rightShift = findFairingShift('outgoing', params, baseSamples, rhythm);
  const independentCandidate = evaluateFairingPair(
    params,
    baseValues,
    before,
    rhythm,
    leftShift,
    rightShift
  );
  const acceptedCandidate =
    independentCandidate ??
    findJointFairingFallback(params, baseValues, baseSamples, before, rhythm);

  if (!acceptedCandidate) {
    return { values: baseValues, trace: createFairingTrace('rejected', before) };
  }

  const finalValues = acceptedCandidate.values;

  const adjustedTones = params.tones.filter(
    (tone, index) =>
      index !== params.anchorIndex &&
      tone !== 0 &&
      tone !== 100 &&
      Math.abs(finalValues[index] - baseValues[index]) > 0.001
  );
  const maxLightnessAdjustment = Math.max(
    0,
    ...finalValues.map((value, index) => Math.abs(value - baseValues[index]))
  );

  return {
    values: finalValues,
    trace: {
      ...createFairingTrace('applied', before),
      adjustedTones,
      maxLightnessAdjustment
    }
  };
}

function evaluateFairingPair(
  params: FairingParams,
  baseValues: number[],
  before: EmittedContinuityAnalysis,
  rhythm: number,
  leftShift: number,
  rightShift: number
): AcceptedFairingCandidate | null {
  const candidateValues = applyFairingShifts(baseValues, params.anchorIndex, leftShift, rightShift);
  if (!areTargetsValid(params, candidateValues, baseValues)) return null;

  const finalValues = params.stabilize(candidateValues);
  const finalSamples = renderSamples(finalValues, params.render);
  if (!areSamplesValid(params, finalSamples)) return null;

  const after = analyzeEmittedContinuity(finalSamples, params.anchorIndex, params.orientLightness);
  if (
    !isAcceptedFairing(
      params,
      baseValues,
      finalValues,
      before,
      after,
      rhythm,
      leftShift,
      rightShift
    )
  ) {
    return null;
  }

  return {
    values: finalValues,
    leftShift,
    rightShift,
    score: scoreCandidate(after, params.tones, params.anchorIndex, rhythm, leftShift, rightShift)
  };
}

function findJointFairingFallback(
  params: FairingParams,
  baseValues: number[],
  baseSamples: EmittedSample[],
  before: EmittedContinuityAnalysis,
  rhythm: number
): AcceptedFairingCandidate | null {
  const coarseGrid = fairingShiftGrid();
  const coarsePairs = rankShiftPairs(
    coarseGrid,
    coarseGrid,
    params,
    baseValues,
    baseSamples,
    before,
    rhythm
  );
  const bestCoarse = coarsePairs[0];
  if (!bestCoarse) return null;

  const refinedPairs = rankShiftPairs(
    centeredShiftGrid(bestCoarse.leftShift),
    centeredShiftGrid(bestCoarse.rightShift),
    params,
    baseValues,
    baseSamples,
    before,
    rhythm
  );
  const finalists = uniqueShiftPairs([...refinedPairs, ...coarsePairs])
    .sort(compareRankedShiftPairs)
    .slice(0, JOINT_FINALIST_COUNT);
  let bestAccepted: AcceptedFairingCandidate | null = null;

  for (const finalist of finalists) {
    const candidate = evaluateFairingPair(
      params,
      baseValues,
      before,
      rhythm,
      finalist.leftShift,
      finalist.rightShift
    );
    if (candidate && (!bestAccepted || compareAcceptedCandidates(candidate, bestAccepted) < 0)) {
      bestAccepted = candidate;
    }
  }

  return bestAccepted;
}

function rankShiftPairs(
  leftShifts: number[],
  rightShifts: number[],
  params: FairingParams,
  baseValues: number[],
  baseSamples: EmittedSample[],
  before: EmittedContinuityAnalysis,
  rhythm: number
): RankedShiftPair[] {
  const pairs: RankedShiftPair[] = [];

  for (const leftShift of leftShifts) {
    for (const rightShift of rightShifts) {
      const candidateValues = applyFairingShifts(
        baseValues,
        params.anchorIndex,
        leftShift,
        rightShift
      );
      if (!areTargetsValid(params, candidateValues, baseValues)) continue;

      const samples = [...baseSamples];
      for (let offset = -TAPER.length; offset <= TAPER.length; offset += 1) {
        if (offset === 0) continue;
        const index = params.anchorIndex + offset;
        samples[index] = params.render(index, candidateValues[index]);
      }
      const analysis = analyzeEmittedContinuity(
        samples,
        params.anchorIndex,
        params.orientLightness
      );
      const score = scoreCandidate(
        analysis,
        params.tones,
        params.anchorIndex,
        rhythm,
        leftShift,
        rightShift
      );
      if (Number.isFinite(score)) {
        const approximatelyAccepted =
          areSamplesValid(params, samples) &&
          isAcceptedFairing(
            params,
            baseValues,
            candidateValues,
            before,
            analysis,
            rhythm,
            leftShift,
            rightShift
          );
        pairs.push({ leftShift, rightShift, score, approximatelyAccepted });
      }
    }
  }

  return pairs.sort(compareRankedShiftPairs);
}

function uniqueShiftPairs(pairs: RankedShiftPair[]): RankedShiftPair[] {
  const seen = new Set<string>();
  return pairs.filter((pair) => {
    const key = `${pair.leftShift.toFixed(6)}:${pair.rightShift.toFixed(6)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareRankedShiftPairs(left: RankedShiftPair, right: RankedShiftPair): number {
  return (
    Number(Boolean(right.approximatelyAccepted)) - Number(Boolean(left.approximatelyAccepted)) ||
    left.score - right.score ||
    Math.abs(left.leftShift) +
      Math.abs(left.rightShift) -
      (Math.abs(right.leftShift) + Math.abs(right.rightShift)) ||
    left.leftShift - right.leftShift ||
    left.rightShift - right.rightShift
  );
}

function compareAcceptedCandidates(
  left: AcceptedFairingCandidate,
  right: AcceptedFairingCandidate
): number {
  return compareRankedShiftPairs(left, right);
}

function fairingShiftGrid(): number[] {
  return [-MAX_LIGHTNESS_SHIFT, ...numericRange(-1.7, 1.7, 0.1), MAX_LIGHTNESS_SHIFT];
}

function centeredShiftGrid(center: number): number[] {
  return numericRange(
    Math.max(-MAX_LIGHTNESS_SHIFT, center - 0.1),
    Math.min(MAX_LIGHTNESS_SHIFT, center + 0.1),
    0.01
  );
}

export function analyzeEmittedContinuity(
  samples: EmittedSample[],
  anchorIndex: number,
  orientLightness: (lightness: number) => number
): EmittedContinuityAnalysis {
  const adjacentDeltaE = samples.flatMap((sample, index): EmittedAdjacentDeltaE[] => {
    const next = samples[index + 1];
    return next && !isCap(sample.tone) && !isCap(next.tone)
      ? [{ fromTone: sample.tone, toTone: next.tone, value: deltaEOk(sample.oklch, next.oklch) }]
      : [];
  });
  const previous = samples[anchorIndex - 1];
  const anchor = samples[anchorIndex];
  const next = samples[anchorIndex + 1];
  const hasIncoming = previous && anchor && !isCap(previous.tone) && !isCap(anchor.tone);
  const hasOutgoing = next && anchor && !isCap(next.tone) && !isCap(anchor.tone);
  const incomingDeltaE = hasIncoming ? deltaEOk(previous.oklch, anchor.oklch) : null;
  const outgoingDeltaE = hasOutgoing ? deltaEOk(anchor.oklch, next.oklch) : null;
  const incomingGap = hasIncoming
    ? orientLightness(anchor.oklch.l) - orientLightness(previous.oklch.l)
    : null;
  const outgoingGap = hasOutgoing
    ? orientLightness(next.oklch.l) - orientLightness(anchor.oklch.l)
    : null;
  const incomingChromaSlope =
    incomingGap !== null && incomingGap > NUMERIC_EPSILON
      ? (anchor.oklch.c - previous.oklch.c) / incomingGap
      : null;
  const outgoingChromaSlope =
    outgoingGap !== null && outgoingGap > NUMERIC_EPSILON
      ? (next.oklch.c - anchor.oklch.c) / outgoingGap
      : null;
  const chromaSlopeChange =
    incomingChromaSlope !== null && outgoingChromaSlope !== null
      ? Math.abs(outgoingChromaSlope - incomingChromaSlope)
      : null;
  const chromaExcess =
    hasIncoming && hasOutgoing
      ? Math.max(0, anchor.oklch.c - (previous.oklch.c + next.oklch.c) / 2)
      : null;
  const normalizedChromaTurn =
    hasIncoming && hasOutgoing
      ? Math.abs(next.oklch.c - 2 * anchor.oklch.c + previous.oklch.c) /
        Math.max(anchor.oklch.c, 0.05)
      : null;
  const stepImbalance =
    incomingDeltaE !== null && outgoingDeltaE !== null
      ? Math.max(incomingDeltaE, outgoingDeltaE) /
        Math.max(NUMERIC_EPSILON, Math.min(incomingDeltaE, outgoingDeltaE))
      : null;
  const rhythmEdges =
    anchorIndex - 3 > 0 && anchorIndex + 3 < samples.length - 1
      ? [
          deltaEOk(samples[anchorIndex - 3].oklch, samples[anchorIndex - 2].oklch),
          deltaEOk(samples[anchorIndex - 2].oklch, samples[anchorIndex - 1].oklch),
          deltaEOk(samples[anchorIndex + 1].oklch, samples[anchorIndex + 2].oklch),
          deltaEOk(samples[anchorIndex + 2].oklch, samples[anchorIndex + 3].oklch)
        ]
      : [];

  return {
    adjacentDeltaE,
    maxAdjacentDeltaE: Math.max(0, ...adjacentDeltaE.map((edge) => edge.value)),
    anchor: {
      incomingDeltaE,
      outgoingDeltaE,
      stepImbalance,
      incomingChromaSlope,
      outgoingChromaSlope,
      chromaSlopeChange,
      chromaExcess,
      normalizedChromaTurn,
      localRhythmDeltaE: rhythmEdges.length === 4 ? median(rhythmEdges) : null
    }
  };
}

function createFairingTrace(
  status: EmittedCurveFairingTrace['status'],
  before: EmittedContinuityAnalysis
): EmittedCurveFairingTrace {
  return {
    status,
    adjustedTones: [],
    maxLightnessAdjustment: 0,
    beforeStepImbalance: before.anchor.stepImbalance,
    beforeChromaSlopeChange: before.anchor.chromaSlopeChange,
    beforeChromaExcess: before.anchor.chromaExcess
  };
}

function shouldAttemptFairing(
  params: FairingParams,
  samples: EmittedSample[],
  analysis: EmittedContinuityAnalysis
): boolean {
  const anchor = analysis.anchor;
  if (
    params.anchorRelocated ||
    params.anchorIndex - 3 <= 0 ||
    params.anchorIndex + 3 >= params.tones.length - 1 ||
    anchor.incomingDeltaE === null ||
    anchor.outgoingDeltaE === null ||
    anchor.stepImbalance === null ||
    anchor.normalizedChromaTurn === null ||
    anchor.localRhythmDeltaE === null ||
    params.contrastAdjusted.slice(params.anchorIndex - 3, params.anchorIndex + 4).some(Boolean)
  ) {
    return false;
  }

  for (let index = params.anchorIndex - 3; index < params.anchorIndex + 3; index += 1) {
    const emittedGap =
      params.orientLightness(samples[index + 1].oklch.l) -
      params.orientLightness(samples[index].oklch.l);
    const targetGap = params.orientedTargets[index + 1] - params.orientedTargets[index];
    if (emittedGap < MIN_LIGHTNESS_GAP || targetGap < MIN_LIGHTNESS_GAP) return false;
  }

  const maximumDeltaE = Math.max(anchor.incomingDeltaE, anchor.outgoingDeltaE);
  const rhythmRatio = maximumDeltaE / anchor.localRhythmDeltaE;
  const gamutLoss = Math.max(
    samples[params.anchorIndex - 1].gamutChromaLoss,
    samples[params.anchorIndex + 1].gamutChromaLoss
  );
  const severe =
    maximumDeltaE >= TRIGGER_MAX_DELTA_E &&
    rhythmRatio >= TRIGGER_RHYTHM_RATIO &&
    anchor.stepImbalance >= TRIGGER_STEP_IMBALANCE &&
    anchor.normalizedChromaTurn >= TRIGGER_CHROMA_TURN;
  const balancedCusp =
    maximumDeltaE >= CUSP_MAX_DELTA_E &&
    rhythmRatio >= CUSP_RHYTHM_RATIO &&
    anchor.stepImbalance <= CUSP_MAX_STEP_IMBALANCE &&
    anchor.normalizedChromaTurn >= CUSP_CHROMA_TURN;

  return gamutLoss >= TRIGGER_GAMUT_LOSS && (severe || balancedCusp);
}

function findFairingShift(
  side: 'incoming' | 'outgoing',
  params: FairingParams,
  samples: EmittedSample[],
  rhythm: number
): number {
  const neighborIndex = side === 'incoming' ? params.anchorIndex - 1 : params.anchorIndex + 1;
  const anchor = samples[params.anchorIndex];
  let bestShift = 0;
  let bestError = Number.POSITIVE_INFINITY;
  const consider = (shift: number): void => {
    const neighbor = params.render(neighborIndex, params.orientedTargets[neighborIndex] + shift);
    const error = Math.abs(deltaEOk(anchor.oklch, neighbor.oklch) - rhythm);
    if (
      error < bestError - NUMERIC_EPSILON ||
      (Math.abs(error - bestError) <= NUMERIC_EPSILON && Math.abs(shift) < Math.abs(bestShift))
    ) {
      bestShift = shift;
      bestError = error;
    }
  };

  for (const shift of numericRange(-MAX_LIGHTNESS_SHIFT, MAX_LIGHTNESS_SHIFT, 0.1)) {
    consider(shift);
  }
  for (const shift of numericRange(
    Math.max(-MAX_LIGHTNESS_SHIFT, bestShift - 0.1),
    Math.min(MAX_LIGHTNESS_SHIFT, bestShift + 0.1),
    0.01
  )) {
    consider(shift);
  }
  return bestShift;
}

function applyFairingShifts(
  baseValues: number[],
  anchorIndex: number,
  leftShift: number,
  rightShift: number
): number[] {
  const values = [...baseValues];
  for (let distance = 1; distance <= TAPER.length; distance += 1) {
    const weight = TAPER[distance - 1];
    values[anchorIndex - distance] += leftShift * weight;
    values[anchorIndex + distance] += rightShift * weight;
  }
  return values;
}

function areTargetsValid(
  params: FairingParams,
  candidateValues: number[],
  baseValues: number[]
): boolean {
  if (
    candidateValues[0] !== baseValues[0] ||
    candidateValues[params.anchorIndex] !== baseValues[params.anchorIndex] ||
    candidateValues.at(-1) !== baseValues.at(-1)
  ) {
    return false;
  }
  for (let index = 0; index < candidateValues.length; index += 1) {
    const value = candidateValues[index];
    if (!Number.isFinite(value) || value < 0 || value > 100) return false;
    if (params.isVividTone(params.tones[index]) && value < params.vividThreshold) return false;
    if (index > 0 && value - candidateValues[index - 1] < MIN_LIGHTNESS_GAP) return false;
  }
  return true;
}

function areSamplesValid(params: FairingParams, samples: EmittedSample[]): boolean {
  const seen = new Set<string>();
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    if (seen.has(sample.hex)) return false;
    seen.add(sample.hex);
    if (
      params.isVividTone(sample.tone) &&
      contrastRatio(sample.hex, params.foregroundHex) < VIVID_CONTRAST
    ) {
      return false;
    }
    if (index === 0) continue;
    const gap =
      params.orientLightness(sample.oklch.l) - params.orientLightness(samples[index - 1].oklch.l);
    const touchesWindow = index >= params.anchorIndex - 2 && index - 1 <= params.anchorIndex + 2;
    if (gap <= 0 || (touchesWindow && gap < MIN_LIGHTNESS_GAP)) return false;
  }
  return true;
}

function isAcceptedFairing(
  params: FairingParams,
  baseValues: number[],
  finalValues: number[],
  before: EmittedContinuityAnalysis,
  after: EmittedContinuityAnalysis,
  rhythm: number,
  leftShift: number,
  rightShift: number
): boolean {
  const beforeEdges = resolveWindowDeltaE(before, params.tones, params.anchorIndex);
  const afterEdges = resolveWindowDeltaE(after, params.tones, params.anchorIndex);
  const beforeMaximum = Math.max(...beforeEdges);
  const afterMaximum = Math.max(...afterEdges);
  const beforeImbalance = before.anchor.stepImbalance;
  const afterImbalance = after.anchor.stepImbalance;
  const beforeTurn = before.anchor.normalizedChromaTurn;
  const afterTurn = after.anchor.normalizedChromaTurn;
  if (
    beforeEdges.length !== 6 ||
    afterEdges.length !== 6 ||
    beforeImbalance === null ||
    afterImbalance === null ||
    beforeTurn === null ||
    afterTurn === null
  ) {
    return false;
  }
  if (
    finalValues.some(
      (value, index) =>
        Math.abs(value - baseValues[index]) > NUMERIC_EPSILON &&
        Math.abs(index - params.anchorIndex) > 2
    )
  ) {
    return false;
  }

  const baseScore = scoreCandidate(before, params.tones, params.anchorIndex, rhythm, 0, 0);
  const finalScore = scoreCandidate(
    after,
    params.tones,
    params.anchorIndex,
    rhythm,
    leftShift,
    rightShift
  );
  const scoreImproved = finalScore <= baseScore * (1 - MIN_SCORE_REDUCTION);
  const maximumImproved =
    afterMaximum <= TRIGGER_MAX_DELTA_E ||
    afterMaximum <= beforeMaximum * (1 - MIN_MAX_EDGE_REDUCTION);
  const imbalanceImproved =
    afterImbalance <= 1.5 || afterImbalance <= beforeImbalance * (1 - MIN_IMBALANCE_REDUCTION);

  return (
    scoreImproved &&
    maximumImproved &&
    imbalanceImproved &&
    afterTurn <= beforeTurn + NUMERIC_EPSILON &&
    afterMaximum <= beforeMaximum + NUMERIC_EPSILON
  );
}

function scoreCandidate(
  analysis: EmittedContinuityAnalysis,
  tones: readonly number[],
  anchorIndex: number,
  rhythm: number,
  leftShift: number,
  rightShift: number
): number {
  const edges = resolveWindowDeltaE(analysis, tones, anchorIndex);
  const incoming = analysis.anchor.incomingDeltaE;
  const outgoing = analysis.anchor.outgoingDeltaE;
  const turn = analysis.anchor.normalizedChromaTurn;
  if (
    edges.length !== 6 ||
    incoming === null ||
    outgoing === null ||
    turn === null ||
    rhythm <= NUMERIC_EPSILON
  ) {
    return Number.POSITIVE_INFINITY;
  }
  const edgeVariance =
    edges.reduce((sum, edge) => sum + ((edge - rhythm) / rhythm) ** 2, 0) / edges.length;
  const anchorImbalance = ((incoming - outgoing) / rhythm) ** 2;
  const movement =
    ((leftShift / MAX_LIGHTNESS_SHIFT) ** 2 + (rightShift / MAX_LIGHTNESS_SHIFT) ** 2) / 2;
  return edgeVariance + 0.25 * anchorImbalance + 0.2 * turn ** 2 + 0.03 * movement;
}

function resolveWindowDeltaE(
  analysis: EmittedContinuityAnalysis,
  tones: readonly number[],
  anchorIndex: number
): number[] {
  const toneSet = new Set(tones.slice(anchorIndex - 3, anchorIndex + 4));
  return analysis.adjacentDeltaE
    .filter((edge) => toneSet.has(edge.fromTone) && toneSet.has(edge.toTone))
    .map((edge) => edge.value);
}

function renderSamples(
  orientedTargets: number[],
  render: (index: number, oriented: number) => EmittedSample
): EmittedSample[] {
  return orientedTargets.map((oriented, index) => render(index, oriented));
}

function numericRange(start: number, end: number, step: number): number[] {
  const values: number[] = [];
  const count = Math.floor((end - start) / step + NUMERIC_EPSILON);
  for (let index = 0; index <= count; index += 1) {
    values.push(Number((start + step * index).toFixed(6)));
  }
  if (values.length === 0 || values.at(-1)! < end - NUMERIC_EPSILON) {
    values.push(Number(end.toFixed(6)));
  }
  return values;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 : sorted[midpoint];
}

function isCap(tone: number): boolean {
  return tone === 0 || tone === 100;
}
