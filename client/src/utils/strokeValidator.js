// ─── Stroke Validator ──────────────────────────────────────────────────────────
// Compares child's drawn stroke against a reference stroke path.
// Uses point-to-path distance with 15% tolerance as specified in the design doc.
// Dyslexia-friendly: does NOT require pixel-perfect tracing.

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
  return minDist;
}

/**
 * Validate a child's drawn stroke against a reference stroke.
 * 
 * @param {Array<[number, number]>} drawnPoints - Points the child drew (in canvas pixels)
 * @param {Array<[number, number]>} referencePath - Reference path points (normalized 0-1)
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels  
 * @param {number} tolerancePercent - Tolerance as percentage of letter height (default 15%)
 * @returns {{ valid: boolean, accuracy: number, averageDeviation: number }}
 */
export function validateStroke(drawnPoints, referencePath, canvasWidth, canvasHeight, tolerancePercent = 25) {
  if (!drawnPoints || drawnPoints.length < 3) {
    return { valid: false, accuracy: 0, averageDeviation: 1 };
  }
  
  // Normalize drawn points to 0-1 space
  const normalizedDrawn = drawnPoints.map(p => [
    p[0] / canvasWidth,
    p[1] / canvasHeight,
  ]);
  
  // Calculate tolerance in normalized space
  const tolerance = tolerancePercent / 100;
  
  // Sample points along the drawn path and check deviation from reference
  const sampleCount = Math.min(normalizedDrawn.length, 20);
  const step = Math.max(1, Math.floor(normalizedDrawn.length / sampleCount));
  
  let totalDeviation = 0;
  let sampledCount = 0;
  let withinTolerance = 0;
  
  for (let i = 0; i < normalizedDrawn.length; i += step) {
    const deviation = pointToPathDistance(normalizedDrawn[i], referencePath);
    totalDeviation += deviation;
    sampledCount++;
    if (deviation <= tolerance) withinTolerance++;
  }
  
  const averageDeviation = totalDeviation / sampledCount;
  const accuracy = withinTolerance / sampledCount;
  
  // Calculate drawn path length to ensure they didn't just tap
  let drawnLength = 0;
  for (let i = 0; i < normalizedDrawn.length - 1; i++) {
    drawnLength += distance(normalizedDrawn[i], normalizedDrawn[i + 1]);
  }
  const hasReasonableLength = drawnLength > 0.1; // at least 10% of canvas dimension
  
  // Stroke is valid if accuracy is reasonable AND they drew enough
  const valid = accuracy >= 0.4 && hasReasonableLength;
  
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
  
  // Check if drawn direction roughly matches reference direction
  const drawnDx = drawnEnd[0] - drawnStart[0];
  const drawnDy = drawnEnd[1] - drawnStart[1];
  const refDx = refEnd[0] - refStart[0];
  const refDy = refEnd[1] - refStart[1];
  
  // Dot product for direction similarity (positive = same direction)
  const dot = drawnDx * refDx + drawnDy * refDy;
  return dot >= 0; // Allow reverse direction for accessibility
}
