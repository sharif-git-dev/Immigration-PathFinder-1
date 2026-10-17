import React, { useState } from 'react';
import type { Outcome } from '../engine/evaluate';
import type { Profile } from '../engine/types';
import { calculateCRS } from '../engine/crs';
import { calculateFSWPoints } from '../engine/fsw';
import {
  PROGRAM_AR,
  translateCRSLabel,
  translateFSWLabel,
  translateCheckResultBadge,
} from '../data/arabicTranslations';
import { AiCaseAssistant } from './AiCaseAssistant';

interface SimpleResultsProps {
  profile?: Profile;
  outcomes: Outcome[];
  onOpenSurvey: () => void;
  lang: 'ar' | 'en';
}

export const SimpleResults: React.FC<SimpleResultsProps> = ({
  profile,
  outcomes,
  onOpenSurvey,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'matching' | 'qualified' | 'conditional' | 'all'>('matching');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const crs = calculateCRS(profile ?? {});
  const fsw = calculateFSWPoints(profile ?? {});

  const isClosedOrPaused = (o: Outcome) =>
    o.program.availability === 'closed' || o.program.availability === 'paused';

  const qualifiedCount = outcomes.filter((o) => !isClosedOrPaused(o) && o.status === 'eligible').length;
  const conditionalCount = outcomes.filter(
    (o) => !isClosedOrPaused(o) && (o.status === 'possible' || o.status === 'close'),
  ).length;
  const matchingCount = qualifiedCount + conditionalCount;

  const filtered = outcomes.filter((o) => {
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const ar = PROGRAM_AR[o.program.id];
      const match =
        o.program.name.toLowerCase().includes(q) ||
        o.program.summary.toLowerCase().includes(q) ||
        (ar?.name && ar.name.toLowerCase().includes(q)) ||
        (ar?.summary && ar.summary.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (activeTab === 'qualified') {
      return !isClosedOrPaused(o) && o.status === 'eligible';
    }
    if (activeTab === 'conditional') {
      return !isClosedOrPaused(o) && (o.status === 'possible' || o.status === 'close');
    }
    if (activeTab === 'matching') {
      return !isClosedOrPaused(o) && (o.status === 'eligible' || o.status === 'possible' || o.status === 'close');
    }
    return true;
  });

  const renderPathwayCard = (item: Outcome, isBestOption: boolean = false) => {
    const { program, status, result } = item;
    const isExpanded = expandedId === program.id;
    const closed = program.availability === 'closed' || program.availability === 'paused';
    const arData = PROGRAM_AR[program.id];

    const statusLabel = closed
      ? isAr
        ? 'مغلق (2026)'
        : 'Closed'
      : status === 'eligible'
      ? isAr
        ? 'مؤهل'
        : 'Qualified'
      : status === 'possible'
      ? isAr
        ? 'مشروط بدعوة'
        : 'Conditional'
      : status === 'close'
      ? isAr
        ? 'ينقصه شرط'
        : 'Missing Step'
      : isAr
      ? 'غير مؤهل'
      : 'Ineligible';

    const statusClass = closed
      ? 'badge-closed'
      : status === 'eligible'
      ? 'badge-qualified'
      : status === 'possible'
      ? 'badge-potential'
      : status === 'close'
      ? 'badge-close'
      : 'badge-ineligible';

    const displayTitle = isAr && arData ? arData.name : program.name;
    const displaySummary = isAr && arData ? arData.summary : program.summary;
    const displayAvailNote =
      isAr && arData?.availabilityNote ? arData.availabilityNote : program.availabilityNote;
    const displaySteps = isAr && arData?.steps ? arData.steps : program.steps;
    const displayFees = isAr && arData?.fees ? arData.fees : program.fees;
    const displayProcTime =
      isAr && arData?.processingTime ? arData.processingTime : program.processingTime;

    return (
      <div
        key={program.id}
        className="clean-pathway-card"
        style={
          isBestOption
            ? {
                borderColor: '#3b82f6',
                boxShadow: '0 8px 24px -8px rgba(37, 99, 235, 0.14)',
              }
            : undefined
        }
      >
        <div
          className="clean-pathway-header"
          onClick={() => setExpandedId(isExpanded ? null : program.id)}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {isBestOption && (
                <span
                  className="clean-badge"
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #93c5fd',
                  }}
                >
                  {isAr ? '⭐ أفضل خيار' : '⭐ Best Option'}
                </span>
              )}
              <span className={`clean-badge ${statusClass}`}>{statusLabel}</span>
              {result.score && (
                <span className="clean-badge badge-score">
                  {result.score.value}
                  {result.score.max ? ` / ${result.score.max}` : ''}
                </span>
              )}
            </div>
            <h3 className="clean-pathway-title">{displayTitle}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={program.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="clean-link-btn"
            >
              <span>{isAr ? 'الرابط الرسمي' : 'Official Link'}</span>
              <span>↗</span>
            </a>

            <button
              type="button"
              className={`info-bang-btn ${isExpanded ? 'active' : ''}`}
              aria-label="Toggle details"
            >
              !
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="clean-pathway-body">
            <div className="detail-section">
              <p className="detail-summary">{displaySummary}</p>
              {displayAvailNote && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '10px 14px',
                    background: closed ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${closed ? '#fecaca' : '#e2e8f0'}`,
                    borderRadius: 10,
                    fontSize: 13.5,
                    color: closed ? '#991b1b' : '#475569',
                    fontWeight: 700,
                  }}
                >
                  {displayAvailNote}
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4 className="detail-title">{isAr ? 'الشروط:' : 'Requirements:'}</h4>
              <div className="check-list">
                {result.checks.map((check, i) => (
                  <div key={i} className="check-item-row">
                    <span className="check-icon">
                      {check.result === 'pass'
                        ? '✅'
                        : check.result === 'fail'
                        ? '❌'
                        : check.result === 'warn'
                        ? '⚠️'
                        : check.result === 'unknown'
                        ? '❓'
                        : 'ℹ️'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className="check-title">{check.label}</span>
                        {isAr && (
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background:
                                check.result === 'pass'
                                  ? '#dcfce7'
                                  : check.result === 'fail'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                              color:
                                check.result === 'pass'
                                  ? '#166534'
                                  : check.result === 'fail'
                                  ? '#991b1b'
                                  : '#92400e',
                            }}
                          >
                            {translateCheckResultBadge(check.result)}
                          </span>
                        )}
                      </div>
                      {check.detail && <div className="check-detail">{check.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {program.category === 'express_entry' && crs.breakdown && crs.breakdown.length > 0 && (
              <div className="detail-score-box">
                <h4 className="detail-title" style={{ color: '#581c87' }}>
                  CRS ({crs.total} / 1200)
                </h4>
                <div className="score-factor-grid">
                  {crs.breakdown.map((b, i) => (
                    <div key={i} className="score-factor-row">
                      <span style={{ color: '#475569' }}>
                        {isAr ? translateCRSLabel(b.label) : b.label}
                      </span>
                      <span style={{ fontWeight: 700, color: '#5b21b6' }}>{b.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {program.id === 'ee-fsw' && (
              <div className="detail-fsw-box">
                <h4 className="detail-title" style={{ color: '#166534' }}>
                  FSW ({fsw.total} / 100)
                </h4>
                <div className="score-factor-grid">
                  {fsw.factors.map((f, i) => (
                    <div key={i} className="score-factor-row">
                      <span style={{ color: '#475569' }}>
                        {isAr ? translateFSWLabel(f.label) : f.label}
                      </span>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>
                        {f.points} / {f.max}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {displaySteps && displaySteps.length > 0 && (
              <div className="detail-section">
                <h4 className="detail-title">{isAr ? 'الخطوات:' : 'Steps:'}</h4>
                <ol className="steps-list">
                  {displaySteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>

                <div className="detail-footer" style={{ marginTop: 14 }}>
                  {displayFees && (
                    <div>
                      <strong>{isAr ? 'الرسوم:' : 'Fees:'}</strong> {displayFees}
                    </div>
                  )}
                  {displayProcTime && (
                    <div>
                      <strong>{isAr ? 'المدة:' : 'Time:'}</strong> {displayProcTime}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const bestOption = filtered.length > 0 ? filtered[0] : null;
  const remainingOptions = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <div className="results-wrapper">
      <div className="results-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onOpenSurvey}
            className="btn-edit-answers"
          >
            {isAr ? '→ الأسئلة' : '← Questions'}
          </button>

          <input
            type="text"
            placeholder={isAr ? 'بحث...' : 'Search...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="results-search-input"
          />
        </div>

        <div className="results-tab-group">
          <button
            type="button"
            onClick={() => setActiveTab('matching')}
            className={`results-tab ${activeTab === 'matching' ? 'active' : ''}`}
          >
            {isAr ? `مناسب (${matchingCount})` : `Relevant (${matchingCount})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualified')}
            className={`results-tab ${activeTab === 'qualified' ? 'active' : ''}`}
          >
            {isAr ? `مؤهل (${qualifiedCount})` : `Qualified (${qualifiedCount})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conditional')}
            className={`results-tab ${activeTab === 'conditional' ? 'active' : ''}`}
          >
            {isAr ? `مشروط (${conditionalCount})` : `Conditional (${conditionalCount})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`results-tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            {isAr ? `الكل (${outcomes.length})` : `All (${outcomes.length})`}
          </button>
        </div>
      </div>

      {/* 1. Best Option at the top */}
      {bestOption && (
        <div style={{ marginTop: 18 }}>
          {renderPathwayCard(bestOption, true)}
        </div>
      )}

      {/* 2. AI Assistant right under the Best Option */}
      <div style={{ marginTop: 18 }}>
        <AiCaseAssistant
          profile={profile ?? {}}
          outcomes={outcomes}
          lang={lang}
        />
      </div>

      {/* 3. Remaining Programs */}
      {remainingOptions.length > 0 && (
        <div className="pathway-list" style={{ marginTop: 18 }}>
          {remainingOptions.map((item) => renderPathwayCard(item, false))}
        </div>
      )}
    </div>
  );
};
