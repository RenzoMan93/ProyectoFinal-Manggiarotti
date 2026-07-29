import React from 'react';
import { CATEGORIES, DEPARTAMENTOS } from '../data/constants';

const Filters = ({ category, departamento, onCategoryChange, onDepartamentoChange }) => (
  <div className="filters">
    <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
      <option value="">Todas las categorías</option>
      {CATEGORIES.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icon} {cat.label}
        </option>
      ))}
    </select>
    <select value={departamento} onChange={(e) => onDepartamentoChange(e.target.value)}>
      <option value="">Todo el país</option>
      {DEPARTAMENTOS.map((dep) => (
        <option key={dep} value={dep}>
          {dep}
        </option>
      ))}
    </select>
  </div>
);

export default Filters;
