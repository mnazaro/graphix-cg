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

interface DrawnElement {
  type: string;
  points: [number, number][];
  color: string;
  id: number;
}

function App() { 
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [tool, setTool] = useState<string>('');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [pontoA, setPontoA] = React.useState<[number, number] | null>(null);
  const [drawnElements, setDrawnElements] = React.useState<DrawnElement[]>([]);

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
      let color = '#000000';
      let ident = 0;
      switch(tool) {
        //MARK: - Linhas
        case 'bresenhamLine':
          linepoints = drawBresehamLine(pontoA, pontoB);
          color = '#d3d3d3';
          break;
        case 'parametricLine':
          linepoints = drawParametricLine(pontoA, pontoB);
          color = '#c245a4';
          break;
        case 'normalLine':
          linepoints = drawLinearLine(pontoA, pontoB);
          color = '#f34a4a';
          break;
        //MARK: - Circulos
        case 'normalCircle':
          linepoints = drawNormalCircle(pontoA, pontoB);
          color = '#f34a4a';
          break;
        case 'parametricCircle':
          linepoints = drawParametricCircle(pontoA, pontoB);
          color = '#f34a4a';
          break;
        case 'bresenhamCircle':
          linepoints = drawBresenhamCircle(pontoA, pontoB);
          color = '#f34a4a';
          break;
        case 'simetricCircle':
          linepoints = drawSimetricCircle(pontoA, pontoB);
          color = '#f34a4a';  
          break;
        default:
          break;
      }

      const newElement: DrawnElement = {type: tool, points: linepoints, color, id: ident};
      setDrawnElements([...drawnElements, newElement]);
      ident += 1;

      context.fillStyle = color;
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