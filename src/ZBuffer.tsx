// ZBuffer.tsx
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form } from 'react-bootstrap';
import {
    rotate3D,
    orthographicProjection,
    drawFilledPolygon,
    Point3D,
    Face,
} from './functions';

type Object3D = {
    vertices: Point3D[];
    faces: Face[];
    color: string;
};

const ZBuffer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [objects, setObjects] = useState<Object3D[]>([]);
    const [angleX, setAngleX] = useState<number>(0);
    const [angleY, setAngleY] = useState<number>(0);
    const [angleZ, setAngleZ] = useState<number>(0);

    const initializeObjects = () => {
        const objs: Object3D[] = [
            // Objeto 1 (Azul): z = x² + y, x ∈ [10,30], y ∈ [20,40]
            {
                vertices: [],
                faces: [],
                color: 'blue',
            },
            // Objeto 2 (Vermelho): z = 3x - 2y + 5, x ∈ [50,100], y ∈ [30,80]
            {
                vertices: [],
                faces: [],
                color: 'red',
            },
            // Objeto 3 (Amarelo): Paramétrico
            {
                vertices: [],
                faces: [],
                color: 'yellow',
            },
            // Objeto 4 (Verde): Paramétrico
            {
                vertices: [],
                faces: [],
                color: 'green',
            },
            // Objeto 5 (Branco): Cubo com lado 40, centro na origem
            {
                vertices: [],
                faces: [],
                color: 'white',
            },
        ];

        // Definindo o Objeto 1 (Azul)
        for (let x = 10; x <= 30; x += 5) {
            // Incrementos para reduzir a quantidade de vértices
            for (let y = 20; y <= 40; y += 5) {
                objs[0].vertices.push([x, y, x * x + y]);
            }
        }
        // Definindo as faces do Objeto 1 (como um grid simplificado)
        for (let i = 0; i < objs[0].vertices.length - 5; i++) {
            if ((i + 1) % 5 !== 0) {
                // Evita conectar vértices no final de uma linha
                objs[0].faces.push([i, i + 1, i + 6, i + 5]);
            }
        }

        // Definindo o Objeto 2 (Vermelho)
        for (let x = 50; x <= 100; x += 10) {
            // Incrementos para reduzir a quantidade de vértices
            for (let y = 30; y <= 80; y += 10) {
                objs[1].vertices.push([x, y, 3 * x - 2 * y + 5]);
            }
        }
        // Definindo as faces do Objeto 2 (como um grid simplificado)
        for (let i = 0; i < objs[1].vertices.length - 10; i++) {
            // Ajuste para step 10
            if ((i + 1) % 6 !== 0) {
                // 6 vértices por linha
                objs[1].faces.push([i, i + 1, i + 7, i + 6]);
            }
        }

        // Definindo o Objeto 3 (Amarelo)
        for (let t = 0; t <= 50; t += 10) {
            for (let a = 0; a < 2 * Math.PI; a += Math.PI / 2) {
                // Evite a=2pi duplicando vértices
                objs[2].vertices.push([
                    30 + Math.cos(a) * t,
                    50 + Math.sin(a) * t,
                    10 + t,
                ]);
            }
        }
        // Definindo as faces do Objeto 3 (como um grid simplificado)
        const verticesPerRing3 = 4; // Porque a passo é pi/2, 4 vértices por t
        for (let i = 0; i < objs[2].vertices.length - verticesPerRing3; i++) {
            if ((i + 1) % verticesPerRing3 !== 0) {
                objs[2].faces.push([
                    i,
                    i + 1,
                    i + 1 + verticesPerRing3,
                    i + verticesPerRing3,
                ]);
            }
        }

        // Definindo o Objeto 4 (Verde) - Esfera simplificada
        const segments = 8;
        const rings = 8;
        for (let a = 0; a < 2 * Math.PI; a += (2 * Math.PI) / segments) {
            for (let b = 0; b < 2 * Math.PI; b += (2 * Math.PI) / rings) {
                const x = 100 + 30 * Math.cos(a) * Math.cos(b);
                const y = 50 + 30 * Math.cos(a) * Math.sin(b);
                const z = 20 + 30 * Math.sin(a);
                objs[3].vertices.push([x, y, z]);
            }
        }
        // Definindo as faces do Objeto 4
        const vertsPerRing4 = rings;
        for (let i = 0; i < segments * rings; i++) {
            const nextRing = i + rings;
            const nextSeg = (i + 1) % rings;
            objs[3].faces.push([i, i + 1, i + 1 + rings, i + rings]);
        }

        // Definindo o Objeto 5 (Branco) - Cubo
        const size = 20;
        const cubeVertices: Point3D[] = [
            [-size, -size, -size],
            [size, -size, -size],
            [size, size, -size],
            [-size, size, -size],
            [-size, -size, size],
            [size, -size, size],
            [size, size, size],
            [-size, size, size],
        ];
        objs[4].vertices = cubeVertices;
        const cubeFaces: Face[] = [
            [0, 1, 2, 3], // Frente
            [4, 5, 6, 7], // Traseira
            [0, 1, 5, 4], // Inferior
            [2, 3, 7, 6], // Superior
            [0, 3, 7, 4], // Esquerda
            [1, 2, 6, 5], // Direita
        ];
        objs[4].faces = cubeFaces;

        setObjects(objs);
    };

    // Função para aplicar Z-Buffer e renderizar a cena
    const applyZBuffer = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configuração inicial
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Inicializar o Z-Buffer
        const zBuffer: number[][] = Array.from({ length: canvas.height }, () =>
            Array(canvas.width).fill(Infinity)
        );

        // Função para converter coordenadas para o canvas
        const toCanvasCoords = (point: [number, number]) => {
            return [point[0] + canvas.width / 2, -point[1] + canvas.height / 2];
        };

        // Lista de todos os polígonos a serem renderizados
        type Polygon = {
            vertices: Point3D[];
            color: string;
        };
        const polygons: Polygon[] = [];

        // Transformar e projetar todos os polígonos
        objects.forEach((object) => {
            object.faces.forEach((face) => {
                const transformed: Point3D[] = face.map((idx) => {
                    const vertex = object.vertices[idx];
                    if (!Array.isArray(vertex) || vertex.length !== 3) {
                        console.error(
                            `Invalid vertex at index ${idx} in object`,
                            object
                        );
                        return [0, 0, 0]; // Retorna um ponto padrão
                    }
                    return rotate3D(vertex, angleX, angleY, angleZ);
                });
                const projected: [number, number, number][] = transformed.map(
                    (p) => [p[0], p[1], p[2]]
                );
                polygons.push({
                    vertices: projected.map((p) => [p[0], p[1], p[2]]),
                    color: object.color,
                });
            });
        });

        // Ordenar os polígonos pelo z médio (Painel de fundo para a frente)
        polygons.sort((a, b) => {
            const zA =
                a.vertices.reduce((sum, v) => sum + v[2], 0) /
                a.vertices.length;
            const zB =
                b.vertices.reduce((sum, v) => sum + v[2], 0) /
                b.vertices.length;
            return zB - zA; // Renderiza primeiro os mais distantes
        });

        // Rasterizar cada polígono
        polygons.forEach((polygon) => {
            // Encontrar os limites do polígono
            const xs = polygon.vertices.map((v) => v[0]);
            const ys = polygon.vertices.map((v) => v[1]);
            const minX = Math.floor(Math.min(...xs));
            const maxX = Math.ceil(Math.max(...xs));
            const minY = Math.floor(Math.min(...ys));
            const maxY = Math.ceil(Math.max(...ys));

            // Iterar sobre cada pixel no bounding box do polígono
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    // Verificar se o ponto (x, y) está dentro do polígono
                    if (pointInPolygon(x, y, polygon.vertices)) {
                        // Encontrar o z do ponto (x, y) usando interpolação simples
                        const z = interpolateZ(x, y, polygon.vertices);
                        const canvasX = Math.round(x + canvas.width / 2);
                        const canvasY = Math.round(-y + canvas.height / 2);
                        if (
                            canvasX >= 0 &&
                            canvasX < canvas.width &&
                            canvasY >= 0 &&
                            canvasY < canvas.height
                        ) {
                            if (z < zBuffer[canvasY][canvasX]) {
                                zBuffer[canvasY][canvasX] = z;
                                ctx.fillStyle = polygon.color;
                                ctx.fillRect(canvasX, canvasY, 1, 1);
                            }
                        }
                    }
                }
            }
        });
    };

    // Função para verificar se um ponto está dentro de um polígono (Algoritmo de Ray Casting)
    const pointInPolygon = (
        x: number,
        y: number,
        vertices: Point3D[]
    ): boolean => {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i][0],
                yi = vertices[i][1];
            const xj = vertices[j][0],
                yj = vertices[j][1];
            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    };

    // Função para interpolar o valor de Z no ponto (x, y)
    const interpolateZ = (
        x: number,
        y: number,
        vertices: Point3D[]
    ): number => {
        // Para simplificar, usar o valor médio de Z
        const zSum = vertices.reduce((sum, v) => sum + v[2], 0);
        return zSum / vertices.length;
    };

    useEffect(() => {
        initializeObjects();
    }, []);

    useEffect(() => {
        applyZBuffer();
    }, [angleX, angleY, angleZ, objects]);

    return (
        <Container className="mt-4">
            <h1 className="text-center">Z-Buffer Practice</h1>
            <Row className="justify-content-center">
                <Col>
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={800}
                        style={{ border: '1px solid black' }}
                    ></canvas>
                </Col>
                <Col className='align-self-center'>
                    <Row className="mt-4">
                        <Col>
                            <Form.Label>Rotation X</Form.Label>
                            <Form.Control
                                type="range"
                                min={0}
                                max={2 * Math.PI}
                                step={0.01}
                                value={angleX}
                                onChange={(e) => setAngleX(parseFloat(e.target.value))}
                            />
                            <Form.Label>Rotation Y</Form.Label>
                            <Form.Control
                                type="range"
                                min={0}
                                max={2 * Math.PI}
                                step={0.01}
                                value={angleY}
                                onChange={(e) => setAngleY(parseFloat(e.target.value))}
                            />
                            <Form.Label>Rotation Z</Form.Label>
                            <Form.Control
                                type="range"
                                min={0}
                                max={2 * Math.PI}
                                step={0.01}
                                value={angleZ}
                                onChange={(e) => setAngleZ(parseFloat(e.target.value))}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            
        </Container>
    );
};

export default ZBuffer;
