import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteReport, getReport, toggleUpvote, updateReportStatus } from '../services/reportsService';
import { getCategory, STATUS, STATUS_LABELS } from '../data/constants';

const ReportDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadReport = () => {
    setLoading(true);
    getReport(id)
      .then((data) => {
        if (!data) setNotFound(true);
        setReport(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="page"><p>Cargando...</p></div>;
  if (notFound) return <div className="page"><p>Reporte no encontrado.</p></div>;
  if (!report) return null;

  const category = getCategory(report.category);
  const isOwner = currentUser?.uid === report.userId;
  const hasUpvoted = currentUser && report.upvotes?.includes(currentUser.uid);
  const createdAt = report.createdAt?.toDate ? report.createdAt.toDate() : null;

  const handleUpvote = async () => {
    if (!currentUser) return navigate('/login');
    await toggleUpvote(id, currentUser.uid, hasUpvoted);
    loadReport();
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    await deleteReport(id);
    navigate('/');
  };

  const handleStatusChange = async (e) => {
    await updateReportStatus(id, e.target.value);
    loadReport();
  };

  return (
    <div className="page report-detail">
      <span className="category-badge">
        {category?.icon} {category?.label}
      </span>
      {report.subcategory && <span className="subcategory-badge">{report.subcategory}</span>}

      <h1>{report.title}</h1>

      <div className="report-meta">
        <span>📍 {report.barrio ? `${report.barrio}, ` : ''}{report.departamento}</span>
        {createdAt && <span>🗓️ {createdAt.toLocaleString('es-UY')}</span>}
        <span>🙋 {report.userName}</span>
      </div>

      <p className="report-description">{report.description}</p>

      <div className="report-actions">
        <button className="btn" onClick={handleUpvote}>
          👍 {hasUpvoted ? 'Quitar apoyo' : 'Apoyar'} ({report.upvotes?.length || 0})
        </button>

        {isOwner ? (
          <select value={report.status} onChange={handleStatusChange}>
            {Object.values(STATUS).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        ) : (
          <span className={`status-badge status-${report.status}`}>{STATUS_LABELS[report.status]}</span>
        )}

        {isOwner && (
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;
