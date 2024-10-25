import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Modal, 
  Button, 
  Form, 
  InputGroup,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap';
// import { bresenham } from './functions/bresenham';
import { lilhome } from './functions/lilhome';

import { 
  drawNormalCircle, 
  drawParametricCircle, 
  drawBresenhamCircle, 
  drawSimetricCircle 
} from './functions/pixelscircles';

import {
  drawLinearLine,
  drawBresenhamLine,
  drawParametricLine
} from './functions/pixelslines';

import {
  rgbToHsl,
  hslToRgb,
  colorToHex,
} from './functions/convertions';

import { projectPoint } from './functions/projections';

import { scale, translate, rotate, shear } from './functions/transformations';

import { HslColorPicker, RgbColorPicker } from 'react-colorful';

interface DrawnElement {
  type: string;
  points: [number, number][];
  color: string;
  id: number;
}

function App() {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [tool, setTool] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [pontoA, setPontoA] = useState<[number, number] | null>(null);
  const [drawnElements, setDrawnElements] = useState<DrawnElement[]>([]);
  const [color, setColor] = useState<any>({ r: 0, g: 0, b: 0 });
  const [colorMode, setColorMode] = useState<string>('rgb');
  const [lineWidth, setLineWidth] = useState(1);
  const [, setForceRender] = useState(0); 

  const [formData, setFormData] = useState({
    scaleType: 'local',
    sx: 1,
    sy: 1,
    sz: 1,
    s: 1,
    translateType: false,
    tx: 0,
    ty: 0,
    tz: 0,
    rotateType: 'origem',
    axis: 'x',
    angle: 0,
    shearMatrix: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]
  });

  const [openModal, setOpenModal] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasPreviewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = canvasPreviewRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    if (previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      if (ctx) {
        drawHouse(ctx);
      }
    }
  }, []);
  
  useEffect(() => {
    if (context) {
      context.lineWidth = lineWidth;
    }
  }, [lineWidth, context]);

  const increaseLineWidth = () => {
    if (context) {
      context.lineWidth += 1; // Aumenta o valor de lineWidth
      setForceRender(prev => prev + 1); // Força re-renderização
      console.log('linewidth: ', context.lineWidth);
    }
  };

  const decreaseLineWidth = () => {
    if (context && context.lineWidth > 1) {
      context.lineWidth -= 1; // Diminui o valor de lineWidth
      setForceRender(prev => prev + 1); // Força re-renderização
      console.log('linewidth: ', context.lineWidth);
    }
  };

  const handleSetTool = (tool: string) => {
    setTool(tool);
    setOpenMenuIndex(null);
    console.log(tool);
  }

  const handleClear = () => {
    if(context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }

  const startDrawing = (event: React.MouseEvent) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setPontoA([offsetX, offsetY]);
    setIsDrawing(true);

    if (context && tool === 'eraser') {
      context.fillStyle = '#FFFFFF';
      context.fillRect(offsetX, offsetY, context.lineWidth, context.lineWidth);
    }
  };

  const drawWhileMoving = (event: React.MouseEvent) => {
    if (!isDrawing || !context) return;
  
    const { offsetX, offsetY } = event.nativeEvent;
  
    if (tool === 'eraser') {
      context.fillStyle = '#FFFFFF';
      context.fillRect(offsetX, offsetY, context.lineWidth, context.lineWidth);
    }
  };

  const stopDrawing = (event: React.MouseEvent) => {
    if (isDrawing && context && pontoA) {
      const { offsetX, offsetY } = event.nativeEvent;
      const pontoB: [number, number] = [offsetX, offsetY];
      setIsDrawing(false);
  
      if (tool !== 'eraser') {
        let linepoints: [number, number][] = [];
        let ident = 0;
        switch (tool) {
          case 'bresenhamLine':
            linepoints = drawBresenhamLine(pontoA, pontoB);
            break;
          case 'parametricLine':
            linepoints = drawParametricLine(pontoA, pontoB);
            break;
          case 'normalLine':
            linepoints = drawLinearLine(pontoA, pontoB);
            break;
          case 'normalCircle':
            linepoints = drawNormalCircle(pontoA, pontoB);
            break;
          case 'parametricCircle':
            linepoints = drawParametricCircle(pontoA, pontoB);
            break;
          case 'bresenhamCircle':
            linepoints = drawBresenhamCircle(pontoA, pontoB);
            break;
          case 'simetricCircle':
            linepoints = drawSimetricCircle(pontoA, pontoB);
            break;
          default:
            break;
        }
  
        const hexColor = colorToHex(color);
        const newElement: DrawnElement = { type: tool, points: linepoints, color: hexColor, id: ident };
        setDrawnElements([...drawnElements, newElement]);
        ident += 1;
  
        context.fillStyle = hexColor;
        context.strokeStyle = hexColor;
        plotPoints(context, linepoints);
      }
    }
  };

  const plotPoints = (context: CanvasRenderingContext2D, points: [number, number][]) => {
    context.beginPath();
    points.forEach(([x, y]) => {
      context.fillRect(x, y, context.lineWidth, context.lineWidth);
    });
    context.closePath();
  };

  const handleChangeSize = (value: number) => {
    if(context) {
      context.lineWidth += value;
    }
  }

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, 
      [name]: type === 'checkbox' ? checked : value

    });
  };

  const handleMatrixChange = (row: any, col: any, value: any) => {
    const newMatrix = [...formData.shearMatrix];
    newMatrix[row][col] = parseFloat(value) || 0;
    setFormData({ ...formData, shearMatrix: newMatrix });
  };

  useEffect(() => {
    const canvas = canvasPreviewRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        drawHouse(context);
      }
    }
  }, [formData]);


  const handleColorModeChange = (mode: string) => {
    setColorMode(mode);
    console.log('colormode: ', colorMode)
    console.log('mode: ', mode)
    if (mode === 'hsl') {
      const { r, g, b } = color;
      console.log('color object hsl: ', color);
      const hslColor = rgbToHsl(r, g, b);
      setColor(hslColor);
      console.log('hsl color Array: ', hslColor);
    } else {
      const { h, s, l } = color;
      console.log('color object rgb: ', color);
      const rgbColor = hslToRgb(h, s, l);
      setColor(rgbColor);
      console.log('rgb color Array: ', rgbColor);
    }
  }

  const applyTransformations = (point: [number, number, number]) => {
    let [x, y, z] = point;
    let transformedPoint = { x, y, z };

    if(formData.scaleType === 'local') {
       transformedPoint = scale(transformedPoint, formData.sx, formData.sy, formData.sz);
    } else {
      transformedPoint = scale(transformedPoint, formData.s, formData.s, formData.s);
    }

    if(formData.translateType) {
      transformedPoint = translate(transformedPoint, formData.tx, formData.ty, formData.tz);
    }

    if(formData.rotateType === 'origem') {
      transformedPoint = rotate(transformedPoint, formData.angle, formData.axis);
    }

    transformedPoint = shear(transformedPoint, formData.shearMatrix);

    return transformedPoint;
  }

  const drawHouse = (context: CanvasRenderingContext2D) => {
    const lines = lilhome();
    
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.beginPath();
    lines.forEach(([[x0, y0, z0], [x1, y1, z1]]) => {
      const pointTransformed0 = applyTransformations([x0, y0, z0]);
      const pointTransformed1 = applyTransformations([x1, y1, z1]);
      const [projX0, projY0] = projectPoint(pointTransformed0.x, pointTransformed0.y, pointTransformed0.z, context.canvas.width, context.canvas.height);
      const [projX1, projY1] = projectPoint(pointTransformed1.x, pointTransformed1.y, pointTransformed1.z, context.canvas.width, context.canvas.height);
      context.moveTo(projX0, projY0);
      context.lineTo(projX1, projY1);
    });
    context.closePath();
    context.fillStyle = '#000000';
    context.stroke();    
  };


  const desenhar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Se não existir, sai da função
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Se o contexto não puder ser obtido, sai da função
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    let ponto = { x: 50, y: 50, z: 0 }; // Exemplo de ponto inicial
    ponto = scale(ponto, formData.sx, formData.sy, formData.sz);
    ponto = translate(ponto, formData.tx, formData.ty, formData.tz);
    ponto = rotate(ponto, formData.angle, formData.axis);
    ponto = shear(ponto, formData.shearMatrix);
  
    ctx.beginPath();
    ctx.arc(ponto.x, ponto.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  return (
    <> 
      <div className="body">
        <header className="header">
          <ul className='menu'>
            <li >
              <span onClick={() => setOpenMenuIndex(openMenuIndex === 1 ? null : 1)}>
                Operações
              </span>
              {openMenuIndex === 1 && (
                <ul className="submenu">
                  <li onClick={() => handleSetTool('bresenhamLine')}>Linha usando Bresenham</li>
                  <li onClick={() => handleSetTool('parametricLine')}>Linha usando Paramétrica</li>
                  <li onClick={() => handleSetTool('normalLine')}>Linha usando Equação Normal</li>
                  <li onClick={() => handleSetTool('normalCircle')}>Círculo usando Equação Normal</li>
                  <li onClick={() => handleSetTool('parametricCircle')}>Círculo usando Paramétrica</li>
                  <li onClick={() => handleSetTool('bresenhamCircle')}>Círculo usando Bresenham</li>
                  <li onClick={() => handleSetTool('simetricCircle')}>Círculo Simétrico</li>
                  <li onClick={() => handleSetTool('line')}>Desenhar Reta</li>
                  <li onClick={() => handleSetTool('eraser')}>Borracha</li>
                </ul>
              )}
            </li>
            <li className='plus-or-minus' onClick={increaseLineWidth}>+</li>
            <li className='current-size'>{context?.lineWidth}</li>
            <li className='plus-or-minus' onClick={decreaseLineWidth}>-</li>
            <li onClick={handleClear}>Clear</li>
            <li onClick={() => setOpenModal(true)}>Casinha</li>
          </ul>
        </header>
        <div className="row">
          <div className='paintboard col-md-12'>
            <canvas 
              ref={canvasRef} 
              width={1000} 
              height={500}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onMouseMove={drawWhileMoving}
            ></canvas>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className='color-picker col-md-12'>
            <ToggleButtonGroup 
              type="radio" name="colorMode" 
              value={colorMode} onChange={handleColorModeChange}
              >
              <ToggleButton id="tbg-radio-1" value={'rgb'}>
                RGB
              </ToggleButton>
              <ToggleButton id="tbg-radio-2" value={'hsl'}>
                HSL
              </ToggleButton>
            </ToggleButtonGroup>
            {colorMode === 'hsl' ? (
              <>
                <HslColorPicker 
                  color={color} 
                  onChange={(newColor) => setColor(newColor)} 
                  style={{ width: '750px' }} 
                  />
                  <div className='color-input-container'>
                    <Form.Group controlId="formColorH">
                      <InputGroup style={{ width: '120px' }}>
                        <InputGroup.Text>H</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={color.h}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(360, Number(e.target.value)));
                            setColor({ ...color, h: value });
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="formColorS">
                      <InputGroup style={{ width: '120px' }}>
                        <InputGroup.Text>S</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={color.s}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value)));
                            setColor({ ...color, s: value });
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="formColorL">
                      <InputGroup style={{ width: '120px' }}>
                        <InputGroup.Text>L</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={color.l}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value)));
                            setColor({ ...color, l: value });
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
              </>
            ) : (
              <>
                <RgbColorPicker 
                  color={color} 
                  onChange={(newColor) => setColor(newColor)} 
                  style={{ width: '750px' }}
                />
                <div className='color-input-container'>
                  <Form.Group controlId="formColorR">
                    <InputGroup style={{ width: '120px' }}>
                      <InputGroup.Text>R</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={color.r}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(255, Number(e.target.value)));
                          setColor({ ...color, r: value });
                        }}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group controlId="formColorG">
                    <InputGroup style={{ width: '120px' }}>
                      <InputGroup.Text>G</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={color.g}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(255, Number(e.target.value)));
                          setColor({ ...color, g: value });
                        }}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group controlId="formColorB">
                    <InputGroup style={{ width: '120px' }}>
                      <InputGroup.Text>B</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={color.b}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(255, Number(e.target.value)));
                          setColor({ ...color, b: value });
                        }}
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Modal show={openModal} onHide={() => setOpenModal(false)} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Configurando Casinha</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-6">
              <canvas id="previewCanvas" width={500} height={400} style={{border: '1px solid black'}} ref={canvasPreviewRef}></canvas>
          </div>
          <div className="col-md-6">
            <Form>
              {/* Escala */}
              <Form.Group controlId="formScale">
                <Form.Label>Escala</Form.Label>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Check
                      type="radio"
                      label="Local"
                      name="scaleType"
                      value='local'
                      checked={formData.scaleType === 'local'}
                      onChange={handleInputChange}
                      style={{marginRight: '30px'}}                      
                    />
                    <InputGroup style={{marginRight: '15px'}}>
                  <InputGroup.Text>X</InputGroup.Text>
                      <Form.Control type="number" name="sx" value={formData.sx} onChange={handleInputChange} />
                </InputGroup>
                    <InputGroup style={{marginRight: '15px'}}>
                  <InputGroup.Text>Y</InputGroup.Text>
                      <Form.Control type="number" name="sy" value={formData.sy} onChange={handleInputChange} />
                </InputGroup>
                <InputGroup>
                  <InputGroup.Text>Z</InputGroup.Text>
                      <Form.Control type="number" name="sz" value={formData.sz} onChange={handleInputChange} />
                    </InputGroup>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Check
                      type="radio"
                      label="Global"
                      name="scaleType"
                      value="global"
                      checked={formData.scaleType === 'global'}
                      onChange={handleInputChange}
                      style={{marginRight: '30px'}}
                    />
                    <InputGroup>
                        <InputGroup.Text> </InputGroup.Text>
                      <Form.Control type="number" name="s" value={formData.s} onChange={handleInputChange} />
                </InputGroup>
                  </div>
              </Form.Group>
                <hr />
              <Form.Group controlId="formTranslate">
                <Form.Label>Translação</Form.Label>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Check
                      type="checkbox"
                      name="translateType"
                      value="translate"  
                      checked={formData.translateType}
                      onChange={handleInputChange}
                      style={{marginRight: '30px'}}                      
                    />
                    <InputGroup style={{marginRight: '15px'}}>
                  <InputGroup.Text>X</InputGroup.Text>
                      <Form.Control type="number" name="tx" value={formData.tx} onChange={handleInputChange} />
                </InputGroup>
                    <InputGroup style={{marginRight: '15px'}}>
                  <InputGroup.Text>Y</InputGroup.Text>
                      <Form.Control type="number" name="ty" value={formData.ty} onChange={handleInputChange} />
                </InputGroup>
                <InputGroup>
                  <InputGroup.Text>Z</InputGroup.Text>
                      <Form.Control type="number" name="tz" value={formData.tz} onChange={handleInputChange} />
                </InputGroup>
                  </div>
              </Form.Group>
                <hr />
              <Form.Group controlId="formRotate">
                <Form.Label>Rotação</Form.Label>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Check
                      type="radio"
                      label="Origem"
                      name="rotateType"
                      value="origem"
                      checked={formData.rotateType === 'origem'}
                      onChange={handleInputChange}
                      style={{marginRight: '30px'}}                      
                    />
                    <InputGroup style={{marginRight: '15px'}}>
                  <InputGroup.Text>Eixo</InputGroup.Text>
                  <Form.Select name="axis" value={formData.axis} onChange={handleInputChange}>
                    <option value="x">X</option>
                    <option value="y">Y</option>
                    <option value="z">Z</option>
                  </Form.Select>
                </InputGroup>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Check
                      type="radio"
                      label="Centro do Objeto"
                      name="rotateType"
                      value="origem"  
                      checked={formData.rotateType === 'origem'}
                      onChange={handleInputChange}
                      style={{marginRight: '30px'}}                      
                    />
                    <InputGroup style={{marginRight: '15px'}}>
                  <InputGroup.Text>Graus</InputGroup.Text>
                      <Form.Control type="number" name="angle" value={formData.angle} onChange={handleInputChange} />
                </InputGroup>
                  </div>
              </Form.Group>
                <hr />
              <Form.Group controlId="formShear">
                <Form.Label>Cisalhamento</Form.Label>
                <table>
                  <tbody>
                      {formData.shearMatrix.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((value, colIndex) => (
                          <td key={colIndex}>
                            <Form.Control
                              type="number"
                              value={value}
                                onChange={(event) => handleMatrixChange(rowIndex, colIndex, event.target.value)}
                                style={{ width: '75px', margin: '5px' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Form.Group>
            </Form>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
    </Modal>
    </>
  );
}

export default App;