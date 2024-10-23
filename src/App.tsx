import React, { useState } from 'react';
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
   setIsDrawing(true);
  };

  const stopDrawing = (event: React.MouseEvent) => {
    if (isDrawing && context && pontoA) {
      const { offsetX, offsetY } = event.nativeEvent;
      const pontoB: [number, number] = [offsetX, offsetY];
      setIsDrawing(false);

      let linepoints: [number, number][] = [];
      switch(tool) {
        //MARK: - Linhas
        case 'bresenhamLine':
          linepoints = drawBresehamLine(pontoA, pontoB);
          context.fillStyle = '#d3d3d3';
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
          break;
        case 'parametricLine':
          linepoints = drawParametricLine(pontoA, pontoB);
          context.fillStyle = '#c245a4';
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
          break;
        case 'normalLine':
          linepoints = drawLinearLine(pontoA, pontoB);
          context.fillStyle = '#f34a4a';  
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
          break;
        //MARK: - Circulos
        case 'normalCircle':
          linepoints = drawNormalCircle(pontoA, pontoB);
          context.fillStyle = '#f34a4a';  
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
          break;
        case 'parametricCircle':
          linepoints = drawParametricCircle(pontoA, pontoB);
          context.fillStyle = '#f34a4a';  
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
          break;
        case 'bresenhamCircle':
          linepoints = drawBresenhamCircle(pontoA, pontoB);
          context.fillStyle = '#f34a4a';  
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
          break;
        case 'simetricCircle':
          linepoints = drawSimetricCircle(pontoA, pontoB);
          context.fillStyle = '#f34a4a';  
          linepoints.forEach((point) => {
            context.fillRect(point[0], point[1], 1, 1);
          });
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