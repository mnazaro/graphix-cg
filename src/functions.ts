// functions.ts
export type Point3D = [number, number, number];
export type Point2D = [number, number];
export type Face = number[];

// Função para rotacionar um ponto 3D
export const rotate3D = (
    point: Point3D,
    angleX: number,
    angleY: number,
    angleZ: number
): Point3D => {
    if (!Array.isArray(point) || point.length !== 3) {
        console.error('Invalid point received in rotate3D:', point);
        return [0, 0, 0];
    }

    let [x, y, z] = point;

    // Rotação em torno do eixo X
    let rad = angleX;
    let cosa = Math.cos(rad);
    let sina = Math.sin(rad);
    let y1 = y * cosa - z * sina;
    let z1 = y * sina + z * cosa;
    y = y1;
    z = z1;

    // Rotação em torno do eixo Y
    rad = angleY;
    cosa = Math.cos(rad);
    sina = Math.sin(rad);
    let x1 = x * cosa + z * sina;
    let z2 = -x * sina + z * cosa;
    x = x1;
    z = z2;

    // Rotação em torno do eixo Z
    rad = angleZ;
    cosa = Math.cos(rad);
    sina = Math.sin(rad);
    let x2 = x * cosa - y * sina;
    let y2 = x * sina + y * cosa;
    x = x2;
    y = y2;

    return [x, y, z];
};

// Função para projeção ortogonal
export const orthographicProjection = (point: Point3D): Point2D => {
    const [x, y] = point;
    return [x, y];
};

// Função para desenhar um polígono preenchido (não utilizada no Z-Buffer, mas disponível para futuras melhorias)
export const drawFilledPolygon = (
    ctx: CanvasRenderingContext2D,
    points: Point2D[],
    color: string
) => {
    if (points.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
};
