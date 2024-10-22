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
    for (let theta = 0; theta <= 360; theta++) {
        let x = Math.round(radius * Math.cos(theta));
        let y = Math.round(radius * Math.sin(theta));
        linepoints.push([pointA[0] + x, pointA[1] + y]);
    }
    return linepoints;
}

// MARK: - 3 da aula 7
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