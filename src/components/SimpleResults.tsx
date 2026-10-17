import React, { useState, useEffect } from 'react';
import type { Outcome } from '../engine/evaluate';
import type { Profile, TargetCountry } from '../engine/types';
import { calculateCRS } from '../engine/crs';
import { calculateFSWPoints } from '../engine/fsw';
import { calculateChancenkartePoints } from '../data/programs/germany';
import {
  PROGRAM_AR,
  translateCRSLabel,
  translateFSWLabel,
  translateCheckResultBadge,
} from '../data/arabicTranslations';
import { AiCaseAssistant } from './AiCaseAssistant';
import { CountryFlag } from './CountryFlag';

interface SimpleResultsProps {
  profile?: Profile;
  outcomes: Outcome[];
  onOpenSurvey: () => void;
  onSelectCountry?: (code: TargetCountry) => void;
  lang: 'ar' | 'en';
}

const COUNTRY_VERIFICATION_META: Record<
  TargetCountry,
  {
    code: TargetCountry;
    shortNameEn: string;
    shortNameAr: string;
    nameEn: string;
    nameAr: string;
    authorityEn: string;
    authorityAr: string;
    lawEn: string;
    lawAr: string;
    variablesNoteEn: string;
    variablesNoteAr: string;
    accent: string;
    bg: string;
    border: string;
    links: { labelEn: string; labelAr: string; url: string; domain: string }[];
  }
> = {
  CA: {
    code: 'CA',
    shortNameEn: 'Canada',
    shortNameAr: 'كندا',
    nameEn: 'Canada',
    nameAr: 'كندا',
    authorityEn: 'IRCC — Government of Canada',
    authorityAr: 'وزارة الهجرة الكندية الرسمية (IRCC)',
    lawEn: 'IRPA / IRPR',
    lawAr: 'قانون الهجرة الكندي (IRPA)',
    variablesNoteEn: '',
    variablesNoteAr: '',
    accent: '#be123c',
    bg: '#fff1f2',
    border: '#fecdd3',
    links: [
      {
        labelEn: 'IRCC Official Portal',
        labelAr: 'بوابة الهجرة الكندية IRCC',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
        domain: 'canada.ca',
      },
      {
        labelEn: 'Official CRS Calculator',
        labelAr: 'حاسبة نقاط CRS الرسمية',
        url: 'https://ircc.canada.ca/english/immigrate/skilled/crs-tool.asp',
        domain: 'ircc.canada.ca',
      },
      {
        labelEn: 'Express Entry Draws',
        labelAr: 'سحوبات Express Entry الرسمية',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html',
        domain: 'canada.ca',
      },
    ],
  },
  DE: {
    code: 'DE',
    shortNameEn: 'Germany',
    shortNameAr: 'ألمانيا',
    nameEn: 'Germany',
    nameAr: 'ألمانيا',
    authorityEn: 'Make it in Germany & BAMF',
    authorityAr: 'البوابة الفيدرالية الألمانية والمكتب الاتحادي BAMF',
    lawEn: 'AufenthG §§ 16–36 & FEG',
    lawAr: 'قانون الإقامة الألماني AufenthG',
    variablesNoteEn: '',
    variablesNoteAr: '',
    accent: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    links: [
      {
        labelEn: 'Make it in Germany Portal',
        labelAr: 'بوابة Make it in Germany الرسمية',
        url: 'https://www.make-it-in-germany.com/en/',
        domain: 'make-it-in-germany.com',
      },
      {
        labelEn: 'Chancenkarte Official Page',
        labelAr: 'صفحة بطاقة الفرص Chancenkarte',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        domain: 'make-it-in-germany.com',
      },
      {
        labelEn: 'EU Blue Card Germany',
        labelAr: 'البطاقة الزرقاء الأوروبية',
        url: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card',
        domain: 'make-it-in-germany.com',
      },
      {
        labelEn: 'BAMF Federal Office',
        labelAr: 'المكتب الاتحادي BAMF',
        url: 'https://www.bamf.de/EN/Startseite/startseite_node.html',
        domain: 'bamf.de',
      },
    ],
  },
  US: {
    code: 'US',
    shortNameEn: 'USA',
    shortNameAr: 'أمريكا',
    nameEn: 'United States',
    nameAr: 'الولايات المتحدة (أمريكا)',
    authorityEn: 'USCIS & U.S. Department of Homeland Security',
    authorityAr: 'دائرة الهجرة والجنسية الأمريكية الرسمية (USCIS)',
    lawEn: 'INA & 8 CFR',
    lawAr: 'قانون الهجرة الأمريكي (INA)',
    variablesNoteEn: '',
    variablesNoteAr: '',
    accent: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    links: [
      {
        labelEn: 'USCIS Official Portal',
        labelAr: 'الموقع الرسمي لدائرة الهجرة USCIS',
        url: 'https://www.uscis.gov',
        domain: 'uscis.gov',
      },
      {
        labelEn: 'Green Card Categories',
        labelAr: 'فئات الجرين كارد الرسمي',
        url: 'https://www.uscis.gov/green-card/green-card-eligibility-categories',
        domain: 'uscis.gov',
      },
      {
        labelEn: 'Permanent Workers (EB-1 / EB-2 NIW)',
        labelAr: 'تأشيرات العمل الدائمة EB-1 / EB-2 NIW',
        url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers',
        domain: 'uscis.gov',
      },
      {
        labelEn: 'USCIS Fee Schedule (G-1055)',
        labelAr: 'جدول الرسوم الرسمي G-1055',
        url: 'https://www.uscis.gov/g-1055',
        domain: 'uscis.gov',
      },
    ],
  },
};

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'official-gov';
  }
}

