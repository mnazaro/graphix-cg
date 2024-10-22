import React from "react";

export const cutCohenSutherland = (pointA: [number, number], pointB: [number, number], xLeft: number, xRight: number, yBottom: number, yTop: number) => {
    let [x0, y0] = pointA;
    let [x1, y1] = pointB;
    let bits = {
        left: 1,
        right: 2,
        bottom: 4,
        top: 8
    };
};
            

