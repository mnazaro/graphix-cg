import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import PolygonFill from './PolygonFill'; 
import Home from './Home';
import ZBuffer from './ZBuffer';
import BilinearSurface from './BilinearSurface';
import RotationalSweep from './RotationalSweep';

const App: React.FC = () => {
  return (
    <Router>
      <div className="header">
          <ul>
            <li>
              <Link to="/first">Primeira Implementação</Link>
            </li>
            <li>
              <Link to="/polygon-fill">Preenchimento de poligonos</Link>
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
          </ul>

        <Routes>
          <Route path="/first" element={<Home />} />
          <Route path="/polygon-fill" element={<PolygonFill />} />
          <Route path="/zbuffer" element={<ZBuffer />} />
          <Route path="/bilinear-surface" element={<BilinearSurface />} />
          <Route path="/rotational-sweep" element={<RotationalSweep />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
