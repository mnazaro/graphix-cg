
// Funções de preenchimento de polígonos

/**
 * Inversão de cores dentro de uma bounding-box
 * @param pixels Matriz bidimensional representando os pixels (1 = ativo, 0 = inativo)
 * @param xMin Extremo esquerdo da bounding-box
 * @param xMax Extremo direito da bounding-box
 * @param yMin Extremo superior da bounding-box
 * @param yMax Extremo inferior da bounding-box
 * @returns Nova matriz de pixels com os valores invertidos na bounding-box
 */
export const invertColorsBoundingBox = (
  pixels: number[][],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): number[][] => {
  const newPixels = [...pixels.map(row => [...row])];
  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      newPixels[y][x] = newPixels[y][x] === 0 ? 1 : 0;
    }
  }
  return newPixels;
};

/**
 * Flood-fill para preenchimento com vizinhança 4 ou 8
 * @param pixels Matriz bidimensional representando os pixels (1 = ativo, 0 = inativo)
 * @param seedX Coordenada X da semente
 * @param seedY Coordenada Y da semente
 * @param connectivity Tipo de conectividade (4 ou 8)
 * @returns Nova matriz de pixels com a região preenchida
 */
export const floodFill = (
  pixels: number[][],
  seedX: number,
  seedY: number,
  connectivity: 4 | 8
): number[][] => {
  const newPixels = [...pixels.map(row => [...row])];
  const stack: [number, number][] = [[seedX, seedY]];
  const rows = newPixels.length;
  const cols = newPixels[0].length;

  const directions4 = [
    [0, -1], // cima
    [0, 1],  // baixo
    [-1, 0], // esquerda
    [1, 0]   // direita
  ];

  const directions8 = [
    ...directions4,
    [-1, -1], // diagonal superior esquerda
    [1, -1],  // diagonal superior direita
    [-1, 1],  // diagonal inferior esquerda
    [1, 1]    // diagonal inferior direita
  ];

  const directions = connectivity === 4 ? directions4 : directions8;

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || y < 0 || x >= cols || y >= rows || newPixels[y][x] === 1) {
      continue;
    }

    // Preenche o pixel atual
    newPixels[y][x] = 1;

    // Adiciona vizinhos à pilha
    for (const [dx, dy] of directions) {
      stack.push([x + dx, y + dy]);
    }
  }

  return newPixels;
};
