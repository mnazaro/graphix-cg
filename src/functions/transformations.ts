type Point3D = { x: number; y: number; z: number };
type Matrix4x4 = number[][];

/** Translação */
export const translate = (point: Point3D, tx: number, ty: number, tz: number): Point3D => {
  return {
    x: point.x + tx,
    y: point.y + ty,
    z: point.z + tz,
  };
}

/** Escala */
export const scale = (point: Point3D, sx: number, sy: number, sz: number): Point3D => {
  return {
    x: point.x * sx,
    y: point.y * sy,
    z: point.z * sz,
  };
}

/** Rotação em torno do eixo especificado */
export const rotate = (point: Point3D, angle: number, axis: string): Point3D => {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  switch (axis) {
    case 'x':
      return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos,
      };
    case 'y':
      return {
        x: point.x * cos + point.z * sin,
        y: point.y,
        z: -point.x * sin + point.z * cos,
      };
    case 'z':
      return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos,
        z: point.z,
      };
    default:
      return point;
  }
}

/** Cisalhamento usando matriz 4x4 */
export const shear = (point: Point3D, matrix: Matrix4x4): Point3D => {
  const [x, y, z] = [
    matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * point.z,
    matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * point.z,
    matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * point.z,
  ];
  return { x, y, z };
}
