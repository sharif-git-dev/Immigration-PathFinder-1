import React, { useState } from 'react';
import type { Outcome } from '../engine/evaluate';
import { STATUS_LABEL } from '../engine/evaluate';

interface ProgramCardProps {
  outcome: Outcome;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ outcome }) => {
  const [expanded, setExpanded] = useState(false);
  const { program, status, result } = outcome;

  const statusBadgeClass =
    status === 'eligible'
      ? 'badge-eligible'
      : status === 'possible'
      ? 'badge-possible'
      : status === 'close'
      ? 'badge-close'
      : 'badge-not-eligible';

  const checkIcon = (res: string) => {
    switch (res) {
      case 'pass':
        return <span style={{ color: '#15803d' }}>✅</span>;
      case 'fail':
        return <span style={{ color: '#b91c1c' }}>❌</span>;
      case 'unknown':
        return <span style={{ color: '#0284c7' }}>❓</span>;
      case 'warn':
        return <span style={{ color: '#d97706' }}>⚠️</span>;
      case 'info':
      default:
        return <span style={{ color: '#4b5563' }}>ℹ️</span>;
    }
  };

  return (
    <div className="program-card">
      <div className="program-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span className={`badge ${statusBadgeClass}`}>{STATUS_LABEL[status]}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#475569',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}
            >
              {program.category.replace('_', ' ')}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#0369a1',
                background: '#e0f2fe',
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'capitalize',
              }}
            >
              {program.kind}
            </span>
            {result.score && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#7c3aed',
                  background: '#f3e8ff',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                ⭐ {result.score.label}: {result.score.value}
                {result.score.max ? ` / ${result.score.max}` : ''}
              </span>
            )}
          </div>
          <h3 className="program-name">{program.name}</h3>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href={program.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="official-link-btn"
            title="Open official Government of Canada page"
          >
            <span>Official Government Page</span>
            <span style={{ fontSize: 11 }}>↗</span>
          </a>
        </div>
      </div>

      <p className="program-summary">{program.summary}</p>

      {/* Availability Notice */}
      {program.availabilityNote && (
        <div
          style={{
            fontSize: 12,
            padding: '6px 12px',
            background: '#eff6ff',
            borderLeft: '3px solid #3b82f6',
            color: '#1e40af',
            marginBottom: 12,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <strong>Intake Status ({program.availability.replace('_', ' ')}):</strong>{' '}
          {program.availabilityNote}
        </div>
      )}

      {/* Tailored Notes / Pitfalls */}
      {result.notes && result.notes.length > 0 && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '10px 14px',
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>
            💡 Tailored Advice for Your Profile:
          </div>
          <ul style={{ paddingLeft: 18, color: '#475569' }}>
            {result.notes.map((note, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist Preview / Accordion */}
      <div className="checklist">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="checklist-title">
            Requirements Checklist ({result.checks.filter((c) => c.result === 'pass').length} of{' '}
            {result.checks.filter((c) => c.result === 'pass' || c.result === 'fail').length}{' '}
            Met)
          </div>
          <button
            style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? '▲ Hide Details' : '▼ View All Requirements & Reasons'}
          </button>
        </div>

        {expanded && (
          <div style={{ marginTop: 10 }}>
            {result.checks.map((check, idx) => (
              <div key={idx} className="check-item">
                <span className="check-icon">{checkIcon(check.result)}</span>
                <div style={{ flex: 1 }}>
                  <div className="check-label">{check.label}</div>
                  {check.detail && <div className="check-detail">{check.detail}</div>}
                  {check.fixable && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 11,
                        color: '#d97706',
                        background: '#fef3c7',
                        padding: '1px 6px',
                        borderRadius: 4,
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      Fixable: improving test scores or gaining experience can satisfy this
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Application steps */}
            {program.steps && program.steps.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  How to Apply (Steps):
                </div>
                <ol style={{ paddingLeft: 20, fontSize: 13, color: '#475569' }}>
                  {program.steps.map((step, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Fees and Processing Time */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 12,
                fontSize: 12,
                color: '#64748b',
                flexWrap: 'wrap',
                background: '#ffffff',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
              }}
            >
              {program.fees && (
                <div>
                  <strong>Government Fees:</strong> {program.fees}
                </div>
              )}
              {program.processingTime && (
                <div>
                  <strong>Estimated Processing:</strong> {program.processingTime}
                </div>
              )}
              <div>
                <strong>Last Verified:</strong> {program.lastVerified}
              </div>
            </div>

            {/* Additional Links */}
            {program.links && program.links.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                  OFFICIAL GUIDES & TOOLS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {program.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: '#1d4ed8',
                        textDecoration: 'underline',
                        marginRight: 10,
                      }}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
