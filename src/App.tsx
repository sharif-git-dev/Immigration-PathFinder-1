import React, { useState, useEffect } from 'react';
import type { Profile } from './engine/types';
import { evaluateAll } from './engine/evaluate';
import { SimpleResults } from './components/SimpleResults';
import { StepSurvey } from './components/StepSurvey';
import { PRESET_PROFILES } from './data/presets';

const STORAGE_KEY = 'canada_pathfinder_profile_v4';
const LANG_KEY = 'canada_pathfinder_lang';

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

  const [activeView, setActiveView] = useState<'survey' | 'results'>('survey');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

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
    setActiveView('survey');
  };

  const isAr = lang === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page)',
      }}
    >
      <header className="clean-app-header">
        <div className="container">
          <div className="header-inner-row">
            <div className="brand-logo">
              <span style={{ fontSize: 24 }}>🍁</span>
              <span className="brand-name">{isAr ? 'برامج هجرة كندا' : 'Canada PathFinder'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div className="view-switch">
                <button
                  type="button"
                  className={`view-switch-btn ${activeView === 'survey' ? 'active' : ''}`}
                  onClick={() => setActiveView('survey')}
                >
                  {isAr ? 'الأسئلة' : 'Questions'}
                </button>
                <button
                  type="button"
                  className={`view-switch-btn ${activeView === 'results' ? 'active' : ''}`}
                  onClick={() => setActiveView('results')}
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
        {activeView === 'survey' ? (
          <StepSurvey
            profile={profile}
            onChangeProfile={setProfile}
            onViewResults={() => setActiveView('results')}
            totalMatches={totalRelevant}
            lang={lang}
            onChangeLang={setLang}
          />
        ) : (
          <SimpleResults
            profile={profile}
            outcomes={outcomes}
            onOpenSurvey={() => setActiveView('survey')}
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
