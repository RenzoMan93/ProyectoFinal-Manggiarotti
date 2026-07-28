import React, { useEffect, useState } from 'react';
import ReportCard from '../components/ReportCard';
import { useAuth } from '../context/AuthContext';
import { listReportsByUser } from '../services/reportsService';

const MyReports = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReportsByUser(currentUser.uid)
      .then(setReports)
      .finally(() => setLoading(false));
  }, [currentUser.uid]);

  return (
    <div className="page">
      <h1>Mis reportes</h1>
      {loading && <p>Cargando...</p>}
      {!loading && reports.length === 0 && <p>Todavía no publicaste ningún reporte.</p>}
      <div className="report-grid">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default MyReports;
