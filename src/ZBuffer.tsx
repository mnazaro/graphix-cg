import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

const ZBuffer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<any[]>([]); 
  const [angleX, setAngleX] = useState<number>(0); 
  const [angleY, setAngleY] = useState<number>(0); 
  const [angleZ, setAngleZ] = useState<number>(0); 

  const initializeObjects = () => {
    const objs = [
        {
          vertices: [],
          faces: [],
          color: 'blue',
        },
        {
          vertices: [],
          faces: [],
          color: 'red',
        },
        {
          vertices: [],
          faces: [],
          color: 'yellow',
        },
        {
          vertices: [],
          faces: [],
          color: 'green',
        },
        {
          vertices: [
            [-20, -20, -20], [-20, -20, 20], [-20, 20, -20], [-20, 20, 20],
            [20, -20, -20], [20, -20, 20], [20, 20, -20], [20, 20, 20],
          ],
          faces: [
            [0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4],
            [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5],
          ],
          color: 'white',
        },
      ];
      
      for (let x = 10; x <= 30; x += 1) {
        for (let y = 20; y <= 40; y += 1) {
          objs[0].vertices.push([x, y, x * x + y]);
        }
      }
      objs[0].faces = [[0, 1, 2, 3]]; // Adicionando uma face simples para o objeto 1
  
      for (let x = 50; x <= 100; x += 1) {
        for (let y = 30; y <= 80; y += 1) {
          objs[1].vertices.push([x, y, 3 * x - 2 * y + 5]);
        }
      }
      objs[1].faces = [[0, 1, 2, 3]]; // Adicionando uma face simples para o objeto 2
  
      for (let t = 0; t <= 50; t += 1) {
        for (let a = 0; a <= 2 * Math.PI; a += Math.PI / 180) {
          objs[2].vertices.push([30 + Math.cos(a) * t, 50 + Math.sin(a) * t, 10 + t]);
        }
      }
      objs[2].faces = [[0, 1, 2, 3]]; // Adicionando uma face simples para o objeto 3
  
      for (let a = 0; a <= 2 * Math.PI; a += Math.PI / 180) {
        for (let b = 0; b <= 2 * Math.PI; b += Math.PI / 180) {
          objs[3].vertices.push([100 + 30 * Math.cos(a) * Math.cos(b), 50 + 30 * Math.cos(a) * Math.sin(b), 20 + 30 * Math.sin(a)]);
        }
      }
      objs[3].faces = [[0, 1, 2, 3]]; // Adicionando uma face simples para o objeto 4
  
      setObjects(objs);
    };

  const rotate3D = (point: number[], angleX: number, angleY: number, angleZ: number) => {
    const [x, y, z] = point;
    let nx = x, ny = y, nz = z;

    let tempY = ny;
    ny = ny * Math.cos(angleX) - nz * Math.sin(angleX);
    nz = tempY * Math.sin(angleX) + nz * Math.cos(angleX);

    let tempX = nx;
    nx = nx * Math.cos(angleY) + nz * Math.sin(angleY);
    nz = -tempX * Math.sin(angleY) + nz * Math.cos(angleY);

    tempX = nx;
    nx = nx * Math.cos(angleZ) - ny * Math.sin(angleZ);
    ny = tempX * Math.sin(angleZ) + ny * Math.cos(angleZ);

    return [nx, ny, nz];
  };

  const applyZBuffer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (ctx && objects.length > 0) {
      const zBuffer = Array(canvas.height).fill(null).map(() => Array(canvas.width).fill(Infinity));

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      objects.forEach((object) => {
        object.faces.forEach((face: number[]) => {
          const projectedFace = face.map((vertexIndex: number) => {
            const [x, y, z] = rotate3D(object.vertices[vertexIndex], angleX, angleY, angleZ);
            return { x: canvas.width / 2 + x, y: canvas.height / 2 - y, z };
          });

          for (let i = 0; i < projectedFace.length; i++) {
            const p1 = projectedFace[i];
            const p2 = projectedFace[(i + 1) % projectedFace.length];

            ctx.strokeStyle = object.color;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
    }
  };

  useEffect(() => {
    initializeObjects();
  }, []);

  useEffect(() => {
    applyZBuffer();
  }, [angleX, angleY, angleZ]);

  return (
    <Container className="mt-4" >
      <h1 className="text-center">Z-Buffer Practice</h1>
      <Row className="justify-content-center">
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          style={{ border: '1px solid black' }}
        ></canvas>
      </Row>
      <Row className="mt-4">
        <Col>
          <Form.Label>Rotation X</Form.Label>
          <Form.Control
            type="range"
            min={0}
            max={Math.PI * 2}
            step={0.1}
            value={angleX}
            onChange={(e) => setAngleX(parseFloat(e.target.value))}
          />
        </Col>
        <Col>
          <Form.Label>Rotation Y</Form.Label>
          <Form.Control
            type="range"
            min={0}
            max={Math.PI * 2}
            step={0.1}
            value={angleY}
            onChange={(e) => setAngleY(parseFloat(e.target.value))}
          />
        </Col>
        <Col>
          <Form.Label>Rotation Z</Form.Label>
          <Form.Control
            type="range"
            min={0}
            max={Math.PI * 2}
            step={0.1}
            value={angleZ}
            onChange={(e) => setAngleZ(parseFloat(e.target.value))}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ZBuffer;