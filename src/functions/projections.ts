import React from "react";

export const projectPoint = (x: number, y: number, z: number, canvasWidth: number, canvasHeight: number) => {
    const focalLength = 500; // Distância focal para a projeção em perspectiva
    const scale = focalLength / (focalLength + z);
    const projectedX = x * scale + canvasWidth / 2;
    const projectedY = y * scale + canvasHeight / 2;
    return [projectedX, projectedY];
};