// RotationalSweep.tsx
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

    // Função para rotacionar um ponto 3D ao redor dos eixos X, Y e Z
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

        let [x, y, z] = point;

        // Rotação em torno do eixo X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // Rotação em torno do eixo Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        // Rotação em torno do eixo Z
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);
        const x3 = x2 * cosZ - y1 * sinZ;
        const y3 = x2 * sinZ + y1 * cosZ;

        return [x3, y3, z2];
    };

    // Função para projetar um ponto 3D para 2D usando projeção ortográfica
    const projectPoint = (point: number[]): [number, number] => {
        const [x, y, z] = point;
        const scale = 1; // Ajuste conforme necessário
        return [x * scale, y * scale];
    };

    // Função para gerar pontos 3D a partir da curva desenhada
    const generate3DPoints = (): number[][] => {
        const points3D: number[][] = [];
        for (let i = 0; i < segments; i++) {
            const theta = (i * 2 * Math.PI) / segments;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            curvePoints.forEach(([x, y]) => {
                // Centralizar a curva no eixo Y
                const xCentered = x - 250; // Considerando canvas width=500
                const z = 0; // Inicialmente no plano Y
                // Rotação em torno do eixo Y
                const xRot = xCentered * cosTheta;
                const zRot = xCentered * sinTheta;
                points3D.push([xRot, y - 250, zRot]); // Centralizar no eixo Y
            });
        }
        return points3D;
    };

    // Função para projetar pontos com projeção ortográfica
    const projectPointPerspective = (point: number[]): [number, number] => {
        const [x, y, z] = point;
        const focalLength = 500;
        const scale = focalLength / (focalLength + z);
        return [x * scale, y * scale];
    };

    // Função para renderizar a varredura rotacional com Z-Buffer
    const renderSweep = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx && canvas) {
            // Definir o fundo como preto
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Inicializar o Z-Buffer
            const zBuffer: number[][] = Array.from(
                { length: canvas.height },
                () => Array(canvas.width).fill(Infinity)
            );

            // Desenhar eixo Y (eixo de rotação)
            ctx.strokeStyle = 'gray';
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            // Desenhar a curva desenhada pelo usuário
            if (curvePoints.length > 0) {
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                curvePoints.forEach(([x, y], index) => {
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            }

            // Gerar pontos 3D a partir da curva
            const points3D = generate3DPoints();

            points3D.forEach(([x, y, z]) => {
                // Aplicar rotação adicional para visualização
                const rotated = rotate3D([x, y, z], angleX, angleY, 0); // Rotação em torno do Z fixada em 0
                const projected = projectPoint(rotated); // Usando projeção ortográfica

                const screenX = Math.round(canvas.width / 2 + projected[0]);
                const screenY = Math.round(canvas.height / 2 - projected[1]); // Inverter Y para o sistema de coordenadas do canvas

                // Verificar se está dentro do canvas
                if (
                    screenX >= 0 &&
                    screenY >= 0 &&
                    screenX < canvas.width &&
                    screenY < canvas.height
                ) {
                    // Verificar Z-Buffer
                    if (rotated[2] < zBuffer[screenY][screenX]) {
                        zBuffer[screenY][screenX] = rotated[2];
                        ctx.fillStyle = 'blue';
                        ctx.fillRect(screenX - 1, screenY - 1, 2, 2); // Desenhar pontos como pequenos retângulos
                    }
                }
            });
        }
    };

    // Manipuladores de eventos do mouse
    const handleMouseDown = () => setDrawing(true);
    const handleMouseUp = () => setDrawing(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; // Canvas-relative X
        const y = e.clientY - rect.top; // Canvas-relative Y

        // Restringir desenho à metade esquerda do canvas
        if (x < rect.width / 2) {
            setCurvePoints((prev) => [...prev, [x, y]]);
        }
    };

    // Função para limpar a curva desenhada
    const clearCurve = () => {
        setCurvePoints([]);
    };

    // Função para salvar a curva desenhada como uma imagem (opcional)
    const saveImage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'rotational_sweep.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    // Hook para renderizar a varredura rotacional sempre que os parâmetros mudarem
    useEffect(() => {
        renderSweep();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curvePoints, angleX, angleY, segments]);

    return (
        <Container className="mt-4">
            <h1 className="text-center">Rotational Sweep with Z-Buffer</h1>
            <Row className="justify-content-center">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    style={{ border: '1px solid black', cursor: 'crosshair' }}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
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
                </Col>
                <Col>
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
                </Col>
                <Col>
                    <Form.Label>Segments</Form.Label>
                    <Form.Control
                        type="number"
                        min={3}
                        max={100}
                        value={segments}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 3 && value <= 100) {
                                setSegments(value);
                            }
                        }}
                    />
                </Col>
                <Col className="d-flex align-items-end">
                    <Button
                        variant="danger"
                        onClick={clearCurve}
                        className="me-2"
                    >
                        Clear Curve
                    </Button>
                    <Button variant="primary" onClick={saveImage}>
                        Save Image
                    </Button>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <p>
                        <strong>Instruções:</strong>
                    </p>
                    <ul>
                        <li>
                            <strong>Desenhar a Curva:</strong> Clique e arraste
                            no lado esquerdo do canvas para desenhar a curva de
                            perfil. A curva será desenhada em vermelho.
                        </li>
                        <li>
                            <strong>Rotacionar o Objeto:</strong> Use os sliders
                            de rotação X e Y para rotacionar o objeto gerado.
                        </li>
                        <li>
                            <strong>Alterar Resolução:</strong> Modifique o
                            número de segmentos para alterar a resolução da
                            varredura. Valores maiores resultam em uma varredura
                            mais suave.
                        </li>
                        <li>
                            <strong>Limpar a Curva:</strong> Use o botão "Clear
                            Curve" para apagar a curva desenhada e começar de
                            novo.
                        </li>
                        <li>
                            <strong>Salvar a Visualização:</strong> Utilize o
                            botão "Save Image" para salvar a visualização atual
                            do objeto como uma imagem PNG.
                        </li>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};

export default RotationalSweep;
