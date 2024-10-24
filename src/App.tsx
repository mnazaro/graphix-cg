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
    if (colorMode === 'hsl') {
      const { r, g, b } = color;
      console.log('color object: ', color);
      const hslColor = rgbToHsl(r, g, b);
      setColor(hslColor);
      console.log('hsl color Array: ', hslColor);
    } else {
      const { h, s, l } = color;
      console.log('color object: ', color);
      const rgbColor = hslToRgb(h, s, l);
      setColor(rgbColor);
      console.log('rgb color Array: ', rgbColor);
    }
  }, [colorMode])

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
  //  console.log(pontoA);
   setIsDrawing(true);
  };

  const stopDrawing = (event: React.MouseEvent) => {
    if (isDrawing && context && pontoA) {
      const { offsetX, offsetY } = event.nativeEvent;
      const pontoB: [number, number] = [offsetX, offsetY];
      // console.log(pontoB);
      setIsDrawing(false);

      let linepoints: [number, number][] = [];
      let ident = 0;
      switch(tool) {
        //MARK: - Linhas
        case 'bresenhamLine':
          linepoints = drawBresehamLine(pontoA, pontoB);
          break;
        case 'parametricLine':
          linepoints = drawParametricLine(pontoA, pontoB);
          break;
        case 'normalLine':
          linepoints = drawLinearLine(pontoA, pontoB);
          break;
        //MARK: - Circulos
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

      let hexColor = colorToHex(color);

      const newElement: DrawnElement = {type: tool, points: linepoints, color: hexColor, id: ident};
      setDrawnElements([...drawnElements, newElement]);
      ident += 1;

      context.fillStyle = hexColor;
      context.strokeStyle = hexColor;
      console.log('context: ', context);
      plotPoints(context, linepoints);
    }
  };

  const plotPoints = (context: CanvasRenderingContext2D, points: [number, number][]) => {
    context.beginPath();
    points.forEach(([x, y]) => {
      context.fillRect(x, y, 1, 1);
    });
    context.closePath();
  };

  const handleChangeSize = (value: number) => {
    if(context) {
      context.lineWidth += value;
    }
  }

  // const handleCanvasClick = (event: React.MouseEvent) => {
  //   const { offsetX, offsetY } = event.nativeEvent;
  //   console.log(offsetX, offsetY);
  //   const clickedPoint: [number, number] = [offsetX, offsetY];

  //   drawnElements.forEach((element) => {
  //     element.points.forEach((point) => {
  //       if (Math.abs(point[0] - clickedPoint[0]) <= 5 && Math.abs(point[1] - clickedPoint[1]) <= 5) {
  //         console.log('Elemento clicado:', element);
  //       }
  //     });
  //   });
  // }


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
            <li className='plus-or-minus' onClick={() => handleChangeSize(1)}>+</li>
            <li className='current-size'>{context?.lineWidth}</li>
            <li className='plus-or-minus' onClick={() => handleChangeSize(-1)}>-</li>
            <li className='plus-or-minus' onClick={() => handleClear()}>Clear</li>
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
              ></canvas>
              <div>
                <button onClick={() => setColorMode('rgb')}>RGB</button>
                <button onClick={() => setColorMode('hsl')}>HSL</button>
                {colorMode === 'hsl' ? (
                  <HslColorPicker color={color} onChange={(newColor) => setColor(newColor)} />
                ) : (
                  <RgbColorPicker color={color} onChange={(newColor) => setColor(newColor)} />
                )}
              </div>
        </div>
      </div>
    </>
  );
}

export default App;