/**
 * Snaps a value to the nearest grid point
 * @param value - The value to snap
 * @param gridSize - The grid size (default: 2.5)
 * @returns The snapped value
 */
export const snapToGrid = (value: number, gridSize: number = 2.5): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snaps an endpoint to the nearest angle from a start point
 * @param startPoint - The starting point
 * @param endPoint - The ending point to snap
 * @param snapAngles - Array of angles in degrees to snap to (default: [0, 45, 90, 135, 180])
 * @returns The snapped endpoint coordinates
 */
export const snapToAngle = (
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  snapAngles: number[] = [0, 45, 90, 135, 180]
): { x: number; y: number } => {
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  let closestAngle = snapAngles[0];
  let minDiff = Math.abs(angle - closestAngle);

  for (const snapAngle of snapAngles) {
    const diff = Math.abs(angle - snapAngle);
    if (diff < minDiff) {
      minDiff = diff;
      closestAngle = snapAngle;
    }
  }

  const distance = Math.sqrt(dx * dx + dy * dy);
  const radians = closestAngle * (Math.PI / 180);

  return {
    x: startPoint.x + distance * Math.cos(radians),
    y: startPoint.y + distance * Math.sin(radians),
  };
};