import React from "react";

export const transformScale = (x: number, y: number, sx: number, sy: number): [number, number] => {
  return [x * sx, y * sy];
};

export const transformTranslate = (x: number, y: number, dx: number, dy: number): [number, number] => {
  return [x + dx, y + dy];
};

export const transformRotate = (x: number, y: number, angle: number): [number, number] => {
  const rad = angle * Math.PI / 180;
  return [
    x * Math.cos(rad) - y * Math.sin(rad),
    x * Math.sin(rad) + y * Math.cos(rad)
  ];
};

export const transformShear = (x: number, y: number, shx: number, shy: number): [number, number] => {
  return [x + shx * y, y + shy * x];
};

