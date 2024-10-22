import React from 'react';

// MARK: y = ax + b
export const drawLinearLine = (pointA: [number, number], pointB: [number, number]) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let linepoints: [number, number][] = [];

    if (x0 === x1) {
        for (let y = y0; y !== y1; y += sy) {
            linepoints.push([x0, y]);
        }
        return linepoints;
    }

    if (y0 === y1) {
        for (let x = x0; x !== x1; x += sx) {
            linepoints.push([x, y0]);
        }
        return linepoints;
    }

    let coeficient = dy / dx;

    if (dy > dx) {
        if( x0 > x1){
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }
        for (let x = x0; x !== x1; x += sx) {
            let y = Math.round(y0 + coeficient * (x - x0));
            linepoints.push([x, y]);
        }
    } else {
        if( y0 > y1){
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }
        for (let y = y0; y !== y1; y += sy) {
            let x = Math.round(x0 + (y - y0) / coeficient);
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


export const drawBresehamLine = (pointA: [number, number], pointB: [number, number]) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    
    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
        if (x0 > x1) {
            return drawLowLine(pointB, pointA);
        } else {
            return drawLowLine(pointA, pointB);
        }
    } else {
        if (y0 > y1) {
            return drawHighLine(pointB, pointA);
        } else {
            return drawHighLine(pointA, pointB);
        }
    }
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



