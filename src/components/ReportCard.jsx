import React from 'react';
import { Link } from 'react-router-dom';
import { getCategory, STATUS_LABELS } from '../data/constants';

const ReportCard = ({ report }) => {
  const category = getCategory(report.category);
  const createdAt = report.createdAt?.toDate ? report.createdAt.toDate() : null;

  return (
    <Link to={`/reporte/${report.id}`} className="report-card">
      <div className="report-card-header">
        <span className="category-badge">
          {category?.icon} {category?.label}
        </span>
        <span className={`status-badge status-${report.status}`}>{STATUS_LABELS[report.status]}</span>
      </div>
      <h3>{report.title}</h3>
      <p className="report-card-desc">{report.description}</p>
      <div className="report-card-footer">
        <span>📍 {report.barrio ? `${report.barrio}, ` : ''}{report.departamento}</span>
        <span>👍 {report.upvotes?.length || 0}</span>
        {createdAt && <span>{createdAt.toLocaleDateString('es-UY')}</span>}
      </div>
    </Link>
  );
};

export default ReportCard;
