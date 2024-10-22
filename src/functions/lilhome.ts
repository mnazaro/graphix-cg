import React from "react";

export const lilhome = () => {
    let points: [number, number, number][] = [];
    let lines: [number, number][] = [];

    // MARK: - FRONT
    points.push([0, 0, 0]);
    points.push([0, 100, 0]);
    points.push([100, 100, 0]);
    points.push([100, 0, 0]);
    points.push([50,150,0]);
    
    // MARK: - BACK
    points.push([0, 0, 100]);
    points.push([0, 100, 100]);
    points.push([100, 100, 100]);
    points.push([100, 0, 100]);
    points.push([50,150,100]);

    // MARK: - LINES
    lines.push([0, 1]);
    lines.push([1, 2]);
    lines.push([2, 3]);
    lines.push([3, 0]);
    lines.push([0, 4]);
    lines.push([1, 4]);
    lines.push([2, 4]);
    lines.push([3, 4]);
    lines.push([5, 6]);
    lines.push([6, 7]);
    lines.push([7, 8]);
    lines.push([8, 5]);
    lines.push([5, 9]);
    lines.push([6, 9]);
    lines.push([7, 9]);
    lines.push([8, 9]);
    lines.push([0, 5]);
    lines.push([1, 6]);
    lines.push([2, 7]);
    lines.push([3, 8]);

    return {points, lines};
}

