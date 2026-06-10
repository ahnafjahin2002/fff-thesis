// ─── Stroke Validator ──────────────────────────────────────────────────────────
// Compares child's drawn stroke against a reference stroke path.
// Dyslexia-friendly: uses generous tolerance — children just need to draw
// roughly in the right area and direction. NOT pixel-perfect.

/**
 * Calculate distance between two points
 */
function distance(p1, p2) {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

/**
 * Calculate minimum distance from a point to a line segment
 */
function pointToSegmentDistance(point, segStart, segEnd) {
  const dx = segEnd[0] - segStart[0];
  const dy = segEnd[1] - segStart[1];
  const lenSq = dx * dx + dy * dy;
  
  if (lenSq === 0) return distance(point, segStart);
  
  let t = ((point[0] - segStart[0]) * dx + (point[1] - segStart[1]) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  
  const projection = [segStart[0] + t * dx, segStart[1] + t * dy];
  return distance(point, projection);
}

/**
 * Calculate minimum distance from a point to an entire path (series of segments)
 */
function pointToPathDistance(point, path) {
  let minDist = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const d = pointToSegmentDistance(point, path[i], path[i + 1]);
    if (d < minDist) minDist = d;
  }
  // Also check distance to individual points (handles single-point paths)
  for (let i = 0; i < path.length; i++) {
    const d = distance(point, path[i]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Validate a child's drawn stroke against a reference stroke.
 * 
 * This is intentionally very forgiving — children with dyslexia
 * should be able to pass by drawing roughly in the correct area
 * and general direction. We check:
 *   1. Did they draw long enough? (not just a tap)
 *   2. Are most of their drawn points near the reference path?
 *   3. Did they roughly cover the length of the reference path?
 * 
 * @param {Array<[number, number]>} drawnPoints - Points drawn (in canvas pixels)
 * @param {Array<[number, number]>} referencePath - Reference path (normalized 0-1)
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels  
 * @returns {{ valid: boolean, accuracy: number, averageDeviation: number }}
 */
export function validateStroke(drawnPoints, referencePath, canvasWidth, canvasHeight) {
  if (!drawnPoints || drawnPoints.length < 3 || !referencePath || referencePath.length < 2) {
    return { valid: false, accuracy: 0, averageDeviation: 1 };
  }
  
  // Normalize drawn points to 0-1 space
  const drawn = drawnPoints.map(p => [
    p[0] / canvasWidth,
    p[1] / canvasHeight,
  ]);

  // ── Check 1: Minimum drawn length ───────────────────────────────────────────
  // The child must have drawn at least a meaningful distance
  let drawnLength = 0;
  for (let i = 0; i < drawn.length - 1; i++) {
    drawnLength += distance(drawn[i], drawn[i + 1]);
  }

  // Reference path length
  let refLength = 0;
  for (let i = 0; i < referencePath.length - 1; i++) {
    refLength += distance(referencePath[i], referencePath[i + 1]);
  }

  // Must draw at least 30% of reference length
  if (drawnLength < refLength * 0.3) {
    return { valid: false, accuracy: 0, averageDeviation: 1 };
  }

  // ── Check 2: Proximity — are drawn points near the reference? ───────────────
  // Sample up to 15 evenly-spaced points from the drawn path
  const sampleCount = Math.min(drawn.length, 15);
  const step = Math.max(1, Math.floor(drawn.length / sampleCount));
  
  // Generous tolerance: 30% of canvas in normalized space
  const tolerance = 0.30;
  
  let totalDeviation = 0;
  let sampledCount = 0;
  let withinTolerance = 0;
  
  for (let i = 0; i < drawn.length; i += step) {
    const dev = pointToPathDistance(drawn[i], referencePath);
    totalDeviation += dev;
    sampledCount++;
    if (dev <= tolerance) withinTolerance++;
  }

  const averageDeviation = totalDeviation / sampledCount;
  const accuracy = withinTolerance / sampledCount;

  // ── Check 3: Coverage — did they trace most of the reference? ──────────────
  // Check that drawn path starts near ref start and ends near ref end
  const startDist = distance(drawn[0], referencePath[0]);
  const endDist = distance(drawn[drawn.length - 1], referencePath[referencePath.length - 1]);
  
  // Also allow reverse direction (start near end, end near start)
  const startDistRev = distance(drawn[0], referencePath[referencePath.length - 1]);
  const endDistRev = distance(drawn[drawn.length - 1], referencePath[0]);
  
  const forwardCoverage = Math.max(startDist, endDist);
  const reverseCoverage = Math.max(startDistRev, endDistRev);
  const bestCoverage = Math.min(forwardCoverage, reverseCoverage);
  
  // Pass if: 30%+ of points are within tolerance AND reasonable coverage
  const valid = accuracy >= 0.3 && bestCoverage < 0.5;

  return { valid, accuracy, averageDeviation };
}

/**
 * Check if drawn path is roughly in the correct direction
 */
export function checkDirection(drawnPoints, referencePath, canvasWidth, canvasHeight) {
  if (drawnPoints.length < 2 || referencePath.length < 2) return true;
  
  const drawnStart = [drawnPoints[0][0] / canvasWidth, drawnPoints[0][1] / canvasHeight];
  const drawnEnd = [drawnPoints[drawnPoints.length - 1][0] / canvasWidth, drawnPoints[drawnPoints.length - 1][1] / canvasHeight];
  
  const refStart = referencePath[0];
  const refEnd = referencePath[referencePath.length - 1];
  
  const drawnDx = drawnEnd[0] - drawnStart[0];
  const drawnDy = drawnEnd[1] - drawnStart[1];
  const refDx = refEnd[0] - refStart[0];
  const refDy = refEnd[1] - refStart[1];
  
  const dot = drawnDx * refDx + drawnDy * refDy;
  return dot >= 0;
}
