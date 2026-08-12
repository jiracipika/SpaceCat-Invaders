/**
 * Return a horizontal position that keeps a complete invader formation inside
 * the canvas. Sparse formations retain the preferred padding; dense formations
 * reduce the gap instead of spawning enemies beyond the right edge.
 */
export function getInvaderX({
  column,
  columns,
  canvasWidth,
  invaderWidth,
  preferredPadding,
  sideMargin,
}) {
  if (!Number.isInteger(columns) || columns < 1) {
    throw new RangeError('columns must be a positive integer');
  }
  if (!Number.isInteger(column) || column < 0 || column >= columns) {
    throw new RangeError('column must be within the formation');
  }

  const usableWidth = canvasWidth - (2 * sideMargin) - invaderWidth;
  if (usableWidth < 0) {
    throw new RangeError('canvas is too narrow for the invader and margins');
  }

  const preferredStep = invaderWidth + preferredPadding;
  const step = columns === 1
    ? 0
    : Math.min(preferredStep, usableWidth / (columns - 1));

  return sideMargin + (column * step);
}