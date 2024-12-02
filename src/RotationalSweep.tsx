import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

const RotationalSweep: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [curvePoints, setCurvePoints] = useState<number[][]>([]);
  const [segments, setSegments] = useState<number>(20);
  const [angleX, setAngleX] = useState<number>(0);
  const [angleY, setAngleY] = useState<number>(0);

  const handleMouseDown = () => setDrawing(true);
  const handleMouseUp = () => setDrawing(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // Canvas-relative X
    const y = e.clientY - rect.top; // Canvas-relative Y

    // Restrict drawing to the left half of the canvas
    if (x < rect.width / 2) {
      setCurvePoints((prev) => [...prev, [x, y]]);
    }
  };

  const rotatePoint = (x: number, z: number, theta: number) => {
    return [
      x * Math.cos(theta) - z * Math.sin(theta),
      x * Math.sin(theta) + z * Math.cos(theta),
    ];
  };

  const generate3DPoints = () => {
    const points3D: number[][] = [];
    for (let i = 0; i < segments; i++) {
      const theta = (i * 2 * Math.PI) / segments;
      curvePoints.forEach(([x, y]) => {
        const [xRot, zRot] = rotatePoint(x - 125, 0, theta); // Adjust X for center
        points3D.push([xRot, y, zRot]);
      });
    }
    return points3D;
  };

  const renderSweep = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 500, 500);

      // Draw axis
      ctx.strokeStyle = 'gray';
      ctx.beginPath();
      ctx.moveTo(125, 0); // Vertical axis
      ctx.lineTo(125, 500);
      ctx.stroke();

      // Draw the curve
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      curvePoints.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Generate and draw 3D points
      const points3D = generate3DPoints();
      points3D.forEach(([x, y, z]) => {
        const screenX = 375 + x * Math.cos(angleY) - z * Math.sin(angleY); // Shift to the right half
        const screenY = 250 - y * Math.cos(angleX); // Adjust for rotation
        ctx.fillStyle = 'blue';
        ctx.fillRect(screenX - 2, screenY - 2, 4, 4);
      });
    }
  };

  useEffect(() => {
    renderSweep();
  }, [curvePoints, angleX, angleY, segments]);

  return (
    <Container className="mt-4">
      <h1 className="text-center">Rotational Sweep</h1>
      <Row className="justify-content-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          style={{ border: '1px solid black' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
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
          <Form.Label>Segments</Form.Label>
          <Form.Control
            type="number"
            min={3}
            max={100}
            value={segments}
            onChange={(e) => setSegments(parseInt(e.target.value))}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default RotationalSweep;
