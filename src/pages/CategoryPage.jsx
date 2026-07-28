import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReportCard from '../components/ReportCard';
import Filters from '../components/Filters';
import { listReports } from '../services/reportsService';
import { getCategory } from '../data/constants';

const CategoryPage = () => {
  const { category } = useParams();
  const categoryInfo = getCategory(category);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departamento, setDepartamento] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    listReports({ category, departamento })
      .then((data) => active && setReports(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, departamento]);

  return (
    <div className="page">
      <h1>
        {categoryInfo?.icon} {categoryInfo?.label || 'Categoría'}
      </h1>

      <Filters
        category={category}
        departamento={departamento}
        onCategoryChange={() => {}}
        onDepartamentoChange={setDepartamento}
      />

      {loading && <p>Cargando reportes...</p>}
      {!loading && reports.length === 0 && <p>No hay reportes en esta categoría todavía.</p>}

      <div className="report-grid">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
