import React from "react";

// MARK: - y = raiz(r^2 - x^2) com simetria
export const drawNormalCircle = (pointA: [number, number], pointB: [number, number]) => {
    let linepoints: [number, number][] = [];
    let radius = Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));
    for (let x = -radius; x <= radius; x++) {
        let y = Math.round(Math.sqrt(radius * radius - x * x));
        linepoints.push([pointA[0] + x, pointA[1] + y]);
        linepoints.push([pointA[0] + x, pointA[1] - y]);
    }
    return linepoints;
}

// MARK: - EQ. PARAMETRICA
export const drawParametricCircle = (pointA: [number, number], pointB: [number, number]) => {
    let linepoints: [number, number][] = [];
    let radius = Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));
    for (let theta = 0; theta <= 6.28; theta += 0.01) {
        let x = Math.round(radius * Math.cos(theta));
        let y = Math.round(radius * Math.sin(theta));
        linepoints.push([pointA[0] + x, pointA[1] + y]);
    }
    return linepoints;
}

// MARK: - Bresenham
export const drawBresenhamCircle = (pointA: [number, number], pointB: [number, number]) => {
    let linepoints: [number, number][] = [];
    let radius = Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));
    let x = 0;
    let y = radius;
    let h = 1 - radius;
    let directionEast = 3;
    let directionSouthEast = -2 * radius + 5;

    while (y > x) {
        if (h < 0) {
            h += directionEast;
            directionEast += 2;
            directionSouthEast += 2;
        } else {
            h += directionSouthEast;
            directionEast += 2;
            directionSouthEast += 4;
            y--;
        }
        x++;
        linepoints.push([pointA[0] + x, pointA[1] + y]);
        linepoints.push([pointA[0] + x, pointA[1] - y]);
        linepoints.push([pointA[0] - x, pointA[1] + y]);
        linepoints.push([pointA[0] - x, pointA[1] - y]);
        linepoints.push([pointA[0] + y, pointA[1] + x]);
        linepoints.push([pointA[0] + y, pointA[1] - x]);
        linepoints.push([pointA[0] - y, pointA[1] + x]);
        linepoints.push([pointA[0] - y, pointA[1] - x]);
    }
    return linepoints;
}

// MARK: - Simetrico

export const drawSimetricCircle = (pointA: [number, number], pointB: [number, number]) => {
    let linepoints: [number, number][] = [];
    let radius = Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));
    let x = radius;
    let y = 0;
    let cos1 = Math.cos(1);
    let sin1 = Math.sin(1);

    for (let i = 1; i <= 360; i++) {
        let x1 = Math.round(x * cos1 - y * sin1);
        let y1 = Math.round(x * sin1 + y * cos1);
        linepoints.push([pointA[0] + x1, pointA[1] + y1]);
        x = x1;
        y = y1;
    }

    return linepoints;
}
