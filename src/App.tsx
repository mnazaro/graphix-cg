import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { bresenham } from './functions/bresenham';
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
  RGBtoHSL,
  HSLtoRGB
} from './functions/convertions';

function App() { 
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [tool, setTool] = useState<string>('');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [pontoA, setPontoA] = React.useState<[number, number] | null>(null);

  const handleSetTool = (tool: string) => {
    setTool(tool);
    console.log(tool);
  }

  React.useEffect(() => {
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

  const startDrawing = (event: React.MouseEvent) => {
   const { offsetX, offsetY } = event.nativeEvent;
   setPontoA([offsetX, offsetY]);
   console.log(pontoA);
   setIsDrawing(true);
  };

  // const draw = (event: React.MouseEvent) => {
  //   if(isDrawing && context) {
  //     const x = event.nativeEvent.offsetX;
  //     const y = event.nativeEvent.offsetY;

  //     switch(tool) {
  //       case 'pen':
  //         drawWithPen(context, x, y);
  //         break;
  //       case 'ellipse':
  //         drawEllipse(context, x, y);
  //         break;
  //       case 'line':
  //         //drawPixel(context, x, y);
  //         break;
  //       case 'eraser':
  //         erase(context, x, y);
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // };

  const stopDrawing = (event: React.MouseEvent) => {
    if (isDrawing && context && pontoA) {
      const { offsetX, offsetY } = event.nativeEvent;
      const pontoB: [number, number] = [offsetX, offsetY];
      console.log(pontoB);
      setIsDrawing(false);

      let linepoints: [number, number][] = [];
      switch(tool) {
        case 'pen':
          linepoints = drawBresehamLine(pontoA, pontoB);
          console.log(linepoints);
          break;
        case 'ellipse':
          drawBresenhamCircle(pontoA, pontoB).forEach(ponto => {
            context.fillRect(ponto[0], ponto[1], 1, 1);
          });
          break;
        case 'line':
          drawLinearLine(pontoA, pontoB);
          break;
        case 'eraser':
          // erase(context, pontoB[0], pontoB[1]);
          break;
        default:
          break;
      }
    }
  };

  const handleChangeSize = (value: number) => {
    if(context) {
      context.lineWidth += value;
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
                  <li onClick={() => handleSetTool('pen')}>Desenhar com Caneta</li>
                  <li onClick={() => handleSetTool('ellipse')}>Desenhar Elipse</li>
                  <li onClick={() => handleSetTool('line')}>Desenhar Reta</li>
                  <li onClick={() => handleSetTool('eraser')}>Borracha</li>
                </ul>
              )}
            </li>
            <li className='plus-or-minus' onClick={() => handleChangeSize(1)}>+</li>
            <li className='plus-or-minus' onClick={() => handleChangeSize(-1)}>-</li>
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
        </div>
      </div>
    </>
  );
}

export default App;