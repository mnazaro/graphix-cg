import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { bresenham } from './functions/bresenham';

function App() { 
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [tool, setTool] = useState<string>('');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (event: React.MouseEvent) => {
    if(context) {
      context.beginPath();
      context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent) => {
    if(isDrawing && context) {
      const x = event.nativeEvent.offsetX;
      const y = event.nativeEvent.offsetY;

      switch(tool) {
        case 'line':
          drawLine(context, x, y);
          break;
        case 'ellipse':
          drawEllipse(context, x, y);
          break;
        case 'pixel':
          drawPixel(context, x, y);
          break;
        case 'eraser':
          erase(context, x, y);
          break;
        default:
          break;
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing && context) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  const drawEllipse = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.ellipse(x, y, 50, 50, 0, 0, 2 * Math.PI);
    context.stroke();
  };

  const drawPixel = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.fillRect(x, y, 1, 1);
  };

  const erase = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.clearRect(x, y, 10, 10);
  };

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
            <li onMouseLeave={() => setOpenMenuIndex(null)}>
              <span onClick={() => setOpenMenuIndex(openMenuIndex === 1 ? null : 1)}>
                Operações
              </span>
              {openMenuIndex === 1 && (
                <ul className="submenu">
                  <li onClick={() => setTool('line')}>Desenhar Reta</li>
                  <li onClick={() => setTool('ellipse')}>Desenhar Elipse</li>
                  <li onClick={() => setTool('pixel')}>Desenhar Pixel</li>
                  <li onClick={() => setTool('eraser')}>Borracha</li>
                </ul>
              )}
            </li>
          </ul>
        </header>
        <div className='paintboard'>
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={600}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              ></canvas>
        </div>
      </div>
    </>
  );
}

export default App;
