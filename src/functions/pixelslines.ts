import React from 'react';

// MARK: y = ax + b
export const drawLinearLine = (pointA: [number, number], pointB: [number, number]) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    let linepoints: [number, number][] = [];

    // Cálculo das diferenças
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    // Verificação para garantir que o ponto de início seja o correto
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    if (x0 === x1) {
        // Linha vertical
        for (let y = y0; y !== y1 + sy; y += sy) {
            linepoints.push([x0, y]);
        }
        return linepoints;
    }

    if (y0 === y1) {
        // Linha horizontal
        for (let x = x0; x !== x1 + sx; x += sx) {
            linepoints.push([x, y0]);
        }
        return linepoints;
    }

    const m = (y1 - y0) / (x1 - x0); // Cálculo da inclinação

    // Desenho da linha dependendo do ângulo
    if (dx > dy) {
        // Linhas mais horizontais (∆x > ∆y)
        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }
        for (let x = x0; x <= x1; x++) {
            let y = Math.round(m * (x - x0) + y0);
            linepoints.push([x, y]);
        }
    } else {
        // Linhas mais verticais (∆y > ∆x)
        if (y0 > y1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }
        for (let y = y0; y <= y1; y++) {
            let x = Math.round((y - y0) / m + x0);
            linepoints.push([x, y]);
        }
    }

    return linepoints;
}


// MARK: - BRESENHAM
export const drawLowLine = (pointA: [number, number], pointB: [number, number]) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let x = x0, y = y0;
    let yi = 1;
    let err = dx - dy;
    let linepoints: [number, number][] = [];

    if (dy < 0) {
        yi = -1;
        dy = -dy;
    }

    let direction =  2 * dy - dx;
    let directionEast = 2 * dy;
    let directionNorthEast = 2 * (dy - dx);

    while (x !== x1) {
        linepoints.push([x, y]);
        if (direction > 0) {
            x++;
            y += yi;
            direction += directionNorthEast;
        } else {
            x++;
            direction += directionEast;
        }
    }

    return linepoints;
}

export const drawHighLine = (pointA: [number, number], pointB: [number, number]) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let x = x0, y = y0;
    let xi = 1;
    let err = dx - dy;
    let linepoints: [number, number][] = [];

    if (dx < 0) {
        xi = -1;
        dx = -dx;
    }

    let direction =  2 * dx - dy;
    let directionNorth = 2 * dx;
    let directionNorthEast = 2 * (dx - dy);

    while (y !== y1) {
        linepoints.push([x, y]);
        if (direction > 0) {
            x += xi;
            y++;
            direction += directionNorthEast;
        } else {
            y++;
            direction += directionNorth;
        }
    }

    return linepoints;
}


export const drawBresenhamLine = (pointA: [number, number], pointB: [number, number]) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    let linepoints: [number, number][] = [];

    // Diferenças absolutas
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    // Direções de incremento
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    // Definição da variável de decisão
    let err = dx - dy;

    while (true) {
        linepoints.push([x0, y0]); // Adiciona o ponto atual

        // Verifica se chegou ao fim
        if (x0 === x1 && y0 === y1) break;

        const e2 = 2 * err;

        // Verifica se deve mover no eixo X
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }

        // Verifica se deve mover no eixo Y
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    return linepoints;
}

// MARK: - EQ. PARAMÉTRICA
export const drawParametricLine = (pointA: [number, number], pointB: [number, number]) => {
    let linepoints: [number, number][] = [];

    for (let t = 0; t <= 1; t += 0.001) {
        let x = Math.round(pointA[0] + t * (pointB[0] - pointA[0]));
        let y = Math.round(pointA[1] + t * (pointB[1] - pointA[1]));
        linepoints.push([x, y]);
    }

    return linepoints;
}



