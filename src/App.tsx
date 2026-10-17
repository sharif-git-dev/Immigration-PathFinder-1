import React, { useState, useEffect } from 'react';
import type { Profile } from './engine/types';
import { evaluateAll } from './engine/evaluate';
import { SimpleResults } from './components/SimpleResults';
import { StepSurvey } from './components/StepSurvey';
import { PRESET_PROFILES } from './data/presets';

const STORAGE_KEY = 'canada_pathfinder_profile_v4';
const LANG_KEY = 'canada_pathfinder_lang';

type AppStage = 'lang' | 'intro' | 'survey' | 'results';

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
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRESET_PROFILES[0].profile;
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
    setProfile({});
    setStage('lang');
  };

  const isAr = lang === 'ar';

  // SLIDE 1: Standalone Language Selection Screen (always LTR so it never flips)
  if (stage === 'lang') {
    return (
      <div className="standalone-screen" dir="ltr">
        <div className="launch-card">
          <div className="maple-hero-badge">🍁</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e1b4b' }}>
            Canada PathFinder
          </h1>

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
              <span className="feature-pill-icon">🧭</span>
              <span className="feature-pill-title">
                {isAr ? '48 برنامج هجرة رسمي' : '48 Official Pathways'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-emerald" style={{ animationDelay: '0.12s' }}>
              <span className="feature-pill-icon">⚡</span>
              <span className="feature-pill-title">
                {isAr ? 'فحص أهليتك ونقاطك فوراً' : 'Instant Score & Match'}
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
            onClick={() => setStage('survey')}
          >
            {isAr ? 'ابدأ الأسئلة' : 'Start Questions'}
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
              onClick={() => setStage('intro')}
            >
              <span style={{ fontSize: 22 }}>🍁</span>
              <span className="brand-name">{isAr ? 'هجرة كندا' : 'Canada PathFinder'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
        <div className="container">
          <a href="https://www.canada.ca" target="_blank" rel="noopener noreferrer">
            canada.ca ↗
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
