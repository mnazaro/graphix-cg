import React from "react";

export const RGBtoHSL = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    let h = 0;
    let s = 0;
    const l = max * 100;

    if (max !== 0) {
        s = (max - min) / max;
    } else {
        return [h, s, l];
    }

    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = 60 * (0 + (g - b) / (max - min));
    } else if (max === g) {
        h = 60 * (2 + (b - r) / (max - min));
    } else if (max === b) {
        h = 60 * (4 + (r - g) / (max - min));
    }

    if (h < 0) {
        h += 360;
    }

    return [h, s * 100, l];
}

export const HSLtoRGB = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    let [r, g, b] = [0, 0, 0];

    if (s === 0) {
        r = g = b = l * 255;
        return [r, g, b];
    }

    h /= 60;

    let i = Math.floor(h);
    const f = h - i;
    const p = l * (1 - s);
    const q = l * (1 - s * f);
    const t = l * (1 - s * (1 - f));

    switch (i) {
        case 0:
            [r, g, b] = [l, t, p];
            break;
        case 1:
            [r, g, b] = [q, l, p];
            break;
        case 2:
            [r, g, b] = [p, l, t];
            break;
        case 3:
            [r, g, b] = [p, q, l];
            break;
        case 4:
            [r, g, b] = [t, p, l];
            break;
        case 5:
            [r, g, b] = [l, p, q];
            break;
    }

    return [r * 255, g * 255, b * 255]; 
}
        



