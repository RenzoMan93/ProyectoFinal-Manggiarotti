import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createReport } from '../services/reportsService';
import { CATEGORIES, DEPARTAMENTOS } from '../data/constants';

const NewReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0].id,
    subcategory: '',
    departamento: DEPARTAMENTOS[9], // Montevideo por defecto
    barrio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedCategory = CATEGORIES.find((c) => c.id === form.category);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCategoryChange = (e) => {
    setForm((prev) => ({ ...prev, category: e.target.value, subcategory: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim() || !form.departamento) {
      setError('Completá título, descripción y departamento.');
      return;
    }
    setSubmitting(true);
    try {
      const id = await createReport({ ...form, user: currentUser });
      navigate(`/reporte/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page form-page">
      <h1>Nuevo reporte</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Categoría
          <select value={form.category} onChange={handleCategoryChange}>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Subcategoría
          <select value={form.subcategory} onChange={handleChange('subcategory')}>
            <option value="">Seleccionar...</option>
            {selectedCategory?.subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </label>

        <label>
          Título
          <input
            type="text"
            maxLength={120}
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Resumen breve del problema"
          />
        </label>

        <label>
          Descripción
          <textarea
            rows={5}
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Contá qué pasó, cuándo y cualquier detalle relevante"
          />
        </label>

        <div className="form-row">
          <label>
            Departamento
            <select value={form.departamento} onChange={handleChange('departamento')}>
              {DEPARTAMENTOS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </label>

          <label>
            Barrio / zona (opcional)
            <input
              type="text"
              value={form.barrio}
              onChange={handleChange('barrio')}
              placeholder="Ej: Pocitos, Ciudad Vieja..."
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Publicando...' : 'Publicar reporte'}
        </button>
      </form>
    </div>
  );
};

export default NewReport;
