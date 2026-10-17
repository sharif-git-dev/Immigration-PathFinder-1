import React, { useState, useEffect } from 'react';
import type { Profile, Province } from '../engine/types';
import { COUNTRIES } from '../data/countries';
import { getCountryDisplayName, PROVINCE_AR } from '../data/arabicTranslations';

interface StepSurveyProps {
  profile: Profile;
  onChangeProfile: (updated: Profile) => void;
  onViewResults: () => void;
  totalMatches: number;
  lang: 'ar' | 'en';
}

interface StepConfig {
  id: string;
  titleAr: string;
  subtitleAr?: string;
  titleEn: string;
  subtitleEn?: string;
  isMulti?: boolean;
  showIf?: (p: Profile) => boolean;
}

export const StepSurvey: React.FC<StepSurveyProps> = ({
  profile,
  onChangeProfile,
  onViewResults,
  totalMatches,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showStepInfo, setShowStepInfo] = useState(false);
  const [openOptionInfo, setOpenOptionInfo] = useState<string | null>(null);

  const setField = (field: keyof Profile, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  const allSteps: StepConfig[] = [
    {
      id: 'residenceCountry',
      titleAr: 'بلد الإقامة؟',
      subtitleAr: 'الدولة التي تتواجد فيها الآن فعلياً.',
      titleEn: 'Residence?',
      subtitleEn: 'The country where you currently live.',
    },
    {
      id: 'residenceStatus',
      titleAr: 'وضعك القانوني؟',
      subtitleAr: 'يحدد مسارات السفارة أو الحماية المتاحة لك.',
      titleEn: 'Legal status?',
      subtitleEn: 'Determines visa office and protection eligibility.',
      showIf: (p) => p.residenceCountry !== undefined && p.residenceCountry !== 'CA',
    },
    {
      id: 'canadaStatus',
      titleAr: 'وضعك بكندا؟',
      subtitleAr: 'نوع التصريح الحالي داخل كندا.',
      titleEn: 'Status in Canada?',
      subtitleEn: 'Your current permit or legal status inside Canada.',
      showIf: (p) => p.residenceCountry === 'CA',
    },
    {
      id: 'citizenships',
      titleAr: 'الجنسية؟',
      subtitleAr: 'يمكنك اختيار أكثر من جنسية.',
      titleEn: 'Citizenship?',
      subtitleEn: 'Select one or more.',
      isMulti: true,
    },
    {
      id: 'age',
      titleAr: 'العمر؟',
      subtitleAr: 'أعلى نقاط عمر تكون بين 20 و29 سنة.',
      titleEn: 'Age?',
      subtitleEn: 'Max CRS age points are at ages 20–29.',
    },
    {
      id: 'education',
      titleAr: 'التعليم؟',
      subtitleAr: 'أعلى شهادة تخرجت منها.',
      titleEn: 'Education?',
      subtitleEn: 'Highest completed diploma or degree.',
    },
    {
      id: 'canadianEducation',
      titleAr: 'دراسة بكندا؟',
      subtitleAr: 'تمنحك +15 إلى +30 نقطة وتؤهلك لتصريح PGWP.',
      titleEn: 'Studied in Canada?',
      subtitleEn: 'Awards +15 to +30 CRS points and PGWP eligibility.',
    },
    {
      id: 'englishCLB',
      titleAr: 'الإنجليزية (CLB)؟',
      subtitleAr: 'معيار CLB المعادل لاختبار IELTS أو CELPIP.',
      titleEn: 'English (CLB)?',
      subtitleEn: 'CLB equivalent for IELTS or CELPIP.',
    },
    {
      id: 'frenchCLB',
      titleAr: 'الفرنسية (NCLC)؟',
      subtitleAr: 'مستوى 7+ يفتح سحوبات الفرنسية بنقاط منخفضة (~390).',
      titleEn: 'French (NCLC)?',
      subtitleEn: 'NCLC 7+ unlocks low-cutoff French draws (~390).',
    },
    {
      id: 'foreignExpYears',
      titleAr: 'الخبرة بالخارج؟',
      subtitleAr: 'خبرة عمل ماهرة خلال آخر 10 سنوات.',
      titleEn: 'Foreign work?',
      subtitleEn: 'Skilled work within the last 10 years.',
    },
    {
      id: 'canadianExpYears',
      titleAr: 'الخبرة بكندا؟',
      subtitleAr: 'خبرة عمل بتصريح قانوني داخل كندا.',
      titleEn: 'Canadian work?',
      subtitleEn: 'Authorized skilled work in Canada.',
    },
    {
      id: 'occupationFields',
      titleAr: 'المهنة؟',
      subtitleAr: 'سحوبات الفئات تتطلب 12 شهراً من الخبرة.',
      titleEn: 'Occupation?',
      subtitleEn: 'Category draws require 12+ months experience.',
      isMulti: true,
    },
    {
      id: 'jobOffer',
      titleAr: 'عرض عمل بكندا؟',
      subtitleAr: 'مطلوب لتصاريح العمل وبرامج الأطلسي والريف.',
      titleEn: 'Job offer?',
      subtitleEn: 'Required for work permits & regional pilots.',
    },
    {
      id: 'jobOfferProvince',
      titleAr: 'مقاطعة العمل؟',
      titleEn: 'Job province?',
      showIf: (p) => p.jobOffer === 'yes',
    },
    {
      id: 'relativesCitizenPR',
      titleAr: 'أقارب بكندا؟',
      subtitleAr: 'للكفالة العائلية أو +15 نقطة للأخ/الأخت.',
      titleEn: 'Family in Canada?',
      subtitleEn: 'For sponsorship or +15 sibling points.',
      isMulti: true,
    },
    {
      id: 'relativesProvinces',
      titleAr: 'مقاطعة الأقارب؟',
      titleEn: 'Relatives province?',
      isMulti: true,
      showIf: (p) =>
        p.relativesCitizenPR !== undefined &&
        p.relativesCitizenPR.length > 0,
    },
    {
      id: 'fearOfReturn',
      titleAr: 'حماية / لجوء؟',
      subtitleAr: 'لتقييم مسارات الكفالة الخاصة SAH أو المفوضية UNHCR.',
      titleEn: 'Refugee protection?',
      subtitleEn: 'For SAH sponsorship or UNHCR resettlement.',
    },
    {
      id: 'refugeeBackground',
      titleAr: 'وثائق الحماية؟',
      subtitleAr: 'اختر ما يتوفر لديك حالياً.',
      titleEn: 'Protection docs?',
      subtitleEn: 'Select all that apply.',
      isMulti: true,
      showIf: (p) =>
        p.fearOfReturn === 'yes' ||
        p.residenceStatus === 'temporary_protection' ||
        p.residenceStatus === 'refugee_recognized',
    },
    {
      id: 'fundsCAD',
      titleAr: 'المدخرات (CAD)؟',
      subtitleAr: 'FSW يتطلب 15,263$ للفرد، والدراسة 23,448$.',
      titleEn: 'Savings (CAD)?',
      subtitleEn: '$15,263 for FSW (1 person), $23,448 for Study.',
    },
    {
      id: 'admissibility',
      titleAr: 'السجل الجنائي؟',
      subtitleAr: 'شرط أساسي لجميع التأشيرات الكندية.',
      titleEn: 'Clean record?',
      subtitleEn: 'Required for all Canadian visas and PR.',
    },
  ];

  const activeSteps = allSteps.filter((step) => !step.showIf || step.showIf(profile));
  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];

  useEffect(() => {
    setShowStepInfo(false);
    setOpenOptionInfo(null);
  }, [currentStepIndex]);

  useEffect(() => {
    if (currentStepIndex >= activeSteps.length) {
      setCurrentStepIndex(Math.max(0, activeSteps.length - 1));
    }
  }, [activeSteps.length, currentStepIndex]);

  const goNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setDirection('forward');
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onViewResults();
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setDirection('backward');
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSingleSelect = (field: keyof Profile, value: any) => {
    setField(field, value);
    setTimeout(() => {
      goNext();
    }, 200);
  };

  const popularCountries = [
    'TR',
    'SY',
    'CA',
    'EG',
    'JO',
    'SA',
    'AE',
    'LB',
    'IQ',
    'PS',
    'SD',
    'MA',
  ];

  const progressPercentage = Math.round(((currentStepIndex + 1) / activeSteps.length) * 100);

  const renderOptionWithBang = (
    key: string,
    selected: boolean,
    label: string,
    hint: string | undefined,
    onClick: () => void,
  ) => {
    const isInfoOpen = openOptionInfo === key;
    return (
      <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          type="button"
          onClick={onClick}
          className={`option-tile ${selected ? 'selected' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="option-tile-title">{label}</span>
            {hint && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenOptionInfo(isInfoOpen ? null : key);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    setOpenOptionInfo(isInfoOpen ? null : key);
                  }
                }}
                className={`info-bang-btn ${isInfoOpen ? 'active' : ''}`}
                title={isAr ? 'توضيح' : 'Info'}
              >
                !
              </span>
            )}
          </div>
          <span className="option-tile-check">✓</span>
        </button>
        {hint && isInfoOpen && <div className="info-bang-popover">{hint}</div>}
      </div>
    );
  };

  const stepHint = isAr ? currentStep.subtitleAr : currentStep.subtitleEn;

  return (
    <div className="survey-wrapper">
      <div className="survey-top-nav">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className="step-nav-btn"
          style={{
            opacity: currentStepIndex === 0 ? 0.35 : 1,
            cursor: currentStepIndex === 0 ? 'default' : 'pointer',
          }}
        >
          {isAr ? '→ السابق' : '← Back'}
        </button>

        <span className="step-counter-pill">
          {currentStepIndex + 1} / {activeSteps.length}
        </span>

        <button
          type="button"
          onClick={goNext}
          className="step-nav-btn"
          style={{
            borderColor: '#a5b4fc',
            color: '#4f46e5',
            background: '#eef2ff',
          }}
        >
          {currentStepIndex === activeSteps.length - 1
            ? isAr
              ? 'النتائج ←'
              : 'Results →'
            : isAr
            ? 'التالي ←'
            : 'Next →'}
        </button>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div key={currentStep.id} className={`step-card step-animate-${direction}`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: showStepInfo && stepHint ? 8 : 26,
            flexWrap: 'wrap',
          }}
        >
          <h2 className="step-title" style={{ marginBottom: 0 }}>
            {isAr ? currentStep.titleAr : currentStep.titleEn}
          </h2>
          {stepHint && (
            <button
              type="button"
              onClick={() => setShowStepInfo((prev) => !prev)}
              className={`info-bang-btn ${showStepInfo ? 'active' : ''}`}
              title={isAr ? 'توضيح' : 'Info'}
            >
              !
            </button>
          )}
        </div>

        {showStepInfo && stepHint && (
          <div className="info-bang-popover" style={{ marginBottom: 22, textAlign: 'center' }}>
            {stepHint}
          </div>
        )}

        <div className="step-options-container">
          {/* 1. Residence Country */}
          {currentStep.id === 'residenceCountry' && (
            <div>
              <div className="option-grid">
                {popularCountries.map((code) => {
                  const selected = profile.residenceCountry === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSingleSelect('residenceCountry', code)}
                      className={`option-tile ${selected ? 'selected' : ''}`}
                    >
                      <span className="option-tile-title">
                        {getCountryDisplayName(code, lang)}
                      </span>
                      <span className="option-tile-check">✓</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                <select
                  value={profile.residenceCountry || ''}
                  onChange={(e) => {
                    if (e.target.value) handleSingleSelect('residenceCountry', e.target.value);
                  }}
                  className="step-select"
                >
                  <option value="">{isAr ? 'دولة أخرى...' : 'Other country...'}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {getCountryDisplayName(c.code, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 2. Residence Status Abroad */}
          {currentStep.id === 'residenceStatus' && (
            <div className="option-list">
              {[
                {
                  val: 'citizen',
                  labelAr: 'مواطن',
                  hintAr: 'تعيش في بلدك الأصلي الذي تحمل جنسيته.',
                  labelEn: 'Citizen',
                  hintEn: 'Living in your country of citizenship.',
                },
                {
                  val: 'permanent_resident',
                  labelAr: 'مقيم دائم',
                  hintAr: 'تحمل إقامة دائمة قانونية في بلد الإقامة.',
                  labelEn: 'Permanent Resident',
                  hintEn: 'Permanent legal status.',
                },
                {
                  val: 'temporary_protection',
                  labelAr: 'حماية مؤقتة (كملك)',
                  hintAr: 'مثل بطاقة الحماية المؤقتة (Kimlik) للسوريين في تركيا.',
                  labelEn: 'Temporary Protection (Kimlik)',
                  hintEn: 'e.g. Turkish Kimlik or EU Temporary Protection.',
                },
                {
                  val: 'refugee_recognized',
                  labelAr: 'لاجئ معترف به',
                  hintAr: 'معترف بك رسمياً من المفوضية (UNHCR) أو الدولة المضيفة.',
                  labelEn: 'Recognized Refugee',
                  hintEn: 'Recognized by UNHCR or host state.',
                },
                {
                  val: 'asylum_pending',
                  labelAr: 'طالب لجوء',
                  hintAr: 'ملف لجوء قيد الدراسة.',
                  labelEn: 'Asylum Seeker',
                  hintEn: 'Pending asylum claim.',
                },
                {
                  val: 'temp_work',
                  labelAr: 'إقامة عمل',
                  labelEn: 'Work Permit',
                },
                {
                  val: 'temp_study',
                  labelAr: 'إقامة طالب',
                  labelEn: 'Student Visa',
                },
                {
                  val: 'temp_visitor',
                  labelAr: 'زائر / سياحة',
                  labelEn: 'Visitor',
                },
                {
                  val: 'no_status',
                  labelAr: 'بلا إقامة قانونية',
                  labelEn: 'No Legal Status',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.residenceStatus === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('residenceStatus', opt.val),
                ),
              )}
            </div>
          )}

          {/* 3. Status in Canada */}
          {currentStep.id === 'canadaStatus' && (
            <div className="option-list">
              {[
                {
                  val: 'pgwp',
                  labelAr: 'تصريح عمل بعد التخرج (PGWP)',
                  labelEn: 'PGWP Holder',
                },
                {
                  val: 'worker',
                  labelAr: 'تصريح عمل',
                  labelEn: 'Work Permit',
                },
                {
                  val: 'student',
                  labelAr: 'تصريح دراسة',
                  labelEn: 'Study Permit',
                },
                {
                  val: 'visitor',
                  labelAr: 'زائر',
                  labelEn: 'Visitor',
                },
                {
                  val: 'asylum_claimant',
                  labelAr: 'طالب لجوء داخل كندا',
                  labelEn: 'Refugee Claimant',
                },
                {
                  val: 'protected_person',
                  labelAr: 'شخص محمي / لاجئ مقبول',
                  labelEn: 'Protected Person',
                },
                {
                  val: 'out_of_status',
                  labelAr: 'منتهي الإقامة',
                  labelEn: 'Out of Status',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.canadaStatus === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  undefined,
                  () => handleSingleSelect('canadaStatus', opt.val),
                ),
              )}
            </div>
          )}

          {/* 4. Citizenships */}
          {currentStep.id === 'citizenships' && (
            <div>
              <div className="option-grid">
                {popularCountries.map((code) => {
                  const current = profile.citizenships || [];
                  const selected = current.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        const updated = selected
                          ? current.filter((x) => x !== code)
                          : [...current, code];
                        setField('citizenships', updated);
                      }}
                      className={`option-tile ${selected ? 'selected' : ''}`}
                    >
                      <span className="option-tile-title">
                        {getCountryDisplayName(code, lang)}
                      </span>
                      <span className="option-tile-check">✓</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const current = profile.citizenships || [];
                      if (!current.includes(e.target.value)) {
                        setField('citizenships', [...current, e.target.value]);
                      }
                    }
                  }}
                  className="step-select"
                >
                  <option value="">{isAr ? 'إضافة دولة أخرى...' : 'Add another country...'}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {getCountryDisplayName(c.code, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 24 }}>
                <button type="button" onClick={goNext} className="btn-continue">
                  {isAr ? 'التالي ←' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {/* 5. Age */}
          {currentStep.id === 'age' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <input
                  type="number"
                  min="16"
                  max="99"
                  placeholder="28"
                  value={profile.age ?? ''}
                  onChange={(e) =>
                    setField('age', e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && profile.age !== undefined) goNext();
                  }}
                  className="step-number-input"
                />
                <span style={{ fontSize: 17, fontWeight: 700, color: '#475569' }}>
                  {isAr ? 'سنة' : 'years'}
                </span>
              </div>

              <div className="option-grid">
                {[
                  { age: 25, labelAr: '20 – 29 سنة', labelEn: '20–29 years' },
                  { age: 31, labelAr: '30 – 34 سنة', labelEn: '30–34 years' },
                  { age: 37, labelAr: '35 – 39 سنة', labelEn: '35–39 years' },
                  { age: 42, labelAr: '40 – 44 سنة', labelEn: '40–44 years' },
                  { age: 48, labelAr: '45+ سنة', labelEn: '45+ years' },
                ].map((b) => {
                  const selected = profile.age === b.age;
                  return (
                    <button
                      key={b.age}
                      type="button"
                      onClick={() => handleSingleSelect('age', b.age)}
                      className={`option-tile ${selected ? 'selected' : ''}`}
                    >
                      <span className="option-tile-title">{isAr ? b.labelAr : b.labelEn}</span>
                      <span className="option-tile-check">✓</span>
                    </button>
                  );
                })}
              </div>

              {profile.age !== undefined && (
                <div style={{ marginTop: 24 }}>
                  <button type="button" onClick={goNext} className="btn-continue">
                    {isAr ? 'التالي ←' : 'Next →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 6. Education */}
          {currentStep.id === 'education' && (
            <div className="option-list">
              {[
                {
                  val: 'phd',
                  labelAr: 'دكتوراه',
                  hintAr: '150 نقطة CRS / 25 نقطة FSW.',
                  labelEn: 'PhD',
                  hintEn: '150 CRS pts / 25 FSW pts.',
                },
                {
                  val: 'masters',
                  labelAr: 'ماجستير أو شهادة مهنية (طب/صيدلة/قانون)',
                  hintAr: '135 نقطة CRS / 23 نقطة FSW.',
                  labelEn: "Master's / Professional",
                  hintEn: '135 CRS pts / 23 FSW pts.',
                },
                {
                  val: 'two_or_more',
                  labelAr: 'شهادتان جامعيتان فأكثر',
                  hintAr: 'بشرط أن تكون إحداهما 3 سنوات فأكثر (128 نقطة CRS).',
                  labelEn: 'Two or More Degrees',
                  hintEn: 'One must be 3+ years (128 CRS pts).',
                },
                {
                  val: 'bachelors',
                  labelAr: 'بكالوريوس (3–4 سنوات)',
                  hintAr: '120 نقطة CRS / 21 نقطة FSW.',
                  labelEn: "Bachelor's Degree",
                  hintEn: '120 CRS pts / 21 FSW pts.',
                },
                {
                  val: 'two_year',
                  labelAr: 'دبلوم سنتين',
                  hintAr: '98 نقطة CRS / 19 نقطة FSW.',
                  labelEn: '2-Year Diploma',
                  hintEn: '98 CRS pts / 19 FSW pts.',
                },
                {
                  val: 'one_year',
                  labelAr: 'دبلوم سنة واحدة',
                  hintAr: '90 نقطة CRS / 15 نقطة FSW.',
                  labelEn: '1-Year Certificate',
                  hintEn: '90 CRS pts / 15 FSW pts.',
                },
                {
                  val: 'secondary',
                  labelAr: 'ثانوية عامة',
                  hintAr: '30 نقطة CRS / 5 نقاط FSW.',
                  labelEn: 'High School',
                  hintEn: '30 CRS pts / 5 FSW pts.',
                },
                {
                  val: 'none',
                  labelAr: 'أقل من ثانوية',
                  labelEn: 'Less than High School',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.education === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('education', opt.val),
                ),
              )}
            </div>
          )}

          {/* 7. Canadian Education */}
          {currentStep.id === 'canadianEducation' && (
            <div className="option-list">
              {[
                {
                  val: 'none',
                  labelAr: 'لا',
                  hintAr: 'الشهادات الأجنبية تتطلب معادلة ECA (مثل WES).',
                  labelEn: 'No',
                  hintEn: 'Foreign degrees require an ECA.',
                },
                {
                  val: 'masters_phd',
                  labelAr: 'نعم — ماجستير أو دكتوراه من كندا',
                  hintAr: '+30 نقطة إضافية في CRS.',
                  labelEn: "Yes — Canadian Master's / PhD",
                  hintEn: '+30 CRS bonus points.',
                },
                {
                  val: 'three_plus',
                  labelAr: 'نعم — بكالوريوس من كندا (3+ سنوات)',
                  hintAr: '+30 نقطة إضافية في CRS.',
                  labelEn: "Yes — Canadian Bachelor's",
                  hintEn: '+30 CRS bonus points.',
                },
                {
                  val: 'two_year',
                  labelAr: 'نعم — دبلوم سنتين من كندا',
                  hintAr: '+15 نقطة إضافية في CRS.',
                  labelEn: 'Yes — 2-Year Canadian Diploma',
                  hintEn: '+15 CRS bonus points.',
                },
                {
                  val: 'one_year',
                  labelAr: 'نعم — شهادة سنة من كندا',
                  hintAr: '+15 نقطة إضافية في CRS.',
                  labelEn: 'Yes — 1-Year Canadian Certificate',
                  hintEn: '+15 CRS bonus points.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.canadianEducation === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('canadianEducation', opt.val),
                ),
              )}
            </div>
          )}

          {/* 8. English Ability */}
          {currentStep.id === 'englishCLB' && (
            <div className="option-list">
              {[
                {
                  val: 9,
                  labelAr: 'متقدم (CLB 9–10)',
                  hintAr: 'يعادل IELTS 8.0 استماع و7.0 في الباقي — يمنح أعلى نقاط تفاعل في CRS.',
                  labelEn: 'Advanced (CLB 9–10)',
                  hintEn: 'IELTS 8.0 L / 7.0 R,W,S — max CRS transferability points.',
                },
                {
                  val: 7,
                  labelAr: 'جيد جداً (CLB 7–8)',
                  hintAr: 'يعادل IELTS 6.0 في كل مهارة — الحد الأدنى لبرنامج العمالة الماهرة FSW.',
                  labelEn: 'Competent (CLB 7–8)',
                  hintEn: 'IELTS 6.0 all bands — minimum for FSW.',
                },
                {
                  val: 5,
                  labelAr: 'متوسط (CLB 5–6)',
                  hintAr: 'يعادل IELTS 5.0 — يكفي للحرفيين FST وبعض المقاطعات.',
                  labelEn: 'Intermediate (CLB 5–6)',
                  hintEn: 'IELTS 5.0 — eligible for Trades & some PNPs.',
                },
                {
                  val: 4,
                  labelAr: 'أساسي (CLB 4)',
                  hintAr: 'يعادل IELTS 4.0–4.5.',
                  labelEn: 'Basic (CLB 4)',
                  hintEn: 'IELTS 4.0–4.5.',
                },
                {
                  val: 0,
                  labelAr: 'مبتدئ / بدون اختبار',
                  labelEn: 'Beginner / No Test',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.englishCLB === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('englishCLB', opt.val),
                ),
              )}
            </div>
          )}

          {/* 9. French Ability */}
          {currentStep.id === 'frenchCLB' && (
            <div className="option-list">
              {[
                {
                  val: 0,
                  labelAr: 'لا أتحدث الفرنسية',
                  labelEn: 'No French',
                },
                {
                  val: 7,
                  labelAr: 'متقدم (NCLC 7+)',
                  hintAr: '+50 نقطة إضافية ويفتح سحوبات الفئة الفرنسية (~390–415 CRS).',
                  labelEn: 'Advanced (NCLC 7+)',
                  hintEn: '+50 CRS points & French category draws (~390–415).',
                },
                {
                  val: 5,
                  labelAr: 'متوسط (NCLC 5–6)',
                  hintAr: 'يؤهلك لتصريح عمل Mobilité Francophone المعفى من LMIA.',
                  labelEn: 'Intermediate (NCLC 5–6)',
                  hintEn: 'Qualifies for Francophone Mobility work permit.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.frenchCLB === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('frenchCLB', opt.val),
                ),
              )}
            </div>
          )}

          {/* 10. Foreign Experience */}
          {currentStep.id === 'foreignExpYears' && (
            <div className="option-list">
              {[
                {
                  val: 6,
                  labelAr: '6 سنوات فأكثر',
                  hintAr: 'الحد الأقصى (15 نقطة) في جدول FSW.',
                  labelEn: '6+ years',
                  hintEn: 'Max 15 points on FSW grid.',
                },
                { val: 4, labelAr: '4 – 5 سنوات', labelEn: '4–5 years' },
                { val: 2, labelAr: '2 – 3 سنوات', labelEn: '2–3 years' },
                {
                  val: 1,
                  labelAr: 'سنة واحدة',
                  hintAr: 'الحد الأدنى لبرنامج FSW وسحوبات الفئات لعام 2026.',
                  labelEn: '1 year',
                  hintEn: 'Minimum for FSW & 2026 Category draws.',
                },
                { val: 0, labelAr: 'لا يوجد / أقل من سنة', labelEn: 'None / < 1 year' },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.foreignExpYears === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('foreignExpYears', opt.val),
                ),
              )}
            </div>
          )}

          {/* 11. Canadian Experience */}
          {currentStep.id === 'canadianExpYears' && (
            <div className="option-list">
              {[
                { val: 0, labelAr: 'لا يوجد', labelEn: 'None' },
                {
                  val: 1,
                  labelAr: 'سنة واحدة',
                  hintAr: 'تؤهلك لفئة الخبرة الكندية (CEC).',
                  labelEn: '1 year',
                  hintEn: 'Qualifies for CEC.',
                },
                { val: 2, labelAr: 'سنتان', labelEn: '2 years' },
                { val: 3, labelAr: '3 سنوات فأكثر', labelEn: '3+ years' },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.canadianExpYears === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('canadianExpYears', opt.val),
                ),
              )}
            </div>
          )}

          {/* 12. Occupation Field */}
          {currentStep.id === 'occupationFields' && (
            <div>
              <div className="option-grid">
                {[
                  { val: 'healthcare', labelAr: '🏥 الرعاية الصحية', labelEn: '🏥 Healthcare' },
                  { val: 'stem', labelAr: '💻 الهندسة والتقنية (STEM)', labelEn: '💻 STEM / Engineering' },
                  { val: 'trades', labelAr: '🔨 الحرف والبناء', labelEn: '🔨 Skilled Trades' },
                  { val: 'education', labelAr: '📚 التعليم', labelEn: '📚 Education' },
                  { val: 'transport', labelAr: '🚛 النقل والطيران', labelEn: '🚛 Transport' },
                  { val: 'agriculture', labelAr: '🌾 الزراعة والأغذية', labelEn: '🌾 Agriculture' },
                  { val: 'caregiving', labelAr: '👶 الرعاية المنزلية', labelEn: '👶 Caregiving' },
                  { val: 'business', labelAr: '📊 الإدارة والمالية', labelEn: '📊 Business & Finance' },
                  { val: 'hospitality', labelAr: '🍳 الضيافة والمبيعات', labelEn: '🍳 Hospitality' },
                  { val: 'other', labelAr: '📁 مجال آخر', labelEn: '📁 Other' },
                ].map((opt) => {
                  const current = profile.occupationFields || [];
                  const selected = current.includes(opt.val as any);
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        const updated = selected
                          ? current.filter((x) => x !== opt.val)
                          : [...current, opt.val as any];
                        setField('occupationFields', updated);
                      }}
                      className={`option-tile ${selected ? 'selected' : ''}`}
                    >
                      <span className="option-tile-title">{isAr ? opt.labelAr : opt.labelEn}</span>
                      <span className="option-tile-check">✓</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 24 }}>
                <button type="button" onClick={goNext} className="btn-continue">
                  {isAr ? 'التالي ←' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {/* 13. Job Offer */}
          {currentStep.id === 'jobOffer' && (
            <div className="option-list">
              {[
                { val: 'no', labelAr: 'لا', labelEn: 'No' },
                {
                  val: 'yes',
                  labelAr: 'نعم — لدي عرض عمل رسمي في كندا',
                  hintAr: 'يفتح تصاريح العمل وبرامج الأطلسي والريف والمقاطعات.',
                  labelEn: 'Yes — Official Canadian job offer',
                  hintEn: 'Unlocks work permits, AIP, RCIP, and PNPs.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.jobOffer === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('jobOffer', opt.val),
                ),
              )}
            </div>
          )}

          {/* 14. Job Offer Province */}
          {currentStep.id === 'jobOfferProvince' && (
            <div className="option-grid">
              {(['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'] as Province[]).map(
                (code) => {
                  const selected = profile.jobOfferProvince === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSingleSelect('jobOfferProvince', code)}
                      className={`option-tile ${selected ? 'selected' : ''}`}
                    >
                      <span className="option-tile-title">
                        {isAr ? PROVINCE_AR[code] : code}
                      </span>
                      <span className="option-tile-check">✓</span>
                    </button>
                  );
                },
              )}
            </div>
          )}

          {/* 15. Canadian Relatives */}
          {currentStep.id === 'relativesCitizenPR' && (
            <div>
              <div className="option-list">
                {[
                  { val: 'none', labelAr: 'لا يوجد', labelEn: 'None' },
                  {
                    val: 'spouse',
                    labelAr: 'زوج / زوجة',
                    hintAr: 'مؤهل لكفالة الزوج/الزوجة المباشرة.',
                    labelEn: 'Spouse / Partner',
                    hintEn: 'Eligible for Spousal Sponsorship.',
                  },
                  {
                    val: 'sibling',
                    labelAr: 'أخ / أخت',
                    hintAr: '+15 نقطة CRS و+5 نقاط FSW.',
                    labelEn: 'Brother / Sister',
                    hintEn: '+15 CRS pts & +5 FSW pts.',
                  },
                  {
                    val: 'child',
                    labelAr: 'ابن / ابنة بالغ',
                    hintAr: 'مؤهل لتأشيرة السوبر فيزا لمدة 5 سنوات.',
                    labelEn: 'Adult Child',
                    hintEn: 'Eligible for 5-year Super Visa.',
                  },
                  {
                    val: 'parent',
                    labelAr: 'أب / أم / جد',
                    hintAr: 'الجنسية بالنسب أو كفالة الأبناء دون 22 سنة.',
                    labelEn: 'Parent / Grandparent',
                    hintEn: 'Citizenship by descent or child sponsorship (<22).',
                  },
                  {
                    val: 'aunt_uncle',
                    labelAr: 'عم / خال / عمة / خالة / ابن عم أو خال',
                    hintAr: 'نقاط دعم في مانيتوبا (MPNP) وساسكاتشوان (SINP).',
                    labelEn: 'Aunt / Uncle / Cousin / Niece / Nephew',
                    hintEn: 'Family points in Manitoba & Saskatchewan.',
                  },
                ].map((opt) => {
                  const current = profile.relativesCitizenPR || [];
                  const isNone = opt.val === 'none';
                  const selected = isNone
                    ? current.length === 0
                    : current.includes(opt.val as any);
                  return renderOptionWithBang(
                    opt.val,
                    selected,
                    isAr ? opt.labelAr : opt.labelEn,
                    isAr ? opt.hintAr : opt.hintEn,
                    () => {
                      if (isNone) {
                        setField('relativesCitizenPR', []);
                      } else {
                        const updated = selected
                          ? current.filter((x) => (x as string) !== opt.val)
                          : [...current, opt.val as any];
                        setField('relativesCitizenPR', updated);
                      }
                    },
                  );
                })}
              </div>

              <div style={{ marginTop: 24 }}>
                <button type="button" onClick={goNext} className="btn-continue">
                  {isAr ? 'التالي ←' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {/* 16. Relatives Provinces */}
          {currentStep.id === 'relativesProvinces' && (
            <div>
              <div className="option-grid">
                {(['ON', 'MB', 'SK', 'AB', 'BC', 'QC', 'NS', 'NB', 'NL'] as Province[]).map(
                  (code) => {
                    const current = (profile.relativesProvinces as Province[]) || [];
                    const selected = current.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? current.filter((x) => x !== code)
                            : [...current, code];
                          setField('relativesProvinces', updated);
                        }}
                        className={`option-tile ${selected ? 'selected' : ''}`}
                      >
                        <span className="option-tile-title">
                          {isAr ? PROVINCE_AR[code] : code}
                        </span>
                        <span className="option-tile-check">✓</span>
                      </button>
                    );
                  },
                )}
              </div>

              <div style={{ marginTop: 24 }}>
                <button type="button" onClick={goNext} className="btn-continue">
                  {isAr ? 'التالي ←' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {/* 17. Fear of Return */}
          {currentStep.id === 'fearOfReturn' && (
            <div className="option-list">
              {[
                { val: 'no', labelAr: 'لا', labelEn: 'No' },
                {
                  val: 'yes',
                  labelAr: 'نعم — أخشى العودة بسبب خطر أو حرب',
                  hintAr: 'لتقييم مسارات إعادة توطين اللاجئين (SAH / UNHCR).',
                  labelEn: 'Yes — Fear of persecution or conflict',
                  hintEn: 'For SAH / UNHCR resettlement pathways.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.fearOfReturn === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('fearOfReturn', opt.val),
                ),
              )}
            </div>
          )}

          {/* 18. Refugee Background */}
          {currentStep.id === 'refugeeBackground' && (
            <div>
              <div className="option-list">
                {[
                  {
                    val: 'kimlik',
                    labelAr: 'بطاقة حماية مؤقتة (كملك)',
                    hintAr: 'تقبلها منظمات SAH للكفالة الخاصة بدون شرط شهادة UNHCR (برنامج EMPP مغلق في مارس 2026).',
                    labelEn: 'Temporary Protection ID (Kimlik)',
                    hintEn: 'Accepted by SAH sponsors without UNHCR RSD (EMPP closed March 2026).',
                    action: () =>
                      setField(
                        'refugeeDocument',
                        profile.refugeeDocument === 'temporary_protection_id' ? 'none' : 'temporary_protection_id',
                      ),
                    active: profile.refugeeDocument === 'temporary_protection_id',
                  },
                  {
                    val: 'unhcr',
                    labelAr: 'تسجيل مفوضية اللاجئين (UNHCR)',
                    hintAr: 'مطلوب لإحالة التوطين الحكومي GAR (كفالة الخمسة G5 متوقفة حالياً).',
                    labelEn: 'UNHCR Registration',
                    hintEn: 'Required for GAR referral (Group of Five is paused).',
                    action: () => {
                      const next = profile.unhcrRegistered === 'yes' ? 'no' : 'yes';
                      setField('unhcrRegistered', next);
                      if (next === 'yes' && !profile.refugeeDocument) {
                        setField('refugeeDocument', 'unhcr');
                      }
                    },
                    active: profile.unhcrRegistered === 'yes',
                  },
                  {
                    val: 'sah',
                    labelAr: 'منظمة كندية كافلة (SAH)',
                    hintAr: 'منظمة معتمدة في كندا مستعدة لتقديم ملف كفالتك.',
                    labelEn: 'Canadian SAH Sponsor Organization',
                    hintEn: 'Approved Canadian organization ready to sponsor you.',
                    action: () => {
                      const hasSah = profile.sponsorAvailable?.includes('sah');
                      setField('sponsorAvailable', hasSah ? [] : ['sah']);
                    },
                    active: Boolean(profile.sponsorAvailable?.includes('sah')),
                  },
                ].map((item) =>
                  renderOptionWithBang(
                    item.val,
                    item.active,
                    isAr ? item.labelAr : item.labelEn,
                    isAr ? item.hintAr : item.hintEn,
                    item.action,
                  ),
                )}
              </div>

              <div style={{ marginTop: 24 }}>
                <button type="button" onClick={goNext} className="btn-continue">
                  {isAr ? 'التالي ←' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {/* 19. Available Funds */}
          {currentStep.id === 'fundsCAD' && (
            <div className="option-list">
              {[
                {
                  val: 26000,
                  labelAr: '25,000$ كندي فأكثر',
                  hintAr: 'يغطي شرط الدراسة (23,448$) وشرط Express Entry لعائلة.',
                  labelEn: '$25,000+ CAD',
                  hintEn: 'Covers 2026 Study Permit ($23,448) & family Express Entry.',
                },
                {
                  val: 16000,
                  labelAr: '15,500$ – 24,999$ كندي',
                  hintAr: 'يغطي شرط FSW لفرد واحد (15,263$).',
                  labelEn: '$15,500 – $24,999 CAD',
                  hintEn: 'Covers 2026 FSW single minimum ($15,263).',
                },
                {
                  val: 8000,
                  labelAr: '5,000$ – 15,499$ كندي',
                  hintAr: 'يكفي للزيارة أو برنامج الهجرة الأطلسي (3,815$+).',
                  labelEn: '$5,000 – $15,499 CAD',
                  hintEn: 'Sufficient for visitor or Atlantic Immigration ($3,815+).',
                },
                {
                  val: 2000,
                  labelAr: 'أقل من 5,000$ كندي',
                  hintAr: 'مسارات اللجوء وفئة الخبرة الكندية لا تشترط أموال استقرار.',
                  labelEn: 'Under $5,000 CAD',
                  hintEn: 'Refugee & CEC streams do not require settlement funds.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.fundsCAD === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('fundsCAD', opt.val),
                ),
              )}
            </div>
          )}

          {/* 20. Admissibility */}
          {currentStep.id === 'admissibility' && (
            <div className="option-list">
              {[
                {
                  val: 'none',
                  labelAr: 'سجل نظيف',
                  hintAr: 'لا توجد سوابق جنائية ولا أمراض خطيرة.',
                  labelEn: 'Clean record',
                  hintEn: 'No criminal record or serious medical conditions.',
                },
                {
                  val: 'has_issue',
                  labelAr: 'يوجد رفض سابق أو مشكلة جنائية/طبية',
                  hintAr: 'قد يتطلب تصريح إقامة مؤقت استثنائي (TRP) أو رد اعتبار.',
                  labelEn: 'Prior refusal or criminal/medical issue',
                  hintEn: 'May require TRP or rehabilitation.',
                },
              ].map((opt) => {
                const selected =
                  opt.val === 'none'
                    ? profile.criminality === 'none' && profile.medical === 'none'
                    : profile.criminality === 'minor' || profile.criminality === 'serious';
                return renderOptionWithBang(
                  opt.val,
                  selected,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => {
                    if (opt.val === 'none') {
                      onChangeProfile({
                        ...profile,
                        criminality: 'none',
                        medical: 'none',
                      });
                    } else {
                      onChangeProfile({
                        ...profile,
                        criminality: 'minor',
                      });
                    }
                    setTimeout(() => onViewResults(), 200);
                  },
                );
              })}
            </div>
          )}
        </div>

        <div className="step-card-footer">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStepIndex === 0}
            style={{
              background: 'none',
              border: 'none',
              color: currentStepIndex === 0 ? '#cbd5e1' : '#64748b',
              fontSize: 14.5,
              fontWeight: 700,
              cursor: currentStepIndex === 0 ? 'default' : 'pointer',
            }}
          >
            {isAr ? '→ السابق' : '← Back'}
          </button>

          <button
            type="button"
            onClick={goNext}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: 14.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {currentStepIndex === activeSteps.length - 1
              ? isAr
                ? 'النتائج ←'
                : 'Results →'
              : isAr
              ? 'التالي ←'
              : 'Next →'}
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <button
          type="button"
          onClick={onViewResults}
          className="btn-skip-colorful"
        >
          {isAr
            ? `تخطي كل الأسئلة (${totalMatches}) ⏭`
            : `Skip all questions (${totalMatches}) ⏭`}
        </button>
      </div>
    </div>
  );
};
