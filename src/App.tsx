import React, { useState, useEffect } from 'react';
import type { Profile, TargetCountry } from './engine/types';
import { evaluateAll } from './engine/evaluate';
import { SimpleResults } from './components/SimpleResults';
import { StepSurvey } from './components/StepSurvey';
import { CountryFlag } from './components/CountryFlag';
import { PRESET_PROFILES } from './data/presets';

const STORAGE_KEY = 'canada_pathfinder_profile_v4';
const LANG_KEY = 'canada_pathfinder_lang';

type AppStage = 'lang' | 'intro' | 'countries' | 'survey' | 'results';

const COUNTRY_META: {
  code: TargetCountry;
  shortNameEn: string;
  shortNameAr: string;
  nameEn: string;
  nameAr: string;
  subEn: string;
  subAr: string;
  authorityEn: string;
  authorityAr: string;
  officialDomain: string;
  officialUrl: string;
  accent: string;
  bgActive: string;
}[] = [
  {
    code: 'CA',
    shortNameEn: 'Canada',
    shortNameAr: 'كندا',
    nameEn: 'Canada',
    nameAr: 'كندا',
    subEn: 'CRS Points • Express Entry • Provincial (PNP) • Super Visa • Study • Asylum',
    subAr: 'نقاط CRS • الدخول السريع • ترشيح المقاطعات • سوبر فيزا • دراسة • لجوء',
    authorityEn: 'IRCC — Government of Canada (canada.ca)',
    authorityAr: 'وزارة الهجرة الكندية الرسمية IRCC (canada.ca)',
    officialDomain: 'canada.ca',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
    accent: '#e11d48',
    bgActive: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
  },
  {
    code: 'DE',
    shortNameEn: 'Germany',
    shortNameAr: 'ألمانيا',
    nameEn: 'Germany',
    nameAr: 'ألمانيا',
    subEn: 'Chancenkarte (6 pts) • EU Blue Card • ANABIN/ZAB • Ausbildung • Study • BAMF',
    subAr: 'بطاقة الفرص Chancenkarte • البطاقة الزرقاء • معادلة ANABIN • أوسبيلدونغ • BAMF',
    authorityEn: 'Federal Gov Portal & BAMF (make-it-in-germany.com • bamf.de)',
    authorityAr: 'البوابة الفيدرالية الرسمية والمكتب الاتحادي (make-it-in-germany.com • bamf.de)',
    officialDomain: 'make-it-in-germany.com',
    officialUrl: 'https://www.make-it-in-germany.com/en/',
    accent: '#d97706',
    bgActive: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  {
    code: 'US',
    shortNameEn: 'USA',
    shortNameAr: 'أمريكا',
    nameEn: 'United States',
    nameAr: 'الولايات المتحدة (أمريكا)',
    subEn: 'EB-2 NIW / EB-1A • DV Lottery • H-1B / O-1 • Form I-130 Family • F-1 OPT • USCIS',
    subAr: 'جرين كارد EB-2 NIW • اللوتري • فيزا H-1B / O-1 • لم شمل I-130 • دراسة F-1 • USCIS',
    authorityEn: 'U.S. Citizenship & Immigration Services (uscis.gov • dhs.gov)',
    authorityAr: 'دائرة الهجرة والجنسية الأمريكية الرسمية (uscis.gov • dhs.gov)',
    officialDomain: 'uscis.gov',
    officialUrl: 'https://www.uscis.gov',
    accent: '#2563eb',
    bgActive: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  },
];

export const App: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      // ignore
    }
    return 'ar';
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const active: TargetCountry =
          parsed.activeCountry ??
          (parsed.targetCountries && parsed.targetCountries[0]) ??
          'CA';
        return {
          ...parsed,
          activeCountry: active,
          targetCountries: [active],
        };
      }
    } catch {
      // fallback
    }
    return {
      ...PRESET_PROFILES[0].profile,
      activeCountry: 'CA',
      targetCountries: ['CA'],
    };
  });

  const [stage, setStage] = useState<AppStage>('lang');

  useEffect(() => {
    // Only keep LTR on the initial language selection screen; flip to RTL/LTR on questions & results
    document.documentElement.dir = stage === 'lang' ? 'ltr' : lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang, stage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const activeCountry: TargetCountry =
    profile.activeCountry ??
    (profile.targetCountries && profile.targetCountries[0]) ??
    'CA';

  const activeCountryMeta =
    COUNTRY_META.find((c) => c.code === activeCountry) ?? COUNTRY_META[0];

  const selectSingleCountry = (code: TargetCountry) => {
    setProfile({
      ...profile,
      activeCountry: code,
      targetCountries: [code],
    });
  };

  const outcomes = evaluateAll(profile);
  const openOutcomes = outcomes.filter(
    (o) => o.program.availability !== 'closed' && o.program.availability !== 'paused',
  );
  const eligibleCount = openOutcomes.filter((o) => o.status === 'eligible').length;
  const potentialCount = openOutcomes.filter(
    (o) => o.status === 'possible' || o.status === 'close',
  ).length;
  const totalRelevant = eligibleCount + potentialCount;

  const handleReset = () => {
    setProfile({ activeCountry: activeCountry, targetCountries: [activeCountry] });
    setStage('lang');
  };

  const isAr = lang === 'ar';

  // SLIDE 1: Standalone Language Selection Screen (always LTR so it never flips)
  if (stage === 'lang') {
    return (
      <div className="standalone-screen" dir="ltr">
        <div className="launch-card">
          <div
            className="maple-hero-badge"
            style={{
              width: 'auto',
              display: 'inline-flex',
              padding: '0 22px',
              gap: 12,
            }}
          >
            <CountryFlag code="CA" size={24} />
            <CountryFlag code="DE" size={24} />
            <CountryFlag code="US" size={24} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e1b4b' }}>
            Immigration PathFinder
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginTop: 6 }}>
            Canada • Germany • United States
          </p>

          <div className="lang-grid">
            <button
              type="button"
              className="lang-choice-btn"
              onClick={() => {
                setLang('ar');
                setStage('intro');
              }}
            >
              <span className="lang-choice-title">العربية</span>
              <span className="lang-choice-sub">ابدأ بالعربية</span>
            </button>

            <button
              type="button"
              className="lang-choice-btn"
              onClick={() => {
                setLang('en');
                setStage('intro');
              }}
            >
              <span className="lang-choice-title">English</span>
              <span className="lang-choice-sub">Continue in English</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SLIDE 2: Standalone "What We Help You With" Screen
  if (stage === 'intro') {
    return (
      <div className="standalone-screen" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="launch-card" key="intro-slide">
          <div className="maple-hero-badge">✨</div>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: '#1e1b4b' }}>
            {isAr ? 'كيف نساعدك؟' : 'How We Help You'}
          </h1>

          <div className="feature-pills-grid">
            <div className="feature-pill-card feature-pill-indigo" style={{ animationDelay: '0.05s' }}>
              <span className="feature-pill-icon">🎯</span>
              <span className="feature-pill-title">
                {isAr
                  ? 'أسئلة مخصصة لكل دولة على حدة (كندا أو ألمانيا أو أمريكا)'
                  : 'Dedicated Country-Specific Questions (CA, DE, or US)'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-emerald" style={{ animationDelay: '0.12s' }}>
              <span className="feature-pill-icon">🏛️</span>
              <span className="feature-pill-title">
                {isAr
                  ? 'موثق مباشرة من المواقع الحكومية الرسمية (IRCC • BAMF • USCIS)'
                  : 'Verified Directly Against Official Gov Portals (IRCC • BAMF • USCIS)'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-amber" style={{ animationDelay: '0.19s' }}>
              <span className="feature-pill-icon">🤖</span>
              <span className="feature-pill-title">
                {isAr ? 'حساب نقاطك ومستشار ذكي لحالتك' : 'Exact Points & AI Case Advisor'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-gradient"
            onClick={() => setStage('countries')}
          >
            {isAr ? 'التالي: اختر دولة الهجرة ←' : 'Next: Choose Destination Country →'}
          </button>

          <div>
            <button
              type="button"
              className="btn-skip-colorful"
              onClick={() => setStage('results')}
            >
              {isAr ? 'تخطي كل الأسئلة للنتائج ⏭' : 'Skip all questions to results ⏭'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SLIDE 3: Select ONE Destination Country (each country has its own questions & variables)
  if (stage === 'countries') {
    return (
      <div className="standalone-screen" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="launch-card" key="countries-slide" style={{ maxWidth: 680 }}>
          <div
            className="maple-hero-badge"
            style={{
              width: 'auto',
              display: 'inline-flex',
              padding: '0 22px',
              gap: 10,
            }}
          >
            <CountryFlag code="CA" size={22} />
            <CountryFlag code="DE" size={22} />
            <CountryFlag code="US" size={22} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>
            {isAr
              ? 'اختر الدولة التي تريد فحص الهجرة إليها'
              : 'Choose a Country to Evaluate'}
          </h1>
          <p style={{ fontSize: 13.5, color: '#475569', fontWeight: 600, marginBottom: 18, lineHeight: 1.5 }}>
            {isAr
              ? 'تُطرح الأسئلة وتُحسب النتيجة بناءً على قوانين الدولة المختارة فقط (شروط الأقارب، اللغة، معادلة الشهادة، والعملة الرسمية). يمكنك تبديل الدولة في أي وقت.'
              : 'Questions, variables, and eligibility results are tailored exclusively to the single country you select (relatives, language tests, degree recognition, and currency).'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {COUNTRY_META.map((c) => {
              const active = activeCountry === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => selectSingleCountry(c.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 20,
                    border: active ? `2.5px solid ${c.accent}` : '2px solid #e2e8f0',
                    background: active ? c.bgActive : '#ffffff',
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 10px 24px -8px rgba(15, 23, 42, 0.14)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <CountryFlag code={c.code} size={32} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                          {isAr ? c.nameAr : c.nameEn}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          🏛️ {c.officialDomain}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                        {isAr ? c.subAr : c.subEn}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f766e', marginTop: 4 }}>
                        ✓ {isAr ? `المصدر الحكومي: ${c.authorityAr}` : `Verified Source: ${c.authorityEn}`}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 14,
                      background: active ? c.accent : '#f1f5f9',
                      color: active ? '#ffffff' : '#94a3b8',
                      flexShrink: 0,
                    }}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-primary-gradient"
            onClick={() => setStage('survey')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <CountryFlag code={activeCountryMeta.code} size={20} />
            <span>
              {isAr
                ? `ابدأ أسئلة ${activeCountryMeta.shortNameAr} المخصصة`
                : `Start ${activeCountryMeta.nameEn} Questions`}
            </span>
          </button>

          <div>
            <button
              type="button"
              className="btn-skip-colorful"
              onClick={() => setStage('results')}
            >
              {isAr
                ? `تخطي كل الأسئلة إلى نتائج ${activeCountryMeta.shortNameAr} ⏭`
                : `Skip all questions to ${activeCountryMeta.nameEn} results ⏭`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header className="clean-app-header">
        <div className="container">
          <div className="header-inner-row">
            {/* Brand Logo with Real SVG Country Flag */}
            <div
              className="brand-logo"
              style={{ cursor: 'pointer' }}
              onClick={() => setStage('countries')}
              title={isAr ? 'انقر لتغيير الدولة' : 'Click to change country'}
            >
              <CountryFlag code={activeCountryMeta.code} size={22} />
              <span className="brand-name">
                {isAr
                  ? `مستكشف الهجرة — ${activeCountryMeta.shortNameAr}`
                  : `${activeCountryMeta.shortNameEn} PathFinder`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Single-Country Active Switcher in Header (with real SVG flags for CA, DE, US) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#f1f5f9',
                  padding: '4px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
                title={
                  isAr
                    ? 'اختر دولة واحدة لعرض أسئلتها ونتائجها الخاصة'
                    : 'Select a country to load its specific questions and results'
                }
              >
                {COUNTRY_META.map((c) => {
                  const active = activeCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectSingleCountry(c.code)}
                      style={{
                        border: active ? `1.5px solid ${c.accent}` : '1.5px solid transparent',
                        background: active ? '#ffffff' : 'transparent',
                        color: active ? '#0f172a' : '#475569',
                        fontSize: 13,
                        fontWeight: 800,
                        padding: '5px 11px',
                        borderRadius: 9,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        boxShadow: active ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CountryFlag code={c.code} size={16} />
                      <span>{isAr ? c.shortNameAr : c.shortNameEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Questions vs Results Switcher */}
              <div className="view-switch">
                <button
                  type="button"
                  className={`view-switch-btn ${stage === 'survey' ? 'active' : ''}`}
                  onClick={() => setStage('survey')}
                >
                  {isAr ? 'الأسئلة' : 'Questions'}
                </button>
                <button
                  type="button"
                  className={`view-switch-btn ${stage === 'results' ? 'active' : ''}`}
                  onClick={() => setStage('results')}
                >
                  {isAr ? `النتائج (${totalRelevant})` : `Results (${totalRelevant})`}
                </button>
              </div>

              {/* Language Switch Button */}
              <button
                type="button"
                onClick={() => setLang(isAr ? 'en' : 'ar')}
                className="btn-reset"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
              >
                <span style={{ fontSize: 14 }}>🌐</span>
                <span>{isAr ? 'English' : 'العربية'}</span>
              </button>

              {/* Reset Button with clean SVG icon and text (no ambiguous '↺' glyph) */}
              <button
                type="button"
                onClick={handleReset}
                title={isAr ? 'إعادة ضبط جميع الإجابات' : 'Reset all answers'}
                className="btn-reset"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>{isAr ? 'إعادة' : 'Reset'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {stage === 'survey' ? (
          <StepSurvey
            profile={profile}
            onChangeProfile={setProfile}
            onViewResults={() => setStage('results')}
            totalMatches={totalRelevant}
            lang={lang}
          />
        ) : (
          <SimpleResults
            profile={profile}
            outcomes={outcomes}
            onOpenSurvey={() => setStage('survey')}
            onSelectCountry={(code) => {
              selectSingleCountry(code);
              setStage('survey');
            }}
            lang={lang}
          />
        )}
      </main>

      <footer className="clean-footer">
        <div
          className="container"
          style={{
            display: 'flex',
            gap: 18,
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>
            {isAr ? 'المصادر الحكومية الرسمية المعتمدة:' : 'Verified Official Government Sources:'}
          </span>
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CountryFlag code="CA" size={14} />
            <span>IRCC (canada.ca) ↗</span>
          </a>
          <a
            href="https://www.make-it-in-germany.com/en/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CountryFlag code="DE" size={14} />
            <span>Make it in Germany / BAMF ↗</span>
          </a>
          <a
            href="https://www.uscis.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CountryFlag code="US" size={14} />
            <span>USCIS (uscis.gov) ↗</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