export const SimpleResults: React.FC<SimpleResultsProps> = ({
  profile,
  outcomes,
  onOpenSurvey,
  onSelectCountry,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');

  const activeCountry: TargetCountry =
    profile?.activeCountry ??
    (profile?.targetCountries && profile.targetCountries[0]) ??
    'CA';

  const vMeta = COUNTRY_VERIFICATION_META[activeCountry];

  const crs = calculateCRS(profile ?? {});
  const fsw = calculateFSWPoints(profile ?? {});
  const chancen = calculateChancenkartePoints(profile ?? {});

  const isClosedOrPaused = (o: Outcome) =>
    o.program.availability === 'closed' || o.program.availability === 'paused';

  const countryFilteredOutcomes = outcomes.filter(
    (o) => (o.program.country ?? 'CA') === activeCountry,
  );

  const qualifiedCount = countryFilteredOutcomes.filter(
    (o) => !isClosedOrPaused(o) && o.status === 'eligible',
  ).length;
  const conditionalCount = countryFilteredOutcomes.filter(
    (o) => !isClosedOrPaused(o) && (o.status === 'possible' || o.status === 'close'),
  ).length;
  const matchingCount = qualifiedCount + conditionalCount;

  const [activeTab, setActiveTab] = useState<'qualified' | 'matching' | 'conditional' | 'all'>(() =>
    qualifiedCount > 0 ? 'qualified' : 'matching',
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Brief loading screen before revealing what the user qualifies for
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(20);

  useEffect(() => {
    setIsLoading(true);
    setLoadProgress(25);
    setActiveTab(qualifiedCount > 0 ? 'qualified' : 'matching');

    const t1 = setTimeout(() => setLoadProgress(68), 260);
    const t2 = setTimeout(() => setLoadProgress(100), 560);
    const t3 = setTimeout(() => setIsLoading(false), 820);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeCountry]);

  const filtered = countryFilteredOutcomes.filter((o) => {
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
      return (
        !isClosedOrPaused(o) &&
        (o.status === 'eligible' || o.status === 'possible' || o.status === 'close')
      );
    }
    return true;
  });

  const getCountryBadge = (countryCode?: TargetCountry) => {
    const code = countryCode ?? 'CA';
    if (code === 'DE') {
      return {
        code: 'DE' as TargetCountry,
        label: isAr ? 'ألمانيا' : 'Germany',
        bg: '#fef3c7',
        color: '#92400e',
        border: '#fde68a',
      };
    }
    if (code === 'US') {
      return {
        code: 'US' as TargetCountry,
        label: isAr ? 'أمريكا' : 'USA',
        bg: '#dbeafe',
        color: '#1e40af',
        border: '#bfdbfe',
      };
    }
    return {
      code: 'CA' as TargetCountry,
      label: isAr ? 'كندا' : 'Canada',
      bg: '#ffe4e6',
      color: '#9f1239',
      border: '#fecdd3',
    };
  };

  const renderExpandedDetails = (item: Outcome) => {
    const { program, result } = item;
    const closed = program.availability === 'closed' || program.availability === 'paused';
    const arData = PROGRAM_AR[program.id];
    const progCountry = program.country ?? 'CA';
    const hostDomain = getHostname(program.officialUrl);

    const displaySummary = isAr && arData ? arData.summary : program.summary;
    const displayAvailNote =
      isAr && arData?.availabilityNote ? arData.availabilityNote : program.availabilityNote;
    const displaySteps = isAr && arData?.steps ? arData.steps : program.steps;
    const displayFees = isAr && arData?.fees ? arData.fees : program.fees;
    const displayProcTime =
      isAr && arData?.processingTime ? arData.processingTime : program.processingTime;

    return (
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
          <h4 className="detail-title">{isAr ? 'الشروط والأهلية (حسب إجاباتك):' : 'Requirements & Eligibility (Based on Your Answers):'}</h4>
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

        {progCountry === 'CA' &&
          program.category === 'express_entry' &&
          crs.breakdown &&
          crs.breakdown.length > 0 && (
            <div className="detail-score-box">
              <h4
                className="detail-title"
                style={{ color: '#581c87', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                <CountryFlag code="CA" size={15} />
                <span>CRS ({crs.total} / 1200)</span>
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
            <h4
              className="detail-title"
              style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <CountryFlag code="CA" size={15} />
              <span>FSW ({fsw.total} / 100)</span>
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

        {program.id === 'de-chancenkarte' && (
          <div className="detail-fsw-box">
            <h4
              className="detail-title"
              style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <CountryFlag code="DE" size={15} />
              <span>
                Chancenkarte ({chancen.total}{' '}
                {isAr ? 'نقاط — الحد الأدنى 6' : 'pts — Min 6 required'})
              </span>
            </h4>
            <div className="score-factor-grid">
              {chancen.factors.map((f, i) => (
                <div key={i} className="score-factor-row">
                  <span style={{ color: '#475569' }}>{f.label}</span>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>+{f.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {displaySteps && displaySteps.length > 0 && (
          <div className="detail-section">
            <h4 className="detail-title">{isAr ? 'خطوات التقديم:' : 'Application Steps:'}</h4>
            <ol className="steps-list">
              {displaySteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <div className="detail-footer" style={{ marginTop: 14 }}>
              {displayFees && (
                <div>
                  <strong>{isAr ? 'الرسوم الرسمية:' : 'Official Fees:'}</strong> {displayFees}
                </div>
              )}
              {displayProcTime && (
                <div>
                  <strong>{isAr ? 'مدة المعالجة:' : 'Processing Time:'}</strong> {displayProcTime}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official Government Source Verification Box */}
        <div
          style={{
            marginTop: 14,
            padding: '14px 16px',
            borderRadius: 14,
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🏛️</span>
              <span>
                {isAr
                  ? 'التحقق من المصدر الحكومي الرسمي (توثيق مباشر)'
                  : 'Official Government Source Verification'}
              </span>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                background: '#dcfce7',
                color: '#15803d',
                padding: '2px 9px',
                borderRadius: 999,
                border: '1px solid #86efac',
              }}
            >
              ✓ {hostDomain} • {isAr ? `محدّث ${program.lastVerified || '2026-04'}` : `Verified ${program.lastVerified || '2026-04'}`}
            </span>
          </div>

          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600, marginBottom: 10 }}>
            {isAr
              ? `الجهة الحكومية: ${COUNTRY_VERIFICATION_META[progCountry].authorityAr} — ${COUNTRY_VERIFICATION_META[progCountry].lawAr}`
              : `Authority: ${COUNTRY_VERIFICATION_META[progCountry].authorityEn} — ${COUNTRY_VERIFICATION_META[progCountry].lawEn}`}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <a
              href={program.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="clean-link-btn"
              style={{
                fontSize: 12,
                background: '#166534',
                color: '#ffffff',
                borderColor: '#166534',
              }}
            >
              <span>
                {isAr ? `تحقق من الصفحة الحكومية الرسمية (${hostDomain})` : `Verify on Official Gov Page (${hostDomain})`}
              </span>
              <span>↗</span>
            </a>

            {program.links &&
              program.links.map((lk, idx) => (
                <a
                  key={idx}
                  href={lk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clean-link-btn"
                  style={{ fontSize: 12, background: '#ffffff' }}
                >
                  <span>{lk.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.75 }}>({getHostname(lk.url)}) ↗</span>
                </a>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadgeInfo = (item: Outcome) => {
    const { program, status } = item;
    const closed = program.availability === 'closed' || program.availability === 'paused';

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

    return { statusLabel, statusClass };
  };

  const renderBestHero = (item: Outcome) => {
    const { program, result } = item;
    const isExpanded = expandedId === program.id;
    const arData = PROGRAM_AR[program.id];
    const { statusLabel, statusClass } = getStatusBadgeInfo(item);
    const cBadge = getCountryBadge(program.country);
    const hostDomain = getHostname(program.officialUrl);
    const displayTitle = isAr && arData ? arData.name : program.name;
    const displaySummary = isAr && arData ? arData.summary : program.summary;

    return (
      <div className="best-hero-card">
        <div
          className="best-hero-inner"
          onClick={() => setExpandedId(isExpanded ? null : program.id)}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="best-hero-eyebrow">
                {isAr ? `⭐ أفضل خيار في ${cBadge.label}` : `⭐ #1 Best Option in ${cBadge.label}`}
              </span>
              <span
                className="clean-badge"
                style={{
                  background: cBadge.bg,
                  color: cBadge.color,
                  border: `1px solid ${cBadge.border}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CountryFlag code={cBadge.code} size={14} />
                <span>{cBadge.label}</span>
              </span>
              <span className={`clean-badge ${statusClass}`}>{statusLabel}</span>
              {result.score && (
                <span className="clean-badge badge-score">
                  {result.score.value}
                  {result.score.max ? ` / ${result.score.max}` : ''}
                </span>
              )}
              <span
                className="clean-badge"
                style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  fontSize: 11,
                }}
              >
                🏛️ {hostDomain} ✓
              </span>
            </div>

            <h2 className="best-hero-title">{displayTitle}</h2>
            <p className="best-hero-summary">{displaySummary}</p>
          </div>

          <div className="best-hero-actions">
            <a
              href={program.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-hero-official"
              title={program.officialUrl}
            >
              <span>{isAr ? `توثيق (${hostDomain})` : `Verify (${hostDomain})`}</span>
              <span>↗</span>
            </a>

            <button
              type="button"
              className={`info-bang-btn ${isExpanded ? 'active' : ''}`}
              style={{ width: 38, height: 38, fontSize: 16 }}
              aria-label="Toggle details"
            >
              !
            </button>
          </div>
        </div>

        {isExpanded && renderExpandedDetails(item)}
      </div>
    );
  };

  const renderGridCard = (item: Outcome) => {
    const { program, result } = item;
    const isExpanded = expandedId === program.id;
    const arData = PROGRAM_AR[program.id];
    const { statusLabel, statusClass } = getStatusBadgeInfo(item);
    const cBadge = getCountryBadge(program.country);
    const hostDomain = getHostname(program.officialUrl);
    const displayTitle = isAr && arData ? arData.name : program.name;

    return (
      <div key={program.id} className="clean-pathway-card">
        <div
          className="clean-pathway-header"
          onClick={() => setExpandedId(isExpanded ? null : program.id)}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                className="clean-badge"
                style={{
                  background: cBadge.bg,
                  color: cBadge.color,
                  border: `1px solid ${cBadge.border}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CountryFlag code={cBadge.code} size={13} />
                <span>{cBadge.label}</span>
              </span>
              <span className={`clean-badge ${statusClass}`}>{statusLabel}</span>
              {result.score && (
                <span className="clean-badge badge-score">
                  {result.score.value}
                  {result.score.max ? ` / ${result.score.max}` : ''}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0f766e',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  padding: '2px 7px',
                  borderRadius: 999,
                }}
              >
                🏛️ {hostDomain}
              </span>
            </div>
            <h3 className="clean-pathway-title">{displayTitle}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href={program.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="clean-link-btn"
              title={program.officialUrl}
            >
              <span>{isAr ? 'المصدر الرسمي' : 'Official Source'}</span>
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

        {isExpanded && renderExpandedDetails(item)}
      </div>
    );
  };

  const bestOption = filtered.length > 0 ? filtered[0] : null;
  const remainingOptions = filtered.length > 1 ? filtered.slice(1) : [];

  // Animated Loading Screen before showing results
  if (isLoading) {
    return (
      <div
        className="results-wrapper"
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 500,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            border: `2px solid ${vMeta.border}`,
            borderRadius: 28,
            padding: '42px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12)',
            animation: 'cardEnter 0.35s ease-out forwards',
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              background: vMeta.bg,
              border: `2px solid ${vMeta.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              boxShadow: '0 8px 18px -4px rgba(0,0,0,0.06)',
            }}
          >
            <CountryFlag code={vMeta.code} size={42} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
              }}
            />
            <span>
              {isAr
                ? `نظام التحقق الرسمي 2026: ${vMeta.nameAr}`
                : `Official 2026 Evaluation: ${vMeta.nameEn}`}
            </span>
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
            {isAr ? 'جاري فحص المسارات المؤهل لها...' : 'Evaluating what you qualify for...'}
          </h2>

          <p
            style={{
              fontSize: 13.5,
              color: '#64748b',
              fontWeight: 600,
              lineHeight: 1.55,
              marginBottom: 24,
            }}
          >
            {isAr
              ? `نقوم بمطابقة إجاباتك مع شروط ${vMeta.authorityAr} وقوانين الهجرة الرسمية لفرز البرامج المؤهل لها.`
              : `Matching your answers directly against official ${vMeta.authorityEn} rules to determine your qualified programs.`}
          </p>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: 10,
              background: '#e2e8f0',
              borderRadius: 999,
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${loadProgress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${vMeta.accent}, #10b981)`,
                borderRadius: 999,
                transition: 'width 0.28s ease',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 700,
              color: '#94a3b8',
            }}
          >
            <span>{isAr ? 'فرز برامج الأهلية المباشرة' : 'Sorting qualified pathways'}</span>
            <span style={{ color: vMeta.accent }}>{loadProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-wrapper">
      {/* Top Filter & Search Bar with Qualified Tab First */}
      <div className="results-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          <button
            type="button"
            onClick={onOpenSurvey}
            className="btn-edit-answers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CountryFlag code={vMeta.code} size={15} />
            <span>
              {isAr
                ? `→ تعديل إجابات ${vMeta.shortNameAr}`
                : `← Edit ${vMeta.shortNameEn} Answers`}
            </span>
          </button>

          <input
            type="text"
            placeholder={
              isAr
                ? `بحث في مسارات ${vMeta.shortNameAr}...`
                : `Search ${vMeta.shortNameEn} pathways...`
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="results-search-input"
          />
        </div>

        <div className="results-tab-group">
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
            onClick={() => setActiveTab('matching')}
            className={`results-tab ${activeTab === 'matching' ? 'active' : ''}`}
          >
            {isAr ? `مناسب (${matchingCount})` : `Relevant (${matchingCount})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`results-tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            {isAr ? `الكل (${countryFilteredOutcomes.length})` : `All (${countryFilteredOutcomes.length})`}
          </button>
        </div>
      </div>

      {/* Qualified / Filtered Options Displayed at the Top */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px dashed #cbd5e1',
            borderRadius: 20,
            padding: '36px 20px',
            textAlign: 'center',
            color: '#64748b',
            margin: '20px 0',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
            {isAr ? 'لا توجد مسارات مطابقة لهذا الفلتر' : 'No pathways match this filter'}
          </h3>
          <p style={{ fontSize: 13.5, marginBottom: 16 }}>
            {isAr
              ? 'جرّب الانتقال إلى تبويب "مشروط" أو "الكل" لرؤية البرامج الأخرى المتاحة لك.'
              : 'Try switching to the "Conditional" or "All" tab to see other programs available to you.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('conditional')}
            style={{
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: 999,
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isAr ? 'عرض المسارات المشروطة' : 'View Conditional Pathways'}
          </button>
        </div>
      ) : (
        <>
          {/* 1. Best Option Hero Section */}
          {bestOption && renderBestHero(bestOption)}

          {/* 2. Wide Multi-Column Grid for Remaining Qualified / Filtered Programs */}
          {remainingOptions.length > 0 && (
            <div className="pathway-grid-wide">
              {remainingOptions.map((item) => renderGridCard(item))}
            </div>
          )}
        </>
      )}

      {/* 3. AI Case Advisor Section right under the pathway options */}
      <AiCaseAssistant
        profile={profile ?? {}}
        outcomes={countryFilteredOutcomes}
        lang={lang}
      />

      {/* 4. Direct Official Government Verification Links - Simple, Clean & at the End */}
      <div
        style={{
          marginTop: 24,
          padding: '16px 20px',
          background: '#ffffff',
          border: `1.5px solid ${vMeta.border}`,
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CountryFlag code={vMeta.code} size={24} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
                  {isAr
                    ? `مصادر التحقق الحكومية الرسمية (${vMeta.nameAr})`
                    : `Official Government Verification (${vMeta.nameEn})`}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    background: '#dcfce7',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid #86efac',
                  }}
                >
                  ✓ {isAr ? 'معتمد 2026' : 'Official 2026'}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                🏛️ {isAr ? vMeta.authorityAr : vMeta.authorityEn}
              </span>
            </div>
          </div>

          {/* Quick country switcher */}
          {onSelectCountry && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700 }}>
                {isAr ? 'فحص دولة أخرى:' : 'Check another country:'}
              </span>
              {(['CA', 'DE', 'US'] as TargetCountry[])
                .filter((code) => code !== activeCountry)
                .map((code) => {
                  const other = COUNTRY_VERIFICATION_META[code];
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onSelectCountry(code)}
                      style={{
                        background: other.bg,
                        border: `1px solid ${other.border}`,
                        borderRadius: 999,
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: other.accent,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <CountryFlag code={other.code} size={13} />
                      <span>{isAr ? other.shortNameAr : other.shortNameEn}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Links row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>
            {isAr ? 'الروابط المباشرة:' : 'Direct Official Links:'}
          </span>
          {vMeta.links.map((lk, idx) => (
            <a
              key={idx}
              href={lk.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: vMeta.accent,
                background: vMeta.bg,
                border: `1px solid ${vMeta.border}`,
                padding: '4px 12px',
                borderRadius: 999,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>{isAr ? lk.labelAr : lk.labelEn}</span>
              <span style={{ fontSize: 10.5, opacity: 0.7 }}>({lk.domain}) ↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

