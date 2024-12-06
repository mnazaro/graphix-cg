// LightingExample.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

type Light = {
    position: [number, number, number];
    Ia: number; // Intensidade ambiental
    Id: number; // Intensidade difusa
    Is: number; // Intensidade especular
};

type Material = {
    Ka: number; // Coeficiente de reflexão ambiental
    Kd: number; // Coeficiente de reflexão difusa
    Ks: number; // Coeficiente de reflexão especular
    n: number; // Exponente de brilho
};

const LightingExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Estados para iluminação e materiais
    const [light, setLight] = useState<Light>({
        position: [100, 0, 100],
        Ia: 0.2,
        Id: 0.7,
        Is: 1.0,
    });

    const [observer] = useState<[number, number, number]>([0, 0, 100]);

    const [sphereMaterial, setSphereMaterial] = useState<Material>({
        Ka: 0.2,
        Kd: 0.3,
        Ks: 0.8,
        n: 10,
    });

    const [planeMaterial, setPlaneMaterial] = useState<Material>({
        Ka: 0.3,
        Kd: 0.7,
        Ks: 0.4,
        n: 10,
    });

    // Estados para rotação
    const [angleX, setAngleX] = useState<number>(0);
    const [angleY, setAngleY] = useState<number>(0);

    // Objetos 3D
    const sphere = {
        center: [0, 0, 0] as [number, number, number],
        radius: 50,
        material: sphereMaterial,
    };

    const plane = {
        center: [0, 0, -50] as [number, number, number], // Plano em z = -50
        size: 100, // Lado do plano
        material: planeMaterial,
        normal: [0, 0, 1] as [number, number, number], // Normal do plano
    };

    // Função para rotacionar um ponto 3D ao redor dos eixos X, Y e Z
    const rotate3D = (
        point: [number, number, number],
        angleX: number,
        angleY: number,
        angleZ: number
    ): [number, number, number] => {
        const [x, y, z] = point;

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
    const projectPoint = (
        point: [number, number, number]
    ): [number, number] => {
        const [x, y, z] = point;
        return [x, y];
    };

    // Função para calcular o vetor normal da esfera
    const getSphereNormal = (
        point: [number, number, number]
    ): [number, number, number] => {
        const [x, y, z] = point;
        const length = Math.sqrt(x * x + y * y + z * z);
        if (length === 0) return [0, 0, 0];
        return [x / length, y / length, z / length];
    };

    // Vetor normal do plano (constante)
    const planeNormal: [number, number, number] = plane.normal;

    // Função para calcular iluminação usando o modelo de Phong
    const calculateLighting = (
        point: [number, number, number],
        normal: [number, number, number],
        material: Material
    ): number => {
        // Vetor de luz (L) - direção da luz
        const [lx, ly, lz] = [
            light.position[0] - point[0],
            light.position[1] - point[1],
            light.position[2] - point[2],
        ];
        const L_length = Math.sqrt(lx * lx + ly * ly + lz * lz);
        if (L_length === 0) return light.Ia * material.Ka; // Evitar divisão por zero
        const L: [number, number, number] = [
            lx / L_length,
            ly / L_length,
            lz / L_length,
        ];

        // Vetor de observador (V) - direção do observador
        const [vx, vy, vz] = [
            observer[0] - point[0],
            observer[1] - point[1],
            observer[2] - point[2],
        ];
        const V_length = Math.sqrt(vx * vx + vy * vy + vz * vz);
        if (V_length === 0) return light.Ia * material.Ka; // Evitar divisão por zero
        const V: [number, number, number] = [
            vx / V_length,
            vy / V_length,
            vz / V_length,
        ];

        // Reflexão do vetor L em relação a N (R)
        const dotLN = normal[0] * L[0] + normal[1] * L[1] + normal[2] * L[2];
        const R: [number, number, number] = [
            2 * dotLN * normal[0] - L[0],
            2 * dotLN * normal[1] - L[1],
            2 * dotLN * normal[2] - L[2],
        ];
        const R_length = Math.sqrt(R[0] * R[0] + R[1] * R[1] + R[2] * R[2]);
        const R_normalized: [number, number, number] =
            R_length === 0
                ? [0, 0, 0]
                : [R[0] / R_length, R[1] / R_length, R[2] / R_length];

        // Cálculo dos termos de iluminação
        const ambient = light.Ia * material.Ka;

        const diffuse = light.Id * material.Kd * Math.max(dotLN, 0);

        const dotRV =
            R_normalized[0] * V[0] +
            R_normalized[1] * V[1] +
            R_normalized[2] * V[2];
        const specular =
            light.Is * material.Ks * Math.pow(Math.max(dotRV, 0), material.n);

        const intensity = ambient + diffuse + specular;

        // Clamping para garantir que o valor esteja entre 0 e 1
        return Math.min(Math.max(intensity, 0), 1);
    };

    // Função para renderizar a cena com Z-Buffer e iluminação
    const renderScene = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Inicializar o Z-Buffer com valores infinitos
        const zBuffer: number[][] = Array.from({ length: height }, () =>
            Array(width).fill(Infinity)
        );

        // Limpar o canvas e definir o fundo como preto
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        // Função para desenhar um pixel com cor calculada
        const drawPixel = (x: number, y: number, z: number, color: string) => {
            const px = Math.round(x);
            const py = Math.round(y);
            if (px < 0 || px >= width || py < 0 || py >= height) return;
            if (z < zBuffer[py][px]) {
                zBuffer[py][px] = z;
                ctx.fillStyle = color;
                ctx.fillRect(px, py, 1, 1);
            }
        };

        // Renderizar a Esfera
        const sphereRadius = sphere.radius;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                // Coordenadas cartesianas centradas no canvas
                const x = i - width / 2;
                const y = height / 2 - j;

                const distanceSquared = x * x + y * y;
                if (distanceSquared <= sphereRadius * sphereRadius) {
                    const z = Math.sqrt(
                        sphereRadius * sphereRadius - distanceSquared
                    );
                    const normal = getSphereNormal([x, y, z]);
                    const intensity = calculateLighting(
                        [x, y, z],
                        normal,
                        sphere.material
                    );
                    const brightness = Math.floor(intensity * 255);
                    const color = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    drawPixel(i, j, z, color);
                }
            }
        }

        // Renderizar o Plano
        const planeSize = plane.size;
        const planeZ = plane.center[2];
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const x = i - width / 2;
                const y = height / 2 - j;

                // Verificar se o ponto está dentro dos limites do plano
                if (
                    Math.abs(x) <= planeSize / 2 &&
                    Math.abs(y) <= planeSize / 2
                ) {
                    const z = planeZ;
                    const normal = planeNormal;
                    const intensity = calculateLighting(
                        [x, y, z],
                        normal,
                        plane.material
                    );
                    const brightness = Math.floor(intensity * 255);
                    const color = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    drawPixel(i, j, z, color);
                }
            }
        }
    };

    // Hook para renderizar a cena sempre que houver mudanças
    useEffect(() => {
        renderScene();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [light, sphereMaterial, planeMaterial, angleX, angleY]);

    // Funções para atualizar materiais
    const handleSphereMaterialChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof Material
    ) => {
        const value = parseFloat(e.target.value);
        setSphereMaterial((prev) => ({
            ...prev,
            [field]: isNaN(value) ? prev[field] : value,
        }));
    };

    const handlePlaneMaterialChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof Material
    ) => {
        const value = parseFloat(e.target.value);
        setPlaneMaterial((prev) => ({
            ...prev,
            [field]: isNaN(value) ? prev[field] : value,
        }));
    };

    // Funções para atualizar iluminação
    const handleLightChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof Light
    ) => {
        const value = parseFloat(e.target.value);
        if (field === 'position') {
            const index = parseInt(e.target.name);
            if (isNaN(index) || index < 0 || index > 2) return; // Validação adicional
            setLight((prev) => {
                const newPos: [number, number, number] = [...prev.position] as [
                    number,
                    number,
                    number
                ];
                newPos[index] = isNaN(value) ? newPos[index] : value;
                return { ...prev, position: newPos };
            });
        } else {
            setLight((prev) => ({
                ...prev,
                [field]: isNaN(value) ? prev[field] : value,
            }));
        }
    };

    return (
        <Container className="mt-4">
            <h1 className="text-center">Iluminação com Z-Buffer</h1>
            <Row className="justify-content-center">
                <Col>
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={500}
                        style={{ border: '1px solid black',
                                height: '100%',
                                width: '100%'
                        }}
                    ></canvas>
                </Col>
                {/* Informações */}
                <Col className='justify-content-between'>
                    <Row>
                        <h4>Informações</h4>
                        <p>
                            <strong>Observador:</strong> ({observer[0]},{' '}
                            {observer[1]}, {observer[2]})
                        </p>
                        <p>
                            <strong>Luz:</strong> ({light.position[0]},{' '}
                            {light.position[1]}, {light.position[2]})
                        </p>
                        <p>
                            <strong>Esfera:</strong> Centro = ({sphere.center[0]},{' '}
                            {sphere.center[1]}, {sphere.center[2]}), Raio ={' '}
                            {sphere.radius}
                        </p>
                        <p>
                            <strong>Plano:</strong> Centro = ({plane.center[0]},{' '}
                            {plane.center[1]}, {plane.center[2]}), Lado ={' '}
                            {plane.size}
                        </p>
                    </Row>
                    <Row>
                        <h4>Rotação do Objeto</h4>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Rotação X (
                                    {((angleX * 180) / Math.PI).toFixed(1)}°)
                                </Form.Label>
                                <Form.Control
                                    as="input"
                                    type="range"
                                    min={0}
                                    max={2 * Math.PI}
                                    step={0.01}
                                    value={angleX}
                                    onChange={(e) =>
                                        setAngleX(parseFloat(e.target.value))
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Rotação Y (
                                    {((angleY * 180) / Math.PI).toFixed(1)}°)
                                </Form.Label>
                                <Form.Control
                                    as="input"
                                    type="range"
                                    min={0}
                                    max={2 * Math.PI}
                                    step={0.01}
                                    value={angleY}
                                    onChange={(e) =>
                                        setAngleY(parseFloat(e.target.value))
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Row>
                </Col>
            </Row>
            <Row className="mt-4">
                {/* Controles de Iluminação */}
                <Col md={4}>
                    <h4>Configurações de Iluminação</h4>
                    <Form>
                        <Row>
                            <Col>    
                                <Form.Group className="mb-3">
                                    <Form.Label style={{textAlign: 'center'}}>Pos. da Luz (X)</Form.Label>
                                    <Form.Control
                                        as="input" // Especifica que o Form.Control deve renderizar um input
                                        type="number"
                                        value={light.position[0]}
                                        onChange={(e: any) =>
                                            handleLightChange(e, 'position')
                                        }
                                        name="0" // Índice para identificar o eixo
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{textAlign: 'center'}}>Pos. da Luz (Y)</Form.Label>
                                    <Form.Control
                                        as="input"
                                        type="number"
                                        value={light.position[1]}
                                        onChange={(e: any) =>
                                            handleLightChange(e, 'position')
                                        }
                                        name="1"
                                    />
                                </Form.Group>                            
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{textAlign: 'center'}}>Pos. da Luz (Z)</Form.Label>
                                    <Form.Control
                                        as="input"
                                        type="number"
                                        value={light.position[2]}
                                        onChange={(e: any) =>
                                            handleLightChange(e, 'position')
                                        }
                                        name="2"
                                    />
                                </Form.Group>                            
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Intensidade Ambiental (Ia)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={light.Ia}
                                onChange={(e: any) =>
                                    handleLightChange(e, 'Ia')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Intensidade Difusa (Id)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={light.Id}
                                onChange={(e: any) =>
                                    handleLightChange(e, 'Id')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Intensidade Especular (Is)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={light.Is}
                                onChange={(e: any) =>
                                    handleLightChange(e, 'Is')
                                }
                            />
                        </Form.Group>
                    </Form>
                </Col>

                {/* Controles de Material da Esfera */}
                <Col md={4}>
                    <h4>Material da Esfera</h4>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Ka (Ambiental)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={sphereMaterial.Ka}
                                onChange={(e: any) =>
                                    handleSphereMaterialChange(e, 'Ka')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Kd (Difusa)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={sphereMaterial.Kd}
                                onChange={(e: any) =>
                                    handleSphereMaterialChange(e, 'Kd')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ks (Especular)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={sphereMaterial.Ks}
                                onChange={(e: any) =>
                                    handleSphereMaterialChange(e, 'Ks')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Exponente de Brilho (n)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="1"
                                min="1"
                                max="100"
                                value={sphereMaterial.n}
                                onChange={(e: any) =>
                                    handleSphereMaterialChange(e, 'n')
                                }
                            />
                        </Form.Group>
                    </Form>
                </Col>

                {/* Controles de Material do Plano */}
                <Col md={4}>
                    <h4>Material do Plano</h4>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Ka (Ambiental)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={planeMaterial.Ka}
                                onChange={(e: any) =>
                                    handlePlaneMaterialChange(e, 'Ka')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Kd (Difusa)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={planeMaterial.Kd}
                                onChange={(e: any) =>
                                    handlePlaneMaterialChange(e, 'Kd')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ks (Especular)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={planeMaterial.Ks}
                                onChange={(e: any) =>
                                    handlePlaneMaterialChange(e, 'Ks')
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Exponente de Brilho (n)</Form.Label>
                            <Form.Control
                                as="input"
                                type="number"
                                step="1"
                                min="1"
                                max="100"
                                value={planeMaterial.n}
                                onChange={(e: any) =>
                                    handlePlaneMaterialChange(e, 'n')
                                }
                            />
                        </Form.Group>
                    </Form>
                </Col>
            </Row>

            <Row className="mt-4">
                {/* Controles de Rotação */}
                <Col md={6}>
                    
                </Col>

                
            </Row>
        </Container>
    );
};

export default LightingExample;
