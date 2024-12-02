import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

const BilinearSurface: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angleX, setAngleX] = useState<number>(0);
  const [angleY, setAngleY] = useState<number>(0);
  const [angleZ, setAngleZ] = useState<number>(0);
  const [resolution, setResolution] = useState<number>(10);

  // Define the control points for the bilinear surface
  const controlPoints = [
    [0, 0, 0], [0, 40, 80],
    [20, 0, 0], [20, 40, 80],
  ];

  const interpolate = (u: number, v: number) => {
    const [P00, P01, P10, P11] = controlPoints;
    return [
      P00[0] * (1 - u) * (1 - v) +
        P01[0] * (1 - u) * v +
        P10[0] * u * (1 - v) +
        P11[0] * u * v,
      P00[1] * (1 - u) * (1 - v) +
        P01[1] * (1 - u) * v +
        P10[1] * u * (1 - v) +
        P11[1] * u * v,
      P00[2] * (1 - u) * (1 - v) +
        P01[2] * (1 - u) * v +
        P10[2] * u * (1 - v) +
        P11[2] * u * v,
    ];
  };

  const rotate3D = (point: number[], angleX: number, angleY: number, angleZ: number) => {
    const [x, y, z] = point;
    let nx = x, ny = y, nz = z;

    // Rotation around X-axis
    ny = y * Math.cos(angleX) - z * Math.sin(angleX);
    nz = y * Math.sin(angleX) + z * Math.cos(angleX);

    // Rotation around Y-axis
    nx = x * Math.cos(angleY) + nz * Math.sin(angleY);
    nz = -x * Math.sin(angleY) + nz * Math.cos(angleY);

    // Rotation around Z-axis
    nx = nx * Math.cos(angleZ) - ny * Math.sin(angleZ);
    ny = nx * Math.sin(angleZ) + ny * Math.cos(angleZ);

    return [nx, ny, nz];
  };

  const renderSurface = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      const zBuffer = Array(canvas.height).fill(null).map(() => Array(canvas.width).fill(Infinity));
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let u = 0; u <= 1; u += 1 / resolution) {
        for (let v = 0; v <= 1; v += 1 / resolution) {
          const point = interpolate(u, v);
          const rotatedPoint = rotate3D(point, angleX, angleY, angleZ);

          const screenX = canvas.width / 2 + rotatedPoint[0];
          const screenY = canvas.height / 2 - rotatedPoint[1];
          const depth = rotatedPoint[2];

          if (screenX >= 0 && screenY >= 0 && screenX < canvas.width && screenY < canvas.height) {
            if (depth < zBuffer[screenY][screenX]) {
              zBuffer[screenY][screenX] = depth;
              ctx.fillStyle = 'blue';
              ctx.fillRect(screenX, screenY, 2, 2);
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    renderSurface();
  }, [angleX, angleY, angleZ, resolution]);

  return (
    <Container className="mt-4">
      <h1 className="text-center">Bilinear Surface with Z-Buffer</h1>
      <Row className="justify-content-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
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
          <Form.Label>Resolution</Form.Label>
          <Form.Control
            type="number"
            value={resolution}
            onChange={(e) => setResolution(parseInt(e.target.value))}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default BilinearSurface;
