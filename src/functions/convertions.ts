export const rgbToHsl = (r: number, g: number, b: number): {h: number, s: number, l: number} => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue: number = 0, saturation, light = (max + min) / 2;

    if (max === min) {
      hue = saturation = 0; // achromatic
    } else {
      const delta = max - min;
      saturation = light > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      switch (max) {
        case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
        case g: hue = (b - r) / delta + 2; break;
        case b: hue = (r - g) / delta + 4; break;
        default: break;
      }
      hue *= 60;
    }

    return { h: Math.round(hue), s: Math.round(saturation * 100), l: Math.round(light * 100) };
  };

export const hslToRgb = (h: number, s: number, l: number): {r: number, g: number, b: number} => {
    let red, green, blue;

    s /= 100;
    l /= 100;

    if (s === 0) {
      red = green = blue = l; // achromatic
    } else {
      const hueToRgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      red = hueToRgb(p, q, h / 360 + 1 / 3);
      green = hueToRgb(p, q, h / 360);
      blue = hueToRgb(p, q, h / 360 - 1 / 3);
    }

    return { r: Math.round(red * 255), g: Math.round(green * 255), b: Math.round(blue * 255) };
  };

  type RGB = { r: number; g: number; b: number };
  type HSL = { h: number; s: number; l: number };
  
  export const componentToHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  export const rgbToHex = (rgb: RGB): string => {
    const { r, g, b } = rgb;
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
  }

  export const colorToHex = (color: RGB | HSL): string => {
    if ("r" in color && "g" in color && "b" in color) {
      return rgbToHex(color);
    } else if ("h" in color && "s" in color && "l" in color) {
      let { h, s, l } = color;
      const rgb = hslToRgb(h, s, l);
      return rgbToHex(rgb);
    }
    throw new Error("Invalid color format");
  }