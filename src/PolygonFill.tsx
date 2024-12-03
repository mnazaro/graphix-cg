import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

// Importando funções de preenchimento de polígonos
import { invertColorsBoundingBox, floodFill } from './functions/polygonFill';

const PolygonFill: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pixels, setPixels] = useState<number[][]>(
        Array.from({ length: 20 }, () => Array(20).fill(0))
    ); // Grid de 20x20 pixels
    const [fillMode, setFillMode] = useState<'bounding-box' | 'flood-fill'>(
        'bounding-box'
    );
    const [connectivity, setConnectivity] = useState<4 | 8>(4); // Conectividade do Flood-fill
    const [seed, setSeed] = useState<[number, number] | null>(null); // Ponto de semente para flood-fill
    const [boundingBox, setBoundingBox] = useState<{
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    } | null>(null);

    // Manipular cliques no canvas
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 20); // Calcula o pixel clicado
        const y = Math.floor((e.clientY - rect.top) / 20);

        if (fillMode === 'flood-fill') {
            setSeed([x, y]);
        } else if (fillMode === 'bounding-box') {
            if (
                !boundingBox ||
                (boundingBox &&
                    boundingBox.xMax !== boundingBox.xMin &&
                    boundingBox.yMax !== boundingBox.yMin)
            ) {
                setBoundingBox({ xMin: x, yMin: y, xMax: x, yMax: y });
            } else {
                setBoundingBox((prev) =>
                    prev
                        ? { ...prev, xMax: x, yMax: y }
                        : { xMin: x, yMin: y, xMax: x, yMax: y }
                );
            }
        }
    };

    // Aplicar lógica de preenchimento de polígonos
    const applyFill = () => {
        if (fillMode === 'bounding-box' && boundingBox) {
            const xMin = Math.min(boundingBox.xMin, boundingBox.xMax);
            const xMax = Math.max(boundingBox.xMin, boundingBox.xMax);
            const yMin = Math.min(boundingBox.yMin, boundingBox.yMax);
            const yMax = Math.max(boundingBox.yMin, boundingBox.yMax);

            const newPixels = invertColorsBoundingBox(
                pixels,
                xMin,
                xMax,
                yMin,
                yMax
            );
            setPixels(newPixels);
            setBoundingBox(null); // Resetar bounding box após aplicar
        } else if (fillMode === 'flood-fill' && seed) {
            const newPixels = floodFill(pixels, seed[0], seed[1], connectivity);
            setPixels(newPixels);
            setSeed(null); // Resetar seed após aplicar
        }
    };

    // Renderizar pixels no canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx) {
            ctx.clearRect(0, 0, 400, 400);
            for (let y = 0; y < pixels.length; y++) {
                for (let x = 0; x < pixels[y].length; x++) {
                    ctx.fillStyle = pixels[y][x] === 1 ? 'red' : 'white';
                    ctx.fillRect(x * 20, y * 20, 20, 20);
                    ctx.strokeStyle = 'gray';
                    ctx.strokeRect(x * 20, y * 20, 20, 20);
                }
            }

            // Desenhar bounding box
            if (fillMode === 'bounding-box' && boundingBox) {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                const xMin = Math.min(boundingBox.xMin, boundingBox.xMax);
                const xMax = Math.max(boundingBox.xMin, boundingBox.xMax);
                const yMin = Math.min(boundingBox.yMin, boundingBox.yMax);
                const yMax = Math.max(boundingBox.yMin, boundingBox.yMax);
                ctx.strokeRect(
                    xMin * 20,
                    yMin * 20,
                    (xMax - xMin + 1) * 20,
                    (yMax - yMin + 1) * 20
                );
            }

            // Desenhar ponto de seed
            if (fillMode === 'flood-fill' && seed) {
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                ctx.arc(
                    seed[0] * 20 + 10,
                    seed[1] * 20 + 10,
                    5,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }
        }
    }, [pixels, boundingBox, seed, fillMode]);

    return (
        <Container className="mt-4">
            <h1>Polygon Fill</h1>
            <div className="mb-3">
                <Button
                    variant={
                        fillMode === 'bounding-box' ? 'primary' : 'secondary'
                    }
                    onClick={() => setFillMode('bounding-box')}
                    className="me-2"
                >
                    Bounding Box Mode
                </Button>
                <Button
                    variant={
                        fillMode === 'flood-fill' ? 'primary' : 'secondary'
                    }
                    onClick={() => setFillMode('flood-fill')}
                >
                    Flood Fill Mode
                </Button>
            </div>
            {fillMode === 'flood-fill' && (
                <div className="mb-3">
                    <Button
                        variant={connectivity === 4 ? 'primary' : 'secondary'}
                        onClick={() => setConnectivity(4)}
                        className="me-2"
                    >
                        Connectivity 4
                    </Button>
                    <Button
                        variant={connectivity === 8 ? 'primary' : 'secondary'}
                        onClick={() => setConnectivity(8)}
                    >
                        Connectivity 8
                    </Button>
                </div>
            )}
            <Button
                onClick={applyFill}
                className="mb-3"
                disabled={
                    (fillMode === 'bounding-box' && !boundingBox) ||
                    (fillMode === 'flood-fill' && !seed)
                }
            >
                Apply Fill
            </Button>
            <div>
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    style={{ border: '1px solid black' }}
                    onClick={handleCanvasClick}
                ></canvas>
            </div>
        </Container>
    );
};

export default PolygonFill;
