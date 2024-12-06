// BilinearSurface.tsx
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form } from 'react-bootstrap';

const BilinearSurface: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [angleX, setAngleX] = useState<number>(0);
    const [angleY, setAngleY] = useState<number>(0);
    const [angleZ, setAngleZ] = useState<number>(0);
    const [resolution, setResolution] = useState<number>(10);

    // Define os pontos de controle para a superfície bilinear
    const controlPoints: number[][] = [
        [0, 0, 0], // P00
        [0, 40, 80], // P01
        [20, 0, 0], // P10
        [20, 40, 80], // P11
    ];

    const interpolate = (u: number, v: number): number[] => {
        if (!controlPoints || controlPoints.length !== 4) {
            console.error('Control points are not properly defined.');
            return [0, 0, 0];
        }

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

    const rotate3D = (
        point: number[],
        angleX: number,
        angleY: number,
        angleZ: number
    ): number[] => {
        if (!Array.isArray(point) || point.length !== 3) {
            console.error('Invalid point received in rotate3D:', point);
            return [0, 0, 0];
        }

        const [x, y, z] = point;

        // Rotação em torno do eixo X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotação em torno do eixo Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        // Rotação em torno do eixo Z
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        return [x3, y3, z2];
    };

    const renderSurface = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Definir o fundo como preto
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Inicializar o Z-Buffer
            const zBuffer: number[][] = Array.from(
                { length: canvas.height },
                () => Array(canvas.width).fill(Infinity)
            );

            for (let u = 0; u <= 1; u += 1 / resolution) {
                for (let v = 0; v <= 1; v += 1 / resolution) {
                    const point = interpolate(u, v);

                    // Verificar se o ponto é válido
                    if (!Array.isArray(point) || point.length !== 3) {
                        console.error(
                            `Invalid interpolated point at u=${u}, v=${v}:`,
                            point
                        );
                        continue;
                    }

                    const rotatedPoint = rotate3D(
                        point,
                        angleX,
                        angleY,
                        angleZ
                    );

                    const screenX = Math.round(
                        canvas.width / 2 + rotatedPoint[0]
                    );
                    const screenY = Math.round(
                        canvas.height / 2 - rotatedPoint[1]
                    );
                    const depth = rotatedPoint[2];

                    if (
                        screenX >= 0 &&
                        screenY >= 0 &&
                        screenX < canvas.width &&
                        screenY < canvas.height
                    ) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [angleX, angleY, angleZ, resolution]);

    return (
        <Container className="mt-4">
            <h1 className="text-center">Bilinear Surface with Z-Buffer</h1>
            <Row className="justify-content-center p-0">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    style={{ border: '1px solid black',
                            height: '500px',
                            width: '500px'
                     }}
                ></canvas>
            </Row>
            <Row className="mt-4">
                <Col>
                    <Form.Label>
                        Rotation X ({((angleX * 180) / Math.PI).toFixed(1)}°)
                    </Form.Label>
                    <Form.Control
                        type="range"
                        min={0}
                        max={2 * Math.PI}
                        step={0.01}
                        value={angleX}
                        onChange={(e) => setAngleX(parseFloat(e.target.value))}
                    />
                    <Form.Label>
                        Rotation Y ({((angleY * 180) / Math.PI).toFixed(1)}°)
                    </Form.Label>
                    <Form.Control
                        type="range"
                        min={0}
                        max={2 * Math.PI}
                        step={0.01}
                        value={angleY}
                        onChange={(e) => setAngleY(parseFloat(e.target.value))}
                    />
                    <Form.Label>
                        Rotation Z ({((angleZ * 180) / Math.PI).toFixed(1)}°)
                    </Form.Label>
                    <Form.Control
                        type="range"
                        min={0}
                        max={2 * Math.PI}
                        step={0.01}
                        value={angleZ}
                        onChange={(e) => setAngleZ(parseFloat(e.target.value))}
                    />
                    <Form.Label>Resolution</Form.Label>
                    <Form.Control
                        type="number"
                        min={1}
                        max={100}
                        value={resolution}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 100) {
                                setResolution(value);
                            }
                        }}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default BilinearSurface;
