import React, { useState, useEffect } from 'react';
import type { Profile, Province } from '../engine/types';
import { COUNTRIES } from '../data/countries';
import { getCountryDisplayName, PROVINCE_AR } from '../data/arabicTranslations';
import { CountryFlag } from './CountryFlag';

interface StepSurveyProps {
  profile: Profile;
  onChangeProfile: (updated: Profile) => void;
  onViewResults: () => void;
  onFinishBasics?: () => void;
  onEditBasics?: () => void;
  mode?: 'basics' | 'country';
  totalMatches: number;
  lang: 'ar' | 'en';
}

interface StepConfig {
  id: string;
  phase: 'basics' | 'country';
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
  onFinishBasics,
  onEditBasics,
  mode = 'basics',
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

  const activeCountry = profile.activeCountry ?? 'CA';
  const isCA = activeCountry === 'CA';
  const isDE = activeCountry === 'DE';
  const isUS = activeCountry === 'US';

  const countryNameAr = isCA ? 'كندا' : isDE ? 'ألمانيا' : 'أمريكا';
  const countryNameEn = isCA ? 'Canada' : isDE ? 'Germany' : 'United States';

  // Reset step index to 0 when the user switches countries or switches between basics and country mode
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [activeCountry, mode]);

  const allSteps: StepConfig[] = [
    // ════════════════════════════════════════════════════════════════════════
    // PHASE 1: SHARED BASIC QUESTIONS (Used Across ALL Countries: CA, DE, US)
    // ════════════════════════════════════════════════════════════════════════
    {
      id: 'residenceCountry',
      phase: 'basics',
      titleAr: 'بلد الإقامة الحالي؟',
      subtitleAr: 'الدولة التي تتواجد فيها الآن فعلياً (تُستخدم لجميع الدول).',
      titleEn: 'Current country of residence?',
      subtitleEn: 'The country where you currently live (shared across all countries).',
    },
    {
      id: 'residenceStatus',
      phase: 'basics',
      titleAr: 'وضعك القانوني في بلد إقامتك؟',
      subtitleAr: 'يحدد مسارات السفارة أو إعادة التوطين المتاحة لك.',
      titleEn: 'Legal status in residence country?',
      subtitleEn: 'Determines embassy processing and protection eligibility.',
      showIf: (p) => p.residenceCountry !== undefined && p.residenceCountry !== 'CA',
    },
    {
      id: 'citizenships',
      phase: 'basics',
      titleAr: 'الجنسية؟',
      subtitleAr: 'يمكنك اختيار أكثر من جنسية (تُستخدم لجميع الدول).',
      titleEn: 'Citizenship?',
      subtitleEn: 'Select one or more (used across all countries).',
      isMulti: true,
    },
    {
      id: 'age',
      phase: 'basics',
      titleAr: 'العمر؟',
      subtitleAr: 'يُستخدم لحساب نقاط العمر في كندا (CRS) وألمانيا (Chancenkarte) وأمريكا.',
      titleEn: 'Age?',
      subtitleEn: 'Used to calculate age points across Canada (CRS), Germany (Chancenkarte), and the USA.',
    },
    {
      id: 'education',
      phase: 'basics',
      titleAr: 'المؤهل الدراسي؟',
      subtitleAr: 'أعلى شهادة تخرجت منها (تُستخدم لجميع الدول).',
      titleEn: 'Highest Education?',
      subtitleEn: 'Highest completed diploma or degree (shared across all countries).',
    },
    {
      id: 'englishCLB',
      phase: 'basics',
      titleAr: 'مستوى اللغة الإنجليزية (IELTS / CLB / CEFR)؟',
      subtitleAr: 'يُستخدم لكندا (CLB) وألمانيا (Chancenkarte B2/C1) وأمريكا (الدراسة والعمل).',
      titleEn: 'English Proficiency (IELTS / CLB / CEFR)?',
      subtitleEn: 'Used across Canada (CLB), Germany (Chancenkarte B2/C1), and the USA.',
    },
    {
      id: 'foreignExpYears',
      phase: 'basics',
      titleAr: 'سنوات الخبرة المهنية؟',
      subtitleAr: 'تُحتسب في نقاط كندا، ونقاط بطاقة الفرص الألمانية، والجرين كارد المهني الأمريكي.',
      titleEn: 'Skilled Work Experience?',
      subtitleEn: 'Counted for Canada CRS/FSW, Germany Chancenkarte, and US EB-2/EB-3.',
    },
    {
      id: 'occupationFields',
      phase: 'basics',
      titleAr: 'مجال المهنة؟',
      subtitleAr: 'يحدد المهن المطلوبة في كندا (Category Draws) وألمانيا (Mangelberufe) وأمريكا (STEM / Schedule A).',
      titleEn: 'Occupation Field?',
      subtitleEn: 'Identifies priority occupations in Canada, Germany (Mangelberufe), and USA (STEM / Schedule A).',
      isMulti: true,
    },
    {
      id: 'fearOfReturn',
      phase: 'basics',
      titleAr: 'حماية / لجوء؟',
      subtitleAr: 'لتقييم مسارات الحماية وإعادة التوطين أو اللجوء في الدولة التي تختارها.',
      titleEn: 'Refugee Protection / Asylum?',
      subtitleEn: 'Evaluates resettlement and asylum pathways in your chosen destination.',
    },
    {
      id: 'refugeeBackground',
      phase: 'basics',
      titleAr: 'وثائق الحماية والتسجيل؟',
      subtitleAr: 'اختر ما يتوفر لديك حالياً.',
      titleEn: 'Protection Documents?',
      subtitleEn: 'Select all that apply.',
      isMulti: true,
      showIf: (p) =>
        p.fearOfReturn === 'yes' ||
        p.residenceStatus === 'temporary_protection' ||
        p.residenceStatus === 'refugee_recognized',
    },
    {
      id: 'admissibility',
      phase: 'basics',
      titleAr: 'السجل الجنائي والهجرة؟',
      subtitleAr: 'شرط أساسي لجميع التأشيرات والإقامات الدائمة في كل الدول.',
      titleEn: 'Criminal & Immigration Record?',
      subtitleEn: 'Required for all visas and permanent residence pathways.',
    },

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 2: COUNTRY-SPECIFIC QUESTIONS (Asked After Selecting a Country)
    // ════════════════════════════════════════════════════════════════════════

    // ── CANADA ONLY (CA)
    {
      id: 'canadaStatus',
      phase: 'country',
      titleAr: 'وضعك القانوني داخل كندا؟',
      subtitleAr: 'نوع التصريح الحالي داخل كندا.',
      titleEn: 'Current status in Canada?',
      subtitleEn: 'Your current permit or legal status inside Canada.',
      showIf: (p) => isCA && p.residenceCountry === 'CA',
    },
    {
      id: 'canadianEducation',
      phase: 'country',
      titleAr: 'هل درست في كندا؟',
      subtitleAr: 'تمنحك +15 إلى +30 نقطة في CRS وتؤهلك لتصريح عمل الخريجين PGWP.',
      titleEn: 'Studied in Canada?',
      subtitleEn: 'Awards +15 to +30 CRS points and PGWP eligibility.',
      showIf: () => isCA,
    },
    {
      id: 'frenchCLB',
      phase: 'country',
      titleAr: 'الفرنسية لكندا (NCLC)؟',
      subtitleAr: 'مستوى 7+ يفتح سحوبات كندا الفرنسية بنقاط منخفضة (~400) ويمنح +50 نقطة إضافية.',
      titleEn: 'French Level for Canada (NCLC)?',
      subtitleEn: 'NCLC 7+ unlocks low-cutoff Canadian French draws (~400) and +50 CRS bonus pts.',
      showIf: () => isCA,
    },
    {
      id: 'canadianExpYears',
      phase: 'country',
      titleAr: 'الخبرة داخل كندا؟',
      subtitleAr: 'خبرة عمل بتصريح قانوني داخل كندا (تفتح فئة الخبرة الكندية CEC).',
      titleEn: 'Canadian Work Experience?',
      subtitleEn: 'Authorized skilled work inside Canada (unlocks Canadian Experience Class CEC).',
      showIf: () => isCA,
    },
    {
      id: 'jobOffer',
      phase: 'country',
      titleAr: 'عرض عمل رسمي في كندا؟',
      subtitleAr: 'مطلوب لتصاريح العمل وبرامج الأطلسي والريف والمقاطعات الكندية.',
      titleEn: 'Official Job Offer in Canada?',
      subtitleEn: 'Required for Canadian work permits, AIP, RCIP, and PNPs.',
      showIf: () => isCA,
    },
    {
      id: 'jobOfferProvince',
      phase: 'country',
      titleAr: 'مقاطعة العمل في كندا؟',
      titleEn: 'Canadian Job Province?',
      showIf: (p) => isCA && p.jobOffer === 'yes',
    },
    {
      id: 'relativesCitizenPR',
      phase: 'country',
      titleAr: 'أقارب في كندا (مواطن أو مقيم دائم)؟',
      subtitleAr: 'للكفالة العائلية، أو +15 نقطة للأخ/الأخت، أو السوبر فيزا للوالدين والأجداد.',
      titleEn: 'Relatives in Canada (Citizen or PR)?',
      subtitleEn: 'For family sponsorship, +15 CRS sibling points, or Parent/Grandparent Super Visa.',
      isMulti: true,
      showIf: () => isCA,
    },
    {
      id: 'relativesProvinces',
      phase: 'country',
      titleAr: 'مقاطعة الأقارب في كندا؟',
      titleEn: 'Relatives’ Province in Canada?',
      isMulti: true,
      showIf: (p) =>
        isCA &&
        p.relativesCitizenPR !== undefined &&
        p.relativesCitizenPR.length > 0,
    },
    {
      id: 'fundsCAD',
      phase: 'country',
      titleAr: 'المدخرات المتوفرة لكندا (بالدولار الكندي CAD)؟',
      subtitleAr: 'برنامج FSW يتطلب 15,263$ كندي للفرد، وتأشيرة الدراسة تتطلب 23,448$ كندي.',
      titleEn: 'Settlement Funds for Canada (in Canadian Dollars — CAD)?',
      subtitleEn: '2026 IRCC rules: $15,263 CAD for FSW (single), $23,448 CAD for Study Permit.',
      showIf: () => isCA,
    },

    // ── GERMANY ONLY (DE)
    {
      id: 'deDegreeRecognition',
      phase: 'country',
      titleAr: 'معادلة الشهادة في ألمانيا (ANABIN / ZAB)؟',
      subtitleAr: 'المعادلة الكاملة تؤهلك مباشرة لبطاقة الفرص، والمعادلة الجزئية تمنح +4 نقاط.',
      titleEn: 'German Credential Recognition (ANABIN / ZAB)?',
      subtitleEn: 'Full recognition unlocks Chancenkarte directly; partial recognition awards +4 pts.',
      showIf: () => isDE,
    },
    {
      id: 'germanLevel',
      phase: 'country',
      titleAr: 'مستوى اللغة الألمانية (CEFR)؟',
      subtitleAr: 'B2 يمنح +3 نقاط، B1 يمنح +2 نقطة ويفتح التدريب المهني Ausbildung، وA1 يكفي كشرط أساسي.',
      titleEn: 'German Language Level (CEFR)?',
      subtitleEn: 'B2 = +3 pts, B1 = +2 pts & Ausbildung, A2 = +1 pt, A1 = baseline.',
      showIf: () => isDE,
    },
    {
      id: 'deJobOfferType',
      phase: 'country',
      titleAr: 'عرض عمل أو عقد تدريب أو قبول جامعي في ألمانيا؟',
      subtitleAr: 'حدد نوع العقد إن وجد (أو اختر "لا يوجد" للبحث عن عمل عبر بطاقة الفرص Chancenkarte).',
      titleEn: 'German Job Offer, Ausbildung Contract, or University Admission?',
      subtitleEn: 'Select your offer type (or "None" to apply via the Opportunity Card Chancenkarte).',
      showIf: () => isDE,
    },
    {
      id: 'deRelatives',
      phase: 'country',
      titleAr: 'أقارب مقيمون في ألمانيا (لم الشمل العائلي §§ 27–36 AufenthG)؟',
      subtitleAr: 'ألمانيا تسمح بلم شمل الزوج/الزوجة والأطفال القصر، وكذلك والدي حاملي البطاقة الزرقاء والعمالة الماهرة الجدد.',
      titleEn: 'Family Members in Germany (Familiennachzug §§ 27–36 AufenthG)?',
      subtitleEn: 'Germany allows spouses, minor children, and parents of post-2024 Skilled Workers/Blue Card holders.',
      isMulti: true,
      showIf: () => isDE,
    },
    {
      id: 'deFundsEUR',
      phase: 'country',
      titleAr: 'القدرة المالية / الحساب المغلق في ألمانيا (باليورو € EUR)؟',
      subtitleAr: 'في 2026: بطاقة الفرص تتطلب 13,092€ (1,091€/شهرياً) والدراسة تتطلب 11,904€ (992€/شهرياً).',
      titleEn: 'Blocked Account (Sperrkonto) / Savings in Euros (€ EUR)?',
      subtitleEn: '2026 rules: €13,092/yr (€1,091/mo) for Chancenkarte; €11,904/yr (€992/mo) for Study Visa.',
      showIf: () => isDE,
    },

    // ── US ONLY (US)
    {
      id: 'usDvEligibleBirth',
      phase: 'country',
      titleAr: 'بلد الميلاد لقرعة اللوتري الأمريكية (DV Lottery)؟',
      subtitleAr: 'قرعة الـ 55,000 جرين كارد تعتمد على بلد الميلاد (أو بلد ميلاد الزوج/الزوجة) وليس الجنسية.',
      titleEn: 'Country of Birth for US DV Lottery?',
      subtitleEn: 'The 55,000 Green Card Lottery is based on country of birth (or spouse’s country of birth).',
      showIf: () => isUS,
    },
    {
      id: 'usExtraordinaryProfile',
      phase: 'country',
      titleAr: 'مؤهلات التقديم الذاتي والتميز المهني لأمريكا (EB-2 NIW / EB-1A / O-1)؟',
      subtitleAr: 'حدد أي ميزة تنطبق عليك للتقديم على الجرين كارد المباشر بدون كفيل أو تأشيرة O-1.',
      titleEn: 'US Self-Petition & Extraordinary Achievements (EB-2 NIW / EB-1A / O-1)?',
      subtitleEn: 'Select all that apply for self-petition Green Cards (no employer needed) or O-1.',
      isMulti: true,
      showIf: () => isUS,
    },
    {
      id: 'usJobOfferType',
      phase: 'country',
      titleAr: 'عرض عمل أو نقل شركة أو قبول جامعي في أمريكا؟',
      subtitleAr: 'الجامعات والمراكز البحثية معفاة من قرعة H-1B طوال العام (Cap-Exempt).',
      titleEn: 'US Job Offer, Multinational Transfer, or University Form I-20?',
      subtitleEn: 'US universities & research hospitals are 100% exempt from the H-1B lottery cap.',
      showIf: () => isUS,
    },
    {
      id: 'usRelatives',
      phase: 'country',
      titleAr: 'أقارب في الولايات المتحدة (كفالة الجرين كارد العائلي I-130 / K-1)؟',
      subtitleAr: 'الأقارب المباشرون لمواطن أمريكي (الزوج/الزوجة، الوالدان، والأطفال دون 21) لهم تأشيرات فورية غير محدودة.',
      titleEn: 'Family Members in the United States (Form I-130 / K-1)?',
      subtitleEn: 'Immediate Relatives of a US Citizen (Spouse, Parent, Unmarried Child <21) have NO quota backlog.',
      isMulti: true,
      showIf: () => isUS,
    },
    {
      id: 'usFundsUSD',
      phase: 'country',
      titleAr: 'المدخرات أو رأس مال الاستثمار في أمريكا (بالدولار الأمريكي $ USD)؟',
      subtitleAr: 'تأشيرة الدراسة F-1 تتطلب ~25,000$، وتأشيرة المستثمر E-2 ~100,000$+، والجرين كارد الاستثماري EB-5 800,000$.',
      titleEn: 'Available Funds / Investment Capital (in US Dollars — $ USD)?',
      subtitleEn: 'F-1 Study I-20 ~$25,000+; E-2 Treaty Investor ~$100,000+; EB-5 Green Card $800,000.',
      showIf: () => isUS,
    },
  ];

  const activeSteps = allSteps.filter(
    (step) => step.phase === mode && (!step.showIf || step.showIf(profile)),
  );
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
    } else if (mode === 'basics' && onFinishBasics) {
      onFinishBasics();
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
  const isLastStep = currentStepIndex === activeSteps.length - 1;
  const finalStepLabel =
    mode === 'basics'
      ? isAr
        ? 'اختر الدولة ←'
        : 'Select Country →'
      : isAr
      ? 'النتائج ←'
      : 'Results →';

  return (
    <div className="survey-wrapper">
      {/* Two-Phase Context Banner: Shared Basics vs. Country-Specific Questions */}
      {mode === 'basics' ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
            border: '1.5px solid #c7d2fe',
            borderRadius: 18,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <CountryFlag code="CA" size={14} />
                <CountryFlag code="DE" size={14} />
                <CountryFlag code="US" size={14} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 900, color: '#1e1b4b' }}>
                {isAr
                  ? 'المرحلة 1: الأسئلة الأساسية المشتركة لجميع الدول'
                  : 'Part 1: Shared Basic Questions (Used for All Countries)'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#3730a3', fontWeight: 600, marginTop: 4 }}>
              {isAr
                ? 'إجاباتك هنا (العمر، التعليم، الإنجليزية، الخبرة، الجنسية) تُحفظ وتُستخدم تلقائياً لكل الدول. بعد ذلك تختار الدولة للإجابة على أسئلتها الخاصة.'
                : 'Your answers here (age, education, English, work experience, nationality) are saved and reused across all countries. Next, you select a country for its specific questions.'}
            </div>
          </div>

          {onFinishBasics && (
            <button
              type="button"
              onClick={onFinishBasics}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: 999,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isAr ? 'اختر الدولة الآن ←' : 'Select Country Now →'}
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1.5px solid #86efac',
            borderRadius: 18,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <CountryFlag code={activeCountry} size={18} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: '#064e3b' }}>
                {isAr
                  ? `المرحلة 2: الأسئلة الخاصة بـ ${countryNameAr} فقط (${activeSteps.length} أسئلة)`
                  : `Part 2: ${countryNameEn}-Specific Questions (${activeSteps.length} questions)`}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#065f46', fontWeight: 700, marginTop: 4 }}>
              {isAr
                ? `✓ إجاباتك الأساسية المشتركة محفوظة ومُطبقة تلقائياً لجميع الدول! أجب الآن فقط عن المتغيرات الخاصة بـ ${countryNameAr}.`
                : `✓ Your shared basic answers are already saved and applied across all countries! Now answer only the questions specific to ${countryNameEn}.`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {onEditBasics && (
              <button
                type="button"
                onClick={onEditBasics}
                style={{
                  background: '#ffffff',
                  color: '#065f46',
                  border: '1.5px solid #6ee7b7',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isAr ? '✎ تعديل الأسئلة المشتركة' : '✎ Edit Shared Basics'}
              </button>
            )}
            {onFinishBasics && (
              <button
                type="button"
                onClick={onFinishBasics}
                style={{
                  background: '#065f46',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isAr ? '🌍 تغيير الدولة' : '🌍 Change Country'}
              </button>
            )}
          </div>
        </div>
      )}

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
          {isLastStep ? finalStepLabel : isAr ? 'التالي ←' : 'Next →'}
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

          {/* 8b. German Ability */}
          {currentStep.id === 'germanLevel' && (
            <div className="option-list">
              {[
                {
                  val: 0,
                  labelAr: 'لا أتحدث الألمانية (أعتمد على الإنجليزية)',
                  hintAr: 'يمكنك التقديم على البطاقة الزرقاء أو الدراسة بالإنجليزية أو بطاقة الفرص مع إنجليزي B2.',
                  labelEn: 'No German (English only)',
                  hintEn: 'Eligible for EU Blue Card, English degrees & Chancenkarte (with English B2).',
                },
                {
                  val: 4,
                  labelAr: 'متقدم فوق المتوسط (B2 أو C1/C2)',
                  hintAr: 'يمنح +3 نقاط كاملة في بطاقة الفرص الألمانية ويفتح جميع مسارات العمل والتمريض.',
                  labelEn: 'Upper-Intermediate / Advanced (B2 or C1+)',
                  hintEn: 'Awards max +3 Chancenkarte points & unlocks regulated professions.',
                },
                {
                  val: 3,
                  labelAr: 'متوسط (B1)',
                  hintAr: 'يمنح +2 نقطة في بطاقة الفرص، ويؤهلك للتدريب المهني المزدوج (Ausbildung) والجنسية الألمانية.',
                  labelEn: 'Intermediate (B1)',
                  hintEn: 'Awards +2 Chancenkarte points & qualifies for Ausbildung.',
                },
                {
                  val: 2,
                  labelAr: 'أساسي (A2)',
                  hintAr: 'يمنح +1 نقطة في بطاقة الفرص ويؤهلك لشراكة المعادلة المهنية (Anerkennungspartnerschaft).',
                  labelEn: 'Elementary (A2)',
                  hintEn: 'Awards +1 Chancenkarte point & qualifies for Recognition Partnership.',
                },
                {
                  val: 1,
                  labelAr: 'مبتدئ (A1)',
                  hintAr: 'يحقق الشرط الأساسي لبطاقة الفرص الألمانية ولم الشمل العائلي.',
                  labelEn: 'Beginner (A1)',
                  hintEn: 'Meets baseline language requirement for Chancenkarte & Family Visa.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  (profile.germanLevel ?? 0) === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('germanLevel', opt.val),
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

          {/* ── GERMANY ONLY: Credential Recognition (ANABIN / ZAB) */}
          {currentStep.id === 'deDegreeRecognition' && (
            <div className="option-list">
              {[
                {
                  val: 'full_anabin',
                  labelAr: 'معادلة كاملة في ألمانيا (أو مصنفة H+ ومطابقة في ANABIN)',
                  hintAr: 'تؤهلك مباشرة لبطاقة الفرص (Chancenkarte) والبطاقة الزرقاء بدون الحاجة لجمع 6 نقاط.',
                  labelEn: 'Fully Recognized in Germany (ANABIN H+ & Equivalent)',
                  hintEn: 'Qualifies directly for Chancenkarte & EU Blue Card without needing 6 points.',
                },
                {
                  val: 'partial_adaptation',
                  labelAr: 'معادلة جزئية تحتاج تدريب تكميلي (Defizitbescheid)',
                  hintAr: 'تمنحك +4 نقاط دفعة واحدة في بطاقة الفرص الألمانية وتؤهلك لشراكة المعادلة (§ 16d).',
                  labelEn: 'Partially Recognized (Needs Adaptation / Defizitbescheid)',
                  hintEn: 'Awards +4 points immediately on the Chancenkarte grid.',
                },
                {
                  val: 'home_recognized',
                  labelAr: 'شهادة جامعية أو دبلوم (سنتين+) معترف به في بلد الإصدار فقط',
                  hintAr: 'يفتح نظام النقاط لبطاقة الفرص الألمانية (6 نقاط) ومسار أصحاب الخبرة (§ 19c).',
                  labelEn: 'Recognized in Home Country (2+ Yr Diploma or Degree, not assessed in DE yet)',
                  hintEn: 'Unlocks the 6-point Chancenkarte grid and Experienced Worker visa.',
                },
                {
                  val: 'none',
                  labelAr: 'ثانوية عامة فقط / لا توجد شهادة جامعية أو مهنية',
                  hintAr: 'يمكنك التقديم على الدراسة الجامعية أو التدريب المهني المزدوج (Ausbildung).',
                  labelEn: 'High School Only / No Post-Secondary Diploma',
                  hintEn: 'Eligible for German University Study or paid Ausbildung vocational training.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.deDegreeRecognition === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('deDegreeRecognition', opt.val),
                ),
              )}
            </div>
          )}

          {/* ── GERMANY ONLY: German Job Offer / Ausbildung / University Admission */}
          {currentStep.id === 'deJobOfferType' && (
            <div className="option-list">
              {[
                {
                  val: 'none',
                  labelAr: 'لا يوجد عرض عمل حالياً (أرغب بالبحث عن عمل عبر بطاقة الفرص Chancenkarte)',
                  hintAr: 'بطاقة الفرص الألمانية لا تشترط أي عرض عمل مسبق.',
                  labelEn: 'No Job Offer Yet (Applying via Chancenkarte Job Seeker Visa)',
                  hintEn: 'The Opportunity Card does not require a job offer.',
                },
                {
                  val: 'shortage_it_45934',
                  labelAr: 'عرض عمل في مهنة مطلوبة / IT / خريج جديد براتب ≥ 45,934 يورو سنوياً',
                  hintAr: 'يؤهلك للبطاقة الزرقاء الأوروبية (EU Blue Card) لعام 2026.',
                  labelEn: 'Job Offer ≥ €45,934.20/yr (STEM, IT, Healthcare, or New Graduate)',
                  hintEn: 'Qualifies for the 2026 reduced-threshold EU Blue Card Germany.',
                },
                {
                  val: 'blue_card_50700',
                  labelAr: 'عرض عمل براتب ≥ 50,700 يورو سنوياً (أي تخصص جامعي)',
                  hintAr: 'يؤهلك للبطاقة الزرقاء الأوروبية القياسية لعام 2026 (إقامة دائمة خلال 21–27 شهراً).',
                  labelEn: 'Job Offer ≥ €50,700/yr (Standard EU Blue Card Threshold)',
                  hintEn: 'Qualifies for standard EU Blue Card (PR in 21–27 months).',
                },
                {
                  val: 'skilled_other',
                  labelAr: 'عرض عمل ماهر في ألمانيا (براتب أقل من حد البطاقة الزرقاء)',
                  hintAr: 'يؤهلك لتأشيرة العمالة الماهرة (§ 18a/18b) أو شراكة المعادلة (§ 16d).',
                  labelEn: 'Other Skilled Job Offer in Germany (Below Blue Card Salary)',
                  hintEn: 'Qualifies for Skilled Worker Visa (§ 18a/18b) or Recognition Partnership.',
                },
                {
                  val: 'ausbildung_contract',
                  labelAr: 'عقد تدريب مهني مزدوج مدفوع الأجر (Ausbildungsvertrag)',
                  hintAr: 'يؤهلك لتأشيرة التدريب المهني (§ 16a AufenthG).',
                  labelEn: 'Paid Vocational Training Contract (Ausbildungsvertrag)',
                  hintEn: 'Qualifies for the Ausbildung visa (§ 16a AufenthG).',
                },
                {
                  val: 'uni_admission',
                  labelAr: 'قبول جامعي من جامعة ألمانية (Zulassungsbescheid)',
                  hintAr: 'يؤهلك لتأشيرة الدراسة الجامعية في ألمانيا (§ 16b AufenthG).',
                  labelEn: 'German University Admission (Zulassungsbescheid)',
                  hintEn: 'Qualifies for the German Student Visa (§ 16b AufenthG).',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.deJobOfferType === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('deJobOfferType', opt.val),
                ),
              )}
            </div>
          )}

          {/* ── GERMANY ONLY: Family Members in Germany */}
          {currentStep.id === 'deRelatives' && (
            <div>
              <div className="option-list">
                {[
                  {
                    val: 'none',
                    labelAr: 'لا يوجد أقارب من الدرجة الأولى في ألمانيا',
                    labelEn: 'No nuclear family members in Germany',
                  },
                  {
                    val: 'spouse_partner',
                    labelAr: 'زوج / زوجة (أو شريك مسجل) مقيم قانونياً أو مواطن في ألمانيا',
                    hintAr: 'يؤهلك للم الشمل العائلي الفوري مع حق عمل مفتوح 100% (§§ 28–30 AufenthG).',
                    labelEn: 'Spouse / Registered Partner in Germany (Citizen, PR, Blue Card, or Skilled Worker)',
                    hintEn: 'Eligible for immediate Family Reunification with unrestricted work rights.',
                  },
                  {
                    val: 'minor_child_or_parent_of_minor',
                    labelAr: 'طفل قاصر في ألمانيا (أو والداي في ألمانيا وأنا دون 18 عاماً)',
                    hintAr: 'يؤهلك للم شمل الأسرة المباشر (§§ 28, 32, 36 AufenthG).',
                    labelEn: 'Minor Child in Germany (or Parent in Germany if you are under 18)',
                    hintEn: 'Eligible for direct nuclear family reunification.',
                  },
                  {
                    val: 'parent_of_skilled_worker',
                    labelAr: 'ابني / ابنتي في ألمانيا يحمل البطاقة الزرقاء أو إقامة عمالة ماهرة (صدرت بعد مارس 2024)',
                    hintAr: 'القانون الألماني الجديد (§ 36(3) AufenthG) يسمح باستقدام الوالدين ووالدي الزوج/الزوجة!',
                    labelEn: 'My Adult Child in Germany holds a post-March-2024 EU Blue Card or Skilled Worker Permit',
                    hintEn: 'New § 36(3) AufenthG allows skilled workers to sponsor their parents!',
                  },
                  {
                    val: 'other_relative',
                    labelAr: 'أخ / أخت / عم / خال / جد (درجة ثانية أو ثالثة)',
                    hintAr: 'تنبيه: ألمانيا لا تمنح إقامة لم شمل للأخوة أو الأجداد، لكن يمكنهم عمل كفالة مالية (Verpflichtungserklärung) للدراسة أو بطاقة الفرص.',
                    labelEn: 'Sibling / Grandparent / Uncle / Cousin in Germany',
                    hintEn: 'Note: Cannot sponsor family PR in Germany, but can sign a financial Verpflichtungserklärung for your Study or Chancenkarte visa.',
                  },
                ].map((opt) => {
                  const current = profile.deRelatives || [];
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
                        setField('deRelatives', []);
                      } else {
                        const updated = selected
                          ? current.filter((x) => (x as string) !== opt.val)
                          : [...current, opt.val as any];
                        setField('deRelatives', updated);
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

          {/* ── GERMANY ONLY: Blocked Account / Funds in EUR (€ EUR) */}
          {currentStep.id === 'deFundsEUR' && (
            <div className="option-list">
              {[
                {
                  val: 14000,
                  labelAr: '13,092 يورو فأكثر (أو كفيل رسمي Verpflichtungserklärung)',
                  hintAr: 'يغطي الحساب المغلق لبطاقة الفرص الألمانية 2026 (1,091 يورو/شهرياً) وتأشيرة الدراسة (11,904 يورو).',
                  labelEn: '€13,092+ EUR (or Formal Sponsor Verpflichtungserklärung)',
                  hintEn: 'Covers both 2026 Chancenkarte (€13,092/yr) and Study Visa (€11,904/yr) blocked accounts.',
                },
                {
                  val: 12000,
                  labelAr: '11,904 – 13,091 يورو',
                  hintAr: 'يغطي الحساب المغلق لتأشيرة الدراسة في ألمانيا لعام 2026 (992 يورو/شهرياً).',
                  labelEn: '€11,904 – €13,091 EUR',
                  hintEn: 'Covers the 2026 German Student Visa blocked account (€992/month).',
                },
                {
                  val: 6000,
                  labelAr: '5,000 – 11,900 يورو',
                  hintAr: 'تأشيرات العمل والبطاقة الزرقاء والتدريب المهني (Ausbildung) لا تتطلب حساباً مغلقاً لأن الراتب يغطي المعيشة.',
                  labelEn: '€5,000 – €11,900 EUR',
                  hintEn: 'Work visas, EU Blue Card, and Ausbildung do NOT require a blocked account.',
                },
                {
                  val: 1000,
                  labelAr: 'أقل من 5,000 يورو',
                  hintAr: 'مناسب لمن لديه عقد عمل أو عقد تدريب مهني مدفوع (Ausbildung) أو عقد عمل جزئي (20 ساعة/أسبوع).',
                  labelEn: 'Under €5,000 EUR',
                  hintEn: 'Suitable if you have a job offer, Ausbildung salary, or 20 hr/wk part-time contract.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.deFundsEUR === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('deFundsEUR', opt.val),
                ),
              )}
            </div>
          )}

          {/* ── US ONLY: DV Lottery Country of Birth */}
          {currentStep.id === 'usDvEligibleBirth' && (
            <div className="option-list">
              {[
                {
                  val: 'yes',
                  labelAr: 'نعم — ولدتُ (أو ولد زوجي/زوجتي) في دولة مؤهلة للوتري الأمريكي',
                  hintAr: 'جميع الدول العربية والشرق الأوسط (سوريا، الأردن، مصر، لبنان، العراق، السعودية، الإمارات، المغرب، الجزائر، تونس، السودان، اليمن، إلخ) وأوروبا وأفريقيا مؤهلة 100%.',
                  labelEn: 'Yes — Born in a DV-Eligible Country (or spouse born in an eligible country)',
                  hintEn: 'All Arab/MENA countries, Europe, Central Asia, and most of Africa are 100% eligible.',
                },
                {
                  val: 'no',
                  labelAr: 'لا — ولدتُ في دولة مستثناة من اللوتري (مثل كندا، الهند، الصين، المكسيك، الفلبين)',
                  hintAr: 'الدول التي أرسلت أكثر من 50,000 مهاجر لأمريكا خلال آخر 5 سنوات تُستثنى من القرعة.',
                  labelEn: 'No — Born in a high-admission excluded country (e.g., Canada, India, China, Mexico, Philippines)',
                  hintEn: 'Countries with >50,000 US immigrants in the past 5 years are excluded from DV Lottery.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.usDvEligibleBirth === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('usDvEligibleBirth', opt.val),
                ),
              )}
            </div>
          )}

          {/* ── US ONLY: Self-Petition & Extraordinary Achievements (EB-2 NIW / EB-1A / O-1) */}
          {currentStep.id === 'usExtraordinaryProfile' && (
            <div>
              <div className="option-list">
                {[
                  {
                    val: 'none',
                    labelAr: 'لا ينطبق / مسار عادي',
                    labelEn: 'None of these / Standard profile',
                  },
                  {
                    val: 'niw_endeavor',
                    labelAr: 'مشروع أو تخصص ذو أهمية وطنية لأمريكا (STEM، طب، ذكاء اصطناعي، طاقة، أبحاث، ريادة أعمال)',
                    hintAr: 'يفتح الجرين كارد المباشر EB-2 NIW بالتقديم الذاتي بدون الحاجة لصاحب عمل أمريكي!',
                    labelEn: 'Proposed Work/Project of National Importance to the US (STEM, Healthcare, AI, Research, Entrepreneurship)',
                    hintEn: 'Unlocks EB-2 NIW Self-Petition Green Card without needing a US employer!',
                  },
                  {
                    val: 'publications_citations',
                    labelAr: 'أبحاث علمية منشورة، اقتباسات (Citations)، أو تحكيم أعمال الآخرين (Peer Review)',
                    hintAr: 'قوي جداً لملفات EB-1A وEB-2 NIW وتأشيرة O-1.',
                    labelEn: 'Published Papers, Citations, or Peer-Review / Judging Others’ Work',
                    hintEn: 'Strong evidence for EB-1A, EB-2 NIW, and O-1A criteria.',
                  },
                  {
                    val: 'critical_role_high_salary',
                    labelAr: 'منصب قيادي/حيوي في شركة مرموقة أو شركة ناشئة، أو راتب مرتفع مقارنة بأقرانك',
                    hintAr: 'يحقق معيارين رئيسيين في الجرين كارد EB-1A وتأشيرة O-1.',
                    labelEn: 'Critical / Leading Role at a Distinguished Company/Startup OR High Remuneration',
                    hintEn: 'Satisfies key USCIS criteria for EB-1A and O-1.',
                  },
                  {
                    val: 'awards_media_judging',
                    labelAr: 'جوائز وطنية/دولية، تمويل استثماري (VC)، أو تغطية إعلامية بارزة لأعمالك',
                    hintAr: 'يدعم التقديم السريع خلال 15 يوم عمل على EB-1A وO-1.',
                    labelEn: 'National/International Awards, VC Funding, or Major Press/Media Coverage',
                    hintEn: 'Supports 15-day Premium Processing for EB-1A and O-1.',
                  },
                ].map((opt) => {
                  const current = profile.usExtraordinaryProfile || [];
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
                        setField('usExtraordinaryProfile', []);
                      } else {
                        const updated = selected
                          ? current.filter((x) => (x as string) !== opt.val)
                          : [...current, opt.val as any];
                        setField('usExtraordinaryProfile', updated);
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

          {/* ── US ONLY: US Job Offer / Multinational Transfer / Form I-20 */}
          {currentStep.id === 'usJobOfferType' && (
            <div className="option-list">
              {[
                {
                  val: 'none',
                  labelAr: 'لا يوجد عرض عمل أمريكي حالياً (أركز على التقديم الذاتي EB-2 NIW أو اللوتري أو العائلة أو الدراسة)',
                  labelEn: 'No US Job Offer Yet (Focusing on Self-Petition EB-2 NIW, DV Lottery, Family, or Study)',
                },
                {
                  val: 'h1b_cap',
                  labelAr: 'عرض عمل تخصصي من شركة أمريكية مستعدة لتسجيلي في قرعة H-1B',
                  hintAr: 'قرعة H-1B تجري في شهر مارس من كل عام لحاملي البكالوريوس فأعلى.',
                  labelEn: 'US Specialty Occupation Job Offer (H-1B Lottery Registration)',
                  hintEn: 'Annual H-1B electronic registration runs each March.',
                },
                {
                  val: 'cap_exempt_uni_nonprofit',
                  labelAr: 'عرض عمل من جامعة أمريكية أو مستشفى تعليمي أو مركز أبحاث غير ربحي (Cap-Exempt)',
                  hintAr: 'معفى 100% من قرعة H-1B ويمكن التقديم عليه في أي يوم من السنة، ويؤهل أيضاً لـ EB-1B!',
                  labelEn: 'Job Offer from a US University, Teaching Hospital, or Nonprofit Research Institute (Cap-Exempt)',
                  hintEn: '100% exempt from the H-1B lottery cap year-round & qualifies for EB-1B!',
                },
                {
                  val: 'l1_multinational',
                  labelAr: 'أعمل في شركة لها فرع/شركة شقيقة في أمريكا (أو أملك شركة وأريد فتح فرع أمريكي L-1A)',
                  hintAr: 'يؤهلك لتأشيرة النقل الداخلي L-1A/L-1B والجرين كارد المباشر للمديرين EB-1C بدون PERM!',
                  labelEn: 'Employed at a Multinational Company with a US Branch (or Opening a New US Office — L-1A/EB-1C)',
                  hintEn: 'Qualifies for L-1A/L-1B transfer and EB-1C Executive Green Card without PERM!',
                },
                {
                  val: 'perm_eb2_eb3',
                  labelAr: 'عرض عمل دائم من صاحب عمل أمريكي لكفالة الجرين كارد (EB-2 / EB-3 PERM أو ممرض Schedule A)',
                  hintAr: 'يؤهلك للجرين كارد الدائم عبر شهادة وزارة العمل PERM.',
                  labelEn: 'Permanent Full-Time US Job Offer for Green Card Sponsorship (EB-2 / EB-3 PERM or Schedule A Nurse)',
                  hintEn: 'Qualifies for employer-sponsored EB-2 / EB-3 Green Card.',
                },
                {
                  val: 'i20_ds2019_admission',
                  labelAr: 'قبول جامعي أمريكي (Form I-20 لتأشيرة F-1) أو قبول تبادل/إقامة طبية (DS-2019 لتأشيرة J-1)',
                  hintAr: 'يمنح خريجي تخصصات STEM تصريح عمل مفتوح لمدة 36 شهراً (3 سنوات) بعد التخرج.',
                  labelEn: 'US University Admission (Form I-20 for F-1) or Exchange/Medical Residency (Form DS-2019 for J-1)',
                  hintEn: 'STEM graduates receive 36 months (3 years) of OPT US work authorization.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  opt.val,
                  profile.usJobOfferType === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('usJobOfferType', opt.val),
                ),
              )}
            </div>
          )}

          {/* ── US ONLY: Family Members in the United States */}
          {currentStep.id === 'usRelatives' && (
            <div>
              <div className="option-list">
                {[
                  {
                    val: 'none',
                    labelAr: 'لا يوجد أقارب مباشرون في الولايات المتحدة',
                    hintAr: 'ملاحظة: الأجداد والأعمام والأخوال وأبناء العم لا يحق لهم كفالة الجرين كارد في القانون الأمريكي.',
                    labelEn: 'No qualifying US Citizen or Green Card relatives',
                    hintEn: 'Note: Grandparents, uncles, aunts, and cousins cannot sponsor a US Green Card.',
                  },
                  {
                    val: 'usc_spouse_fiance',
                    labelAr: 'زوج / زوجة أو خطيب(ة) يحمل الجنسية الأمريكية (US Citizen)',
                    hintAr: 'فئة الأقارب المباشرين (Immediate Relative / K-1) — تأشيرات فورية غير محدودة بدون طابور انتظار!',
                    labelEn: 'Spouse or Fiancé(e) is a U.S. Citizen',
                    hintEn: 'Immediate Relative (I-130) or K-1 Fiancé(e) — UNLIMITED visas with no quota backlog!',
                  },
                  {
                    val: 'usc_child_21plus',
                    labelAr: 'ابن / ابنة يحمل الجنسية الأمريكية وعمره 21 سنة فأكثر',
                    hintAr: 'يحق للابن الأمريكي البالغ (21+) كفالة والديه فوراً كأقارب مباشرين بدون طابور انتظار سنوي!',
                    labelEn: 'My Child is a U.S. Citizen age 21 or older',
                    hintEn: 'Parents of US Citizens (21+) are Immediate Relatives — no annual visa cap!',
                  },
                  {
                    val: 'usc_parent_under21',
                    labelAr: 'أب / أم يحمل الجنسية الأمريكية (وأنا غير متزوج وعمري أقل من 21 سنة)',
                    hintAr: 'فئة الأقارب المباشرين (IR-2) — بدون طابور انتظار (وقد تستحق الجنسية المباشرة N-600).',
                    labelEn: 'My Parent is a U.S. Citizen (and I am unmarried under age 21)',
                    hintEn: 'Immediate Relative (IR-2) — unlimited visas with no backlog.',
                  },
                  {
                    val: 'lpr_spouse_or_unmarried_child',
                    labelAr: 'زوج / زوجة أو أب / أم يحمل الجرين كارد الأمريكي (Lawful Permanent Resident)',
                    hintAr: 'فئة الأفضلية العائلية F2A / F2B (للزوج/الزوجة والأبناء غير المتزوجين فقط).',
                    labelEn: 'Spouse or Parent is a U.S. Green Card Holder (for Spouse or Unmarried Child)',
                    hintEn: 'Qualifies under Family Preference F2A / F2B.',
                  },
                  {
                    val: 'usc_sibling_or_adult_child',
                    labelAr: 'أخ / أخت يحمل الجنسية الأمريكية (أو أب/أم أمريكي وأنا فوق 21 سنة أو متزوج)',
                    hintAr: 'فئات الأفضلية العائلية F1 / F3 / F4 (متاحة رسمياً عبر نموذج I-130 وتخضع لطابور النشرة الشهرية).',
                    labelEn: 'Sibling is a U.S. Citizen (or Parent is a U.S. Citizen and I am 21+ or married)',
                    hintEn: 'Qualifies under Family Preference F1 / F3 / F4 (subject to Visa Bulletin wait times).',
                  },
                ].map((opt) => {
                  const current = profile.usRelatives || [];
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
                        setField('usRelatives', []);
                      } else {
                        const updated = selected
                          ? current.filter((x) => (x as string) !== opt.val)
                          : [...current, opt.val as any];
                        setField('usRelatives', updated);
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

          {/* ── US ONLY: Available Funds / Investment Capital in USD ($ USD) */}
          {currentStep.id === 'usFundsUSD' && (
            <div className="option-list">
              {[
                {
                  val: 850000,
                  labelAr: '800,000$ دولار أمريكي فأكثر',
                  hintAr: 'يؤهلك مباشرة للجرين كارد الاستثماري الأمريكي (EB-5 Rural/TEA) لجميع الجنسيات!',
                  labelEn: '$800,000+ USD',
                  hintEn: 'Qualifies directly for the US EB-5 Immigrant Investor Green Card ($800k TEA)!',
                },
                {
                  val: 120000,
                  labelAr: '100,000$ – 799,000$ دولار أمريكي',
                  hintAr: 'يؤهلك لتأشيرة المستثمر التجاري (E-2 Treaty Investor) لمواطني دول المعاهدة وتأشيرة الدراسة F-1.',
                  labelEn: '$100,000 – $799,000 USD',
                  hintEn: 'Meets typical E-2 Treaty Investor business capital (~$100k+) & F-1 Study proof of funds.',
                },
                {
                  val: 30000,
                  labelAr: '25,000$ – 99,000$ دولار أمريكي (أو منحة جامعية / كفيل عائلي)',
                  hintAr: 'يغطي إثبات القدرة المالية للسنة الأولى في نموذج I-20 لتأشيرة الدراسة F-1.',
                  labelEn: '$25,000 – $99,000 USD (or Scholarship / Family Sponsor)',
                  hintEn: 'Covers typical first-year Form I-20 financial proof for F-1 Student Visas.',
                },
                {
                  val: 5000,
                  labelAr: 'أقل من 25,000$ دولار أمريكي',
                  hintAr: 'مسارات اللوتري (DV Lottery) والعمل (H-1B / EB-2 NIW / EB-3) ولم الشمل واللجوء لا تشترط رأس مال.',
                  labelEn: 'Under $25,000 USD',
                  hintEn: 'DV Lottery, EB-2 NIW, H-1B, EB-3, Family, and Asylum do NOT require investment capital.',
                },
              ].map((opt) =>
                renderOptionWithBang(
                  String(opt.val),
                  profile.usFundsUSD === opt.val,
                  isAr ? opt.labelAr : opt.labelEn,
                  isAr ? opt.hintAr : opt.hintEn,
                  () => handleSingleSelect('usFundsUSD', opt.val),
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
                    setTimeout(() => goNext(), 200);
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
            {isLastStep ? finalStepLabel : isAr ? 'التالي ←' : 'Next →'}
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
            ? `تخطي كل الأسئلة للنتائج (${totalMatches}) ⏭`
            : `Skip all questions to results (${totalMatches}) ⏭`}
        </button>
      </div>
    </div>
  );
};
