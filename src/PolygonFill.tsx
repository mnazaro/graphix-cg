import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Button, 
  Container,
  Row,
  Col,
  Form
} from 'react-bootstrap';

// Importing polygon fill functions
import { invertColorsBoundingBox, floodFill } from './functions/polygonFill';

const PolygonFill: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<number[][]>(Array(20).fill(Array(20).fill(0))); // 20x20 pixel grid
  const [fillMode, setFillMode] = useState<'bounding-box' | 'flood-fill'>('bounding-box');
  const [connectivity, setConnectivity] = useState<4 | 8>(4); // Flood-fill connectivity
  const [seed, setSeed] = useState<[number, number] | null>(null); // Seed point for flood-fill
  const [boundingBox, setBoundingBox] = useState<{ xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);

  // Handle canvas clicks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 20); // Calculate clicked pixel
    const y = Math.floor((e.clientY - rect.top) / 20);

    if (fillMode === 'flood-fill') {
      setSeed([x, y]);
    } else if (fillMode === 'bounding-box') {
      setBoundingBox((prev) =>
        prev
          ? { ...prev, xMax: x, yMax: y }
          : { xMin: x, yMin: y, xMax: x, yMax: y }
      );
    }
  };

  // Apply polygon fill logic
  const applyFill = () => {
    if (fillMode === 'bounding-box' && boundingBox) {
      const newPixels = invertColorsBoundingBox(
        pixels,
        boundingBox.xMin,
        boundingBox.xMax,
        boundingBox.yMin,
        boundingBox.yMax
      );
      setPixels(newPixels);
    } else if (fillMode === 'flood-fill' && seed) {
      const newPixels = floodFill(pixels, seed[0], seed[1], connectivity);
      setPixels(newPixels);
    }
  };

  // Render pixels on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 400, 400);
      for (let y = 0; y < pixels.length; y++) {
        for (let x = 0; x < pixels[y].length; x++) {
          ctx.fillStyle = pixels[y][x] === 1 ? 'red' : 'white';
          ctx.fillRect(x * 20, y * 20, 20, 20);
        }
      }
    }
  }, [pixels]);

  return (
    <div className="body">
      <h1>Polygon Fill</h1>
      <div>
        <Button onClick={() => setFillMode('bounding-box')}>Bounding Box Mode</Button>
        <Button onClick={() => setFillMode('flood-fill')}>Flood Fill Mode</Button>
      </div>
      {fillMode === 'flood-fill' && (
        <div>
          <Button onClick={() => setConnectivity(4)}>Connectivity 4</Button>
          <Button onClick={() => setConnectivity(8)}>Connectivity 8</Button>
        </div>
      )}
      <Button onClick={applyFill}>Apply Fill</Button>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ border: '1px solid black' }}
        onClick={handleCanvasClick}
      ></canvas>
    </div>
  );
};

export default PolygonFill;
