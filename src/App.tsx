import React, { useState, useEffect } from 'react';
import type { Profile, TargetCountry } from './engine/types';
import { evaluateAll } from './engine/evaluate';
import { SimpleResults } from './components/SimpleResults';
import { StepSurvey } from './components/StepSurvey';
import { CountryFlag } from './components/CountryFlag';
import { PRESET_PROFILES } from './data/presets';

const STORAGE_KEY = 'canada_pathfinder_profile_v4';
const LANG_KEY = 'canada_pathfinder_lang';

type AppStage = 'lang' | 'intro' | 'basics' | 'countries' | 'country_survey' | 'results';

const COUNTRY_META: {
  code: TargetCountry;
  shortNameEn: string;
  shortNameAr: string;
  nameEn: string;
  nameAr: string;
  subEn: string;
  subAr: string;
  extraQuestionsEn: string;
  extraQuestionsAr: string;
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
    extraQuestionsEn: 'Canada-only questions: Canadian study/work, French NCLC, LMIA job offer, relatives in Canada (Super Visa / sibling CRS), and $ CAD funds.',
    extraQuestionsAr: 'أسئلة كندا الإضافية: الدراسة أو العمل بكندا، اللغة الفرنسية NCLC، عقد عمل LMIA، الأقارب في كندا (الأخ/الأخت/الأبوين/الأجداد)، والمدخرات بالدولار الكندي ($ CAD).',
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
    extraQuestionsEn: 'Germany-only questions: ANABIN/ZAB degree recognition, German CEFR (A1–C1), Blue Card / Ausbildung contract, family (§ 36 AufenthG), and € EUR Blocked Account.',
    extraQuestionsAr: 'أسئلة ألمانيا الإضافية: معادلة الشهادة (ANABIN/ZAB)، مستوى اللغة الألمانية (A1–C1)، عقود البطاقة الزرقاء/التدريب المهني، الأقارب في ألمانيا (§ 36 AufenthG)، والحساب المغلق باليورو (€ EUR).',
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
    extraQuestionsEn: 'USA-only questions: DV Lottery country of birth, EB-2 NIW / EB-1A self-petition achievements, H-1B / Cap-Exempt sponsorship, Form I-130 family, and $ USD funds.',
    extraQuestionsAr: 'أسئلة أمريكا الإضافية: بلد الميلاد للوتري DV، إنجازات الإعفاء الوطني EB-2 NIW والقدرات الفائقة، كفالة H-1B والجامعات المعفاة، الأقارب الفوريون Form I-130، والمدخرات بالدولار الأمريكي ($ USD).',
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

  // When switching countries in the navbar, tell the user their shared basics are kept and open that country's specific questions
  const handleHeaderCountrySwitch = (code: TargetCountry) => {
    selectSingleCountry(code);
    if (stage === 'basics') {
      setStage('country_survey');
    } else if (stage === 'results') {
      // If on results, let them answer the newly selected country's specific questions (where they can also skip to results)
      setStage('country_survey');
    } else {
      setStage('country_survey');
    }
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
            {isAr ? 'كيف يعمل الموقع؟' : 'How It Works'}
          </h1>

          <div className="feature-pills-grid">
            <div className="feature-pill-card feature-pill-indigo" style={{ animationDelay: '0.05s' }}>
              <span className="feature-pill-icon">🌍</span>
              <span className="feature-pill-title">
                {isAr
                  ? '1. أسئلة أساسية مشتركة تُحفظ وتُستخدم لجميع الدول'
                  : '1. Shared Basic Questions Saved & Reused for All Countries'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-emerald" style={{ animationDelay: '0.12s' }}>
              <span className="feature-pill-icon">🎯</span>
              <span className="feature-pill-title">
                {isAr
                  ? '2. اختر الدولة وأجب فقط عن أسئلتها الإضافية الخاصة'
                  : '2. Select a Country & Answer Only Its Specific Questions'}
              </span>
            </div>

            <div className="feature-pill-card feature-pill-amber" style={{ animationDelay: '0.19s' }}>
              <span className="feature-pill-icon">🏛️</span>
              <span className="feature-pill-title">
                {isAr
                  ? '3. نتائج موثقة من المواقع الحكومية ومستشار ذكي'
                  : '3. Official Gov Verification & AI Case Advisor'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-gradient"
            onClick={() => setStage('basics')}
          >
            {isAr
              ? 'ابدأ الخطوة 1: الأسئلة الأساسية المشتركة ←'
              : 'Start Step 1: Shared Basic Questions →'}
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

  // SLIDE 3 (After Basics or when choosing a country): Tell user their shared basics are ready & ask them to pick a country for its specific questions
  if (stage === 'countries') {
    return (
      <div className="standalone-screen" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="launch-card" key="countries-slide" style={{ maxWidth: 700 }}>
          {/* Shared Basic Answers Confirmation Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '1.5px solid #86efac',
              borderRadius: 18,
              padding: '14px 18px',
              marginBottom: 20,
              textAlign: isAr ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#064e3b' }}>
                {isAr
                  ? '✅ إجاباتك الأساسية محفوظة وتُستخدم لجميع الدول الثلاث!'
                  : '✅ Your Shared Basic Answers Are Saved for All 3 Countries!'}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#065f46', marginTop: 3 }}>
                {isAr
                  ? 'عندما تنتقل بين كندا وألمانيا وأمريكا، لن تحتاج لإعادة الأسئلة الأساسية (العمر، التعليم، الإنجليزية، الخبرة، الجنسية) — ستجيب فقط عن الأسئلة الإضافية الخاصة بالدولة المختارة.'
                  : 'Whenever you switch between Canada, Germany, and the USA, your basic answers (age, education, English, work experience, nationality) are automatically reused. You only answer the extra questions for the country you select.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStage('basics')}
              style={{
                background: '#ffffff',
                color: '#065f46',
                border: '1.5px solid #6ee7b7',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isAr ? '✎ تعديل الأساسيات المشتركة' : '✎ Edit Shared Basics'}
            </button>
          </div>

          <h1 style={{ fontSize: 23, fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>
            {isAr
              ? 'الخطوة 2: اختر الدولة للإجابة على أسئلتها الخاصة'
              : 'Step 2: Select a Country for Its Specific Questions'}
          </h1>
          <p style={{ fontSize: 13.5, color: '#475569', fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>
            {isAr
              ? 'لكل دولة أسئلتها الإضافية الخاصة بها (مثل نوع الأقارب المؤهلين، معادلة الشهادات، والعملة الرسمية):'
              : 'Each country has its own additional questions and official legal variables:'}
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
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                        {isAr ? c.extraQuestionsAr : c.extraQuestionsEn}
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
            onClick={() => setStage('country_survey')}
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
                ? `متابعة إلى أسئلة ${activeCountryMeta.shortNameAr} الإضافية ←`
                : `Continue to ${activeCountryMeta.nameEn}-Specific Questions →`}
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
                    ? 'بدّل الدولة مع الاحتفاظ بإجاباتك الأساسية المشتركة تلقائياً'
                    : 'Switch country while keeping your shared basic answers automatically'
                }
              >
                {COUNTRY_META.map((c) => {
                  const active = activeCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleHeaderCountrySwitch(c.code)}
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

              {/* Shared Basics vs Country Questions vs Results Switcher */}
              <div className="view-switch">
                <button
                  type="button"
                  className={`view-switch-btn ${stage === 'basics' ? 'active' : ''}`}
                  onClick={() => setStage('basics')}
                >
                  {isAr ? 'الأساسيات المشتركة' : 'Shared Basics'}
                </button>
                <button
                  type="button"
                  className={`view-switch-btn ${stage === 'country_survey' ? 'active' : ''}`}
                  onClick={() => setStage('country_survey')}
                >
                  {isAr
                    ? `أسئلة ${activeCountryMeta.shortNameAr}`
                    : `${activeCountryMeta.shortNameEn} Questions`}
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

              {/* Reset Button with clean SVG icon and text */}
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
        {stage === 'basics' ? (
          <StepSurvey
            profile={profile}
            onChangeProfile={setProfile}
            mode="basics"
            onFinishBasics={() => setStage('countries')}
            onViewResults={() => setStage('results')}
            totalMatches={totalRelevant}
            lang={lang}
          />
        ) : stage === 'country_survey' ? (
          <StepSurvey
            profile={profile}
            onChangeProfile={setProfile}
            mode="country"
            onFinishBasics={() => setStage('countries')}
            onEditBasics={() => setStage('basics')}
            onViewResults={() => setStage('results')}
            totalMatches={totalRelevant}
            lang={lang}
          />
        ) : (
          <SimpleResults
            profile={profile}
            outcomes={outcomes}
            onOpenSurvey={() => setStage('country_survey')}
            onSelectCountry={(code) => {
              selectSingleCountry(code);
              setStage('country_survey');
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
