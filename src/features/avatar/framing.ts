export type Rect = { x: number; y: number; width: number; height: number };
// Only trim the atlas boundary line. Keep the pose itself, including hands and hair.
export const FRAME_GUTTER = .004;
export function cropFrame(width: number, height: number, frame: number, columns: number, rows: number): Rect {
  const cellWidth = width / columns, cellHeight = height / rows;
  return {
    x: (frame % columns + FRAME_GUTTER) * cellWidth,
    y: (Math.floor(frame / columns) + FRAME_GUTTER) * cellHeight,
    width: cellWidth * (1 - 2 * FRAME_GUTTER),
    height: cellHeight * (1 - 2 * FRAME_GUTTER),
  };
}
export function containFrame(source: Pick<Rect, 'width' | 'height'>, box: Rect, padding = .04): Rect {
  const availableWidth = box.width * (1 - padding * 2), availableHeight = box.height * (1 - padding * 2);
  const scale = Math.min(availableWidth / source.width, availableHeight / source.height);
  const width = source.width * scale, height = source.height * scale;
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

// Normalize measured cell edges from a source atlas. These bounds may be uneven;
// SVG and canvas consume the same rectangles rather than guessing an equal grid.
export function atlasFrames(width: number, height: number, xEdges: readonly number[], yEdges: readonly number[], gutter = FRAME_GUTTER): Rect[] {
  return yEdges.slice(0, -1).flatMap((top, row) => xEdges.slice(0, -1).map((left, column) => {
    const cellWidth = xEdges[column + 1] - left, cellHeight = yEdges[row + 1] - top;
    return { x: (left + cellWidth * gutter) / width, y: (top + cellHeight * gutter) / height,
      width: cellWidth * (1 - 2 * gutter) / width, height: cellHeight * (1 - 2 * gutter) / height };
  }));
}
