import React, { useEffect, useState } from 'react';
import ReportCard from '../components/ReportCard';
import Filters from '../components/Filters';
import { listReports } from '../services/reportsService';
import { CATEGORIES } from '../data/constants';

const Home = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [departamento, setDepartamento] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    listReports({ category, departamento })
      .then((data) => {
        if (active) setReports(data);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, departamento]);

  return (
    <div className="page">
      <section className="hero">
        <h1>Reportes ciudadanos de Uruguay</h1>
        <p>
          Un espacio para reportar y visualizar problemas de seguridad, tránsito y consumo en tu
          barrio y en todo el país.
        </p>
        <div className="hero-categories">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="hero-category">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Filters
        category={category}
        departamento={departamento}
        onCategoryChange={setCategory}
        onDepartamentoChange={setDepartamento}
      />

      {loading && <p>Cargando reportes...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && reports.length === 0 && <p>No hay reportes todavía. ¡Sé el primero!</p>}

      <div className="report-grid">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default Home;
