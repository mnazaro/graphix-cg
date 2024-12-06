import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import PolygonFill from './PolygonFill';
import Home from './Home';
import ZBuffer from './ZBuffer';
import BilinearSurface from './BilinearSurface';
import RotationalSweep from './RotationalSweep';
import LightingExample from './LightingExample';

const App: React.FC = () => {
    return (
        <Router>
            <div className="sidebar">
                <ul>
                    <li>
                        <Link to="/">Primeira Implementação</Link>
                    </li>
                    <li>
                        <Link to="/polygon-fill">
                            Preenchimento de poligonos
                        </Link>
                    </li>
                    <li>
                        <Link to="/zbuffer">Z-Buffer</Link>
                    </li>
                    <li>
                        <Link to="/bilinear-surface">Superfície Bilinear</Link>
                    </li>
                    <li>
                        <Link to="/rotational-sweep">Varredura Rotacional</Link>
                    </li>
                    <li>
                        <Link to="/lighting-example">
                            Exemplo de Iluminação
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/polygon-fill" element={<PolygonFill />} />
                    <Route path="/zbuffer" element={<ZBuffer />} />
                    <Route
                        path="/bilinear-surface"
                        element={<BilinearSurface />}
                    />
                    <Route
                        path="/rotational-sweep"
                        element={<RotationalSweep />}
                    />
                    <Route
                        path="/lighting-example"
                        element={<LightingExample />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
