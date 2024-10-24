import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
// import { bresenham } from './functions/bresenham';
import { lilhome } from './functions/lilhome';

import { 
  drawNormalCircle, 
  drawParametricCircle, 
  drawBresenhamCircle, 
  drawSimetricCircle 
} from './functions/pixelscircles';

import {
  drawLinearLine,
  drawBresehamLine,
  drawParametricLine
} from './functions/pixelslines';

import {
  rgbToHsl,
  hslToRgb,
  colorToHex,
} from './functions/convertions';

import { HslColorPicker, RgbColorPicker } from 'react-colorful';

interface DrawnElement {
  type: string;
  points: [number, number][];
  color: string;
  id: number;
}

function App() { 
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [tool, setTool] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [pontoA, setPontoA] = useState<[number, number] | null>(null);
  const [drawnElements, setDrawnElements] = useState<DrawnElement[]>([]);
  const [color, setColor] = useState<any>({ r: 0, g: 0, b: 0 });
  const [colorMode, setColorMode] = useState<string>('rgb');
  const [lineWidth, setLineWidth] = useState(1);
  const [, setForceRender] = useState(0); 

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);
  
  useEffect(() => {
    if (context) {
      context.lineWidth = lineWidth;
    }
  }, [lineWidth, context]);

  const increaseLineWidth = () => {
    if (context) {
      context.lineWidth += 1; // Aumenta o valor de lineWidth
      setForceRender(prev => prev + 1); // Força re-renderização
      console.log('linewidth: ', context.lineWidth);
    }
  };

  const decreaseLineWidth = () => {
    if (context && context.lineWidth > 1) {
      context.lineWidth -= 1; // Diminui o valor de lineWidth
      setForceRender(prev => prev + 1); // Força re-renderização
      console.log('linewidth: ', context.lineWidth);
    }
  };
  // Problema: Estado inicial começa com RGB, e o código tenta extrair HSL de um objeto RGB
  // Quero que 

  // useEffect(() => {
  //   console.log('colormode: ', colorMode)
  //   if (colorMode === 'hsl') {
  //     const { r, g, b } = color;
  //     console.log('color object hsl: ', color);
  //     const hslColor = rgbToHsl(r, g, b);
  //     setColor(hslColor);
  //     console.log('hsl color Array: ', hslColor);
  //   } else {
  //     const { h, s, l } = color;
  //     console.log('color object rgb: ', color);
  //     const rgbColor = hslToRgb(h, s, l);
  //     setColor(rgbColor);
  //     console.log('rgb color Array: ', rgbColor);
  //   }
  // }, [colorMode])

  const handleSetTool = (tool: string) => {
    setTool(tool);
    console.log(tool);
  }

  const handleClear = () => {
    if(context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }

  const startDrawing = (event: React.MouseEvent) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setPontoA([offsetX, offsetY]);
    setIsDrawing(true);

    if (context && tool === 'eraser') {
      context.fillStyle = '#FFFFFF';
      context.fillRect(offsetX, offsetY, context.lineWidth, context.lineWidth);
    }
  };

  const drawWhileMoving = (event: React.MouseEvent) => {
    if (!isDrawing || !context) return;
  
    const { offsetX, offsetY } = event.nativeEvent;
  
    if (tool === 'eraser') {
      context.fillStyle = '#FFFFFF';
      context.fillRect(offsetX, offsetY, context.lineWidth, context.lineWidth);
    }
  };

  const stopDrawing = (event: React.MouseEvent) => {
    if (isDrawing && context && pontoA) {
      const { offsetX, offsetY } = event.nativeEvent;
      const pontoB: [number, number] = [offsetX, offsetY];
      setIsDrawing(false);
  
      if (tool !== 'eraser') {
        let linepoints: [number, number][] = [];
        let ident = 0;
        switch (tool) {
          case 'bresenhamLine':
            linepoints = drawBresehamLine(pontoA, pontoB);
            break;
          case 'parametricLine':
            linepoints = drawParametricLine(pontoA, pontoB);
            break;
          case 'normalLine':
            linepoints = drawLinearLine(pontoA, pontoB);
            break;
          case 'normalCircle':
            linepoints = drawNormalCircle(pontoA, pontoB);
            break;
          case 'parametricCircle':
            linepoints = drawParametricCircle(pontoA, pontoB);
            break;
          case 'bresenhamCircle':
            linepoints = drawBresenhamCircle(pontoA, pontoB);
            break;
          case 'simetricCircle':
            linepoints = drawSimetricCircle(pontoA, pontoB);
            break;
          default:
            break;
        }
  
        const hexColor = colorToHex(color);
        const newElement: DrawnElement = { type: tool, points: linepoints, color: hexColor, id: ident };
        setDrawnElements([...drawnElements, newElement]);
        ident += 1;
  
        context.fillStyle = hexColor;
        context.strokeStyle = hexColor;
        plotPoints(context, linepoints);
      }
    }
  };

  const plotPoints = (context: CanvasRenderingContext2D, points: [number, number][]) => {
    context.beginPath();
    points.forEach(([x, y]) => {
      context.fillRect(x, y, context.lineWidth, context.lineWidth);
    });
    context.closePath();
  };

  const handleColorModeChange = (mode: string) => {
    setColorMode(mode);
    console.log('colormode: ', colorMode)
    console.log('mode: ', mode)
    if (mode === 'hsl') {
      const { r, g, b } = color;
      console.log('color object hsl: ', color);
      const hslColor = rgbToHsl(r, g, b);
      setColor(hslColor);
      console.log('hsl color Array: ', hslColor);
    } else {
      const { h, s, l } = color;
      console.log('color object rgb: ', color);
      const rgbColor = hslToRgb(h, s, l);
      setColor(rgbColor);
      console.log('rgb color Array: ', rgbColor);
    }
  }

  return (
    <> 
      <div className="body">
        <header className="header">
          <ul className='menu'>
            <li onMouseLeave={() => setOpenMenuIndex(null)}>
              <span onClick={() => setOpenMenuIndex(openMenuIndex === 0 ? null : 0)}>
                Arquivo
              </span>
              {openMenuIndex === 0 && (
                <ul className="submenu">
                  <li>Novo</li>
                  <li>Abrir</li>
                  <li>Salvar</li>
                </ul>
              )}
            </li>
            <li >
              <span onClick={() => setOpenMenuIndex(openMenuIndex === 1 ? null : 1)}>
                Operações
              </span>
              {openMenuIndex === 1 && (
                <ul className="submenu">
                  <li onClick={() => handleSetTool('bresenhamLine')}>Linha usando Bresenham</li>
                  <li onClick={() => handleSetTool('parametricLine')}>Linha usando Paramétrica</li>
                  <li onClick={() => handleSetTool('normalLine')}>Linha usando Equação Normal</li>
                  <li onClick={() => handleSetTool('normalCircle')}>Círculo usando Equação Normal</li>
                  <li onClick={() => handleSetTool('parametricCircle')}>Círculo usando Paramétrica</li>
                  <li onClick={() => handleSetTool('bresenhamCircle')}>Círculo usando Bresenham</li>
                  <li onClick={() => handleSetTool('simetricCircle')}>Círculo Simétrico</li>
                  <li onClick={() => handleSetTool('line')}>Desenhar Reta</li>
                  <li onClick={() => handleSetTool('eraser')}>Borracha</li>
                </ul>
              )}
            </li>
            <li className='plus-or-minus' onClick={increaseLineWidth}>+</li>
            <li className='current-size'>{context?.lineWidth}</li>
            <li className='plus-or-minus' onClick={decreaseLineWidth}>-</li>
            <li className='plus-or-minus' onClick={handleClear}>Clear</li>
          </ul>
        </header>
        <div className='paintboard'>
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={600}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={drawWhileMoving}
              ></canvas>
                <div>
                <button 
                  onClick={() => handleColorModeChange('rgb')}
                  disabled={colorMode === 'rgb'}
                >
                  RGB
                </button>
                <button
                  onClick={() => handleColorModeChange('hsl')}
                  disabled={colorMode === 'hsl'}
                >
                  HSL
                </button>
                <div className='color-picker'>
                  {colorMode === 'hsl' ? (
                    <>
                      <HslColorPicker color={color} onChange={(newColor) => setColor(newColor)} />
                        <div className='color-input-container'>
                        <label>
                        H:
                        <input
                          type="number"
                          value={color.h}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(360, Number(e.target.value)));
                            setColor({ ...color, h: value });
                          }}
                        />
                        </label>
                        <label>
                        S:
                        <input
                          type="number"
                          value={color.s}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value)));
                            setColor({ ...color, s: value });
                          }}
                        />
                        </label>
                        <label>
                        L:
                        <input
                          type="number"
                          value={color.l}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value)));
                            setColor({ ...color, l: value });
                          }}
                        />
                        </label>
                        </div>
                    </>
                  ) : (
                    <>
                      <RgbColorPicker color={color} onChange={(newColor) => setColor(newColor)} />
                      <div className='color-input-container'>
                        <label>
                        R:
                        <input
                          type="number"
                          value={color.r}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(255, Number(e.target.value)));
                            setColor({ ...color, r: value });
                          }}
                        />
                        </label>
                        <label>
                        G:
                        <input
                          type="number"
                          value={color.g}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(255, Number(e.target.value)));
                            setColor({ ...color, g: value });
                          }}
                        />
                        </label>
                        <label>
                        B:
                        <input
                          type="number"
                          value={color.b}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(255, Number(e.target.value)));
                            setColor({ ...color, b: value });
                          }}
                        />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
        </div>
      </div>
    </>
  );
}

export default App;