import React from "react";

export const lilhome = () => {
    // let points: [number, number, number][] = [];
    let lines: [[number, number, number,], [number, number, number]][] = [];

    // // MARK: - FRONT
    // points.push([0, 0, 0]);         // 0
    // points.push([100, 0, 0]);       // 1
    // points.push([100, 100, 0]);     // 2
    // points.push([0, 100, 0]);       // 3
    // points.push([50, 150, 0]);      // 4
    
    // // MARK: - BACK
    // points.push([0, 0, 100]);       // 5
    // points.push([100, 0, 100]);     // 6
    // points.push([0, 100, 100]);     // 7
    // points.push([100, 100, 100]);   // 8
    // points.push([50, 150, 100]);    // 9

    // MARK: - LINES
    lines.push([[0, 0, 0], [100, 0, 0]]);
    lines.push([[0, 0, 0], [0, 100, 0]]);
    lines.push([[0, 0, 0], [0, 0, 100]]);
    lines.push([[100, 0, 0], [100, 0, 100]]);
    lines.push([[100, 0, 0], [100, 100, 0]]);
    lines.push([[100, 100, 0], [50, 150, 0]]);
    lines.push([[100, 100, 0], [100, 100, 100]]);
    lines.push([[0, 100, 0], [0, 100, 100]]);
    lines.push([[0, 100, 0], [50, 150, 0]]);
    lines.push([[50, 150, 0], [50, 150, 100]]);
    lines.push([[0, 0, 100], [0, 100, 100]]);
    lines.push([[0, 0, 100], [100, 0, 100]]);
    lines.push([[100, 0, 100], [100, 100, 100]]);
    lines.push([[100, 100, 100], [50, 150, 100]]);
    lines.push([[50, 150, 100], [0, 100, 100]]);


    return lines;
}

