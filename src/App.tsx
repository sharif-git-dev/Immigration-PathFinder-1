import React, { useState, useEffect } from 'react';
import type { Profile, TargetCountry } from './engine/types';
import { evaluateAll } from './engine/evaluate';
import { SimpleResults } from './components/SimpleResults';
import { StepSurvey } from './components/StepSurvey';
import { PRESET_PROFILES } from './data/presets';

const STORAGE_KEY = 'canada_pathfinder_profile_v4';
const LANG_KEY = 'canada_pathfinder_lang';

type AppStage = 'lang' | 'intro' | 'countries' | 'survey' | 'results';

const COUNTRY_META: {
  code: TargetCountry;
  flag: string;
  nameEn: string;
  nameAr: string;
  subEn: string;
  subAr: string;
  accent: string;
  bgActive: string;
}[] = [
  {
    code: 'CA',
    flag: '🍁',
    nameEn: 'Canada',
    nameAr: 'كندا',
    subEn: 'Express Entry • PNP • Work • Study • Family • Asylum',
    subAr: 'Express Entry • المقاطعات • عمل • دراسة • لم شمل • لجوء',
    accent: '#e11d48',
    bgActive: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
  },
  {
    code: 'DE',
    flag: '🇩🇪',
    nameEn: 'Germany',
    nameAr: 'ألمانيا',
    subEn: 'Chancenkarte • EU Blue Card • Ausbildung • Study • Asylum',
    subAr: 'بطاقة الفرص Chancenkarte • البطاقة الزرقاء • تدريب مهني • دراسة • لجوء',
    accent: '#d97706',
    bgActive: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  {
    code: 'US',
    flag: '🇺🇸',
    nameEn: 'United States',
    nameAr: 'الولايات المتحدة (أمريكا)',
    subEn: 'EB-1/EB-2 NIW • DV Lottery • H-1B • F-1 OPT • Family • Asylum',
    subAr: 'جرين كارد EB-2 NIW • اللوتري • عمل H-1B • دراسة F-1 • لم شمل • لجوء',
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
        if (!parsed.targetCountries || parsed.targetCountries.length === 0) {
          parsed.targetCountries = ['CA', 'DE', 'US'];
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      ...PRESET_PROFILES[0].profile,
      targetCountries: ['CA', 'DE', 'US'],
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

  const selectedCountries: TargetCountry[] =
    profile.targetCountries && profile.targetCountries.length > 0
      ? profile.targetCountries
      : ['CA', 'DE', 'US'];

  const toggleCountry = (code: TargetCountry) => {
    const current = selectedCountries;
    if (current.includes(code)) {
      if (current.length === 1) return; // Keep at least 1 selected
      setProfile({ ...profile, targetCountries: current.filter((c) => c !== code) });
    } else {
      setProfile({ ...profile, targetCountries: [...current, code] });
    }
  };

  const selectAllCountries = () => {
    setProfile({ ...profile, targetCountries: ['CA', 'DE', 'US'] });
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
    setProfile({ targetCountries: ['CA', 'DE', 'US'] });
    setStage('lang');
  };

  const isAr = lang === 'ar';

  // SLIDE 1: Standalone Language Selection Screen (always LTR so it never flips)
  if (stage === 'lang') {
    return (
      <div className="standalone-screen" dir="ltr">
        <div className="launch-card">
          <div className="maple-hero-badge" style={{ fontSize: 26, gap: 4 }}>
            <span>🍁</span>
            <span>🇩🇪</span>
            <span>🇺🇸</span>
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
              <span className="feature-pill-icon">🌍</span>
              <span className="feature-pill-title">
                {isAr ? '75+ مسار هجرة رسمي (كندا وألمانيا وأمريكا)' : '75+ Official Pathways (CA • DE • US)'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-emerald" style={{ animationDelay: '0.12s' }}>
              <span className="feature-pill-icon">⚡</span>
              <span className="feature-pill-title">
                {isAr ? 'حساب نقاطك وأهليتك فوراً' : 'Instant Score & Eligibility Match'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-amber" style={{ animationDelay: '0.19s' }}>
              <span className="feature-pill-icon">🤖</span>
              <span className="feature-pill-title">
                {isAr ? 'مستشار ذكي لحالتك' : 'AI Case Advisor'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-gradient"
            onClick={() => setStage('countries')}
          >
            {isAr ? 'التالي: اختر الدول المهتم بها ←' : 'Next: Select Countries →'}
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

  // SLIDE 3: Select Countries of Interest Before Starting
  if (stage === 'countries') {
    const allSelected = selectedCountries.length === 3;
    return (
      <div className="standalone-screen" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="launch-card" key="countries-slide" style={{ maxWidth: 660 }}>
          <div className="maple-hero-badge" style={{ fontSize: 28 }}>
            🌍
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>
            {isAr
              ? 'اختر الدول التي تهتم بالهجرة إليها'
              : 'Select Countries You Are Interested In'}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginBottom: 20 }}>
            {isAr
              ? 'يمكنك اختيار دولة واحدة أو أكثر لمقارنة جميع مساراتها الرسمية لعام 2026'
              : 'Select one or more destinations to compare all official 2026 immigration pathways'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
            {COUNTRY_META.map((c) => {
              const active = selectedCountries.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleCountry(c.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: '18px 20px',
                    borderRadius: 20,
                    border: active ? `2.5px solid ${c.accent}` : '2px solid #e2e8f0',
                    background: active ? c.bgActive : '#ffffff',
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 10px 24px -8px rgba(15, 23, 42, 0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 34, lineHeight: 1 }}>{c.flag}</span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        {isAr ? c.nameAr : c.nameEn}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginTop: 3 }}>
                        {isAr ? c.subAr : c.subEn}
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
                      fontSize: 15,
                      background: active ? c.accent : '#f1f5f9',
                      color: active ? '#ffffff' : '#94a3b8',
                      flexShrink: 0,
                    }}
                  >
                    {active ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>

          {!allSelected && (
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={selectAllCountries}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#4f46e5',
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  padding: '6px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                {isAr ? '✓ اختيار الدول الثلاث معاً (كندا + ألمانيا + أمريكا)' : '✓ Select All 3 Countries (CA + DE + US)'}
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn-primary-gradient"
            onClick={() => setStage('survey')}
          >
            {isAr ? 'ابدأ الأسئلة الآن' : 'Start Questions Now'}
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
            <div
              className="brand-logo"
              style={{ cursor: 'pointer' }}
              onClick={() => setStage('countries')}
            >
              <span style={{ fontSize: 20 }}>🌍</span>
              <span className="brand-name">
                {isAr ? 'مستكشف الهجرة العالمي' : 'Global PathFinder'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Quick Country Filter Toggles in Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#f8fafc',
                  padding: '3px 6px',
                  borderRadius: 999,
                  border: '1px solid #e2e8f0',
                }}
                title={isAr ? 'تبديل الدول المختارة' : 'Toggle selected countries'}
              >
                {COUNTRY_META.map((c) => {
                  const active = selectedCountries.includes(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggleCountry(c.code)}
                      style={{
                        border: 'none',
                        background: active ? '#1e1b4b' : 'transparent',
                        color: active ? '#ffffff' : '#64748b',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '4px 9px',
                        borderRadius: 999,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </button>
                  );
                })}
              </div>

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

              <button
                type="button"
                onClick={() => setLang(isAr ? 'en' : 'ar')}
                className="btn-reset"
              >
                {isAr ? 'EN' : 'عربي'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                title={isAr ? 'إعادة ضبط' : 'Reset'}
                className="btn-reset"
              >
                ↺
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
            lang={lang}
          />
        )}
      </main>

      <footer className="clean-footer">
        <div className="container" style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://www.canada.ca" target="_blank" rel="noopener noreferrer">
            🍁 canada.ca ↗
          </a>
          <a href="https://www.make-it-in-germany.com/en/" target="_blank" rel="noopener noreferrer">
            🇩🇪 make-it-in-germany.com ↗
          </a>
          <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer">
            🇺🇸 uscis.gov ↗
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
