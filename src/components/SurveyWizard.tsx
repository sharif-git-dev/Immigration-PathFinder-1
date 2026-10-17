import React, { useState } from 'react';
import type { Profile } from '../engine/types';
import { SECTIONS, SURVEY_QUESTIONS, type SectionMeta } from '../survey/questions';
import { COUNTRIES } from '../data/countries';
import type { Question } from '../survey/types';

interface SurveyWizardProps {
  profile: Profile;
  onChangeProfile: (updated: Profile) => void;
  onViewResults: () => void;
  eligibleCount: number;
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  profile,
  onChangeProfile,
  onViewResults,
  eligibleCount,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = SECTIONS[currentSectionIndex];

  // Helper to update a field in profile
  const updateField = (field: keyof Profile, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  // Questions for current section that satisfy showIf
  const visibleQuestions = SURVEY_QUESTIONS.filter(
    (q) => q.section === currentSection.id && (!q.showIf || q.showIf(profile)),
  );

  return (
    <div className="container" style={{ padding: '24px 20px 100px' }}>
      {/* Section Progress Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 12,
          marginBottom: 20,
        }}
      >
        {SECTIONS.map((sec, idx) => {
          const isActive = idx === currentSectionIndex;
          const isDone = idx < currentSectionIndex;
          return (
            <button
              key={sec.id}
              onClick={() => setCurrentSectionIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: isActive ? '#c5221f' : isDone ? '#e2e8f0' : 'white',
                color: isActive ? 'white' : '#334155',
                border: isActive ? '1px solid #c5221f' : '1px solid #cbd5e1',
                boxShadow: isActive ? '0 2px 4px rgba(197,34,31,0.2)' : 'none',
              }}
            >
              <span>{sec.icon}</span>
              <span>
                {idx + 1}. {sec.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
          {currentSection.icon} {currentSection.title}
        </h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>{currentSection.description}</p>
      </div>

      {/* Question Cards */}
      <div>
        {visibleQuestions.map((q) => (
          <div key={q.id} className="survey-card">
            <h3 className="survey-question-title">{q.title}</h3>
            {q.help && <p className="survey-question-help">{q.help}</p>}

            {/* Single Select */}
            {q.type === 'single' && q.options && (
              <div className="chip-grid">
                {q.options.map((opt) => {
                  const currentValue = (profile as any)[q.id];
                  const isSelected = currentValue === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => updateField(q.id as keyof Profile, opt.value)}
                    >
                      <div>{opt.label}</div>
                      {opt.hint && <div className="chip-hint">{opt.hint}</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multi Select */}
            {q.type === 'multi' && q.options && (
              <div className="chip-grid">
                {q.options.map((opt) => {
                  const selectedArr: any[] = (profile as any)[q.id] ?? [];
                  const isSelected = selectedArr.includes(opt.value);

                  const handleToggle = () => {
                    let next: any[];
                    if (q.exclusive?.includes(opt.value)) {
                      // Exclusive option selected: clear all others
                      next = isSelected ? [] : [opt.value];
                    } else {
                      // Normal option: remove any exclusive ones
                      const filtered = selectedArr.filter((v) => !q.exclusive?.includes(v));
                      if (isSelected) {
                        next = filtered.filter((v) => v !== opt.value);
                      } else {
                        next = [...filtered, opt.value];
                      }
                    }
                    updateField(q.id as keyof Profile, next);
                  };

                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      onClick={handleToggle}
                    >
                      <div>{opt.label}</div>
                      {opt.hint && <div className="chip-hint">{opt.hint}</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Number Input */}
            {q.type === 'number' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                  onClick={() => {
                    const cur = Number((profile as any)[q.id] ?? (q.min ?? 0));
                    if (q.min === undefined || cur > q.min) {
                      updateField(q.id as keyof Profile, cur - 1);
                    }
                  }}
                >
                  -
                </button>

                <input
                  type="number"
                  min={q.min ?? 0}
                  max={q.max ?? 100}
                  value={(profile as any)[q.id] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    updateField(q.id as keyof Profile, val);
                  }}
                  style={{
                    width: 100,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                />

                <button
                  type="button"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                  onClick={() => {
                    const cur = Number((profile as any)[q.id] ?? (q.min ?? 0));
                    if (q.max === undefined || cur < q.max) {
                      updateField(q.id as keyof Profile, cur + 1);
                    }
                  }}
                >
                  +
                </button>
              </div>
            )}

            {/* Single Country Dropdown */}
            {q.type === 'country' && (
              <div style={{ marginTop: 8 }}>
                <select
                  value={(profile as any)[q.id] ?? ''}
                  onChange={(e) => updateField(q.id as keyof Profile, e.target.value || undefined)}
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    background: 'white',
                  }}
                >
                  <option value="">-- Select Country --</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} {c.code === 'SY' ? '🇸🇾' : c.code === 'TR' ? '🇹🇷' : c.code === 'CA' ? '🇨🇦' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Multiple Countries Selector */}
            {q.type === 'countries' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  {/* Quick popular chips */}
                  {['SY', 'TR', 'IN', 'PH', 'NG', 'US', 'FR', 'GB', 'CO', 'XX'].map((code) => {
                    const country = COUNTRIES.find((c) => c.code === code);
                    const selectedList: string[] = (profile as any)[q.id] ?? [];
                    const isSel = selectedList.includes(code);
                    if (!country) return null;
                    return (
                      <button
                        key={code}
                        type="button"
                        className={`chip ${isSel ? 'selected' : ''}`}
                        onClick={() => {
                          const next = isSel
                            ? selectedList.filter((c) => c !== code)
                            : [...selectedList, code];
                          updateField(q.id as keyof Profile, next);
                        }}
                      >
                        {country.name}
                      </button>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const selectedList: string[] = (profile as any)[q.id] ?? [];
                    if (!selectedList.includes(e.target.value)) {
                      updateField(q.id as keyof Profile, [...selectedList, e.target.value]);
                    }
                    e.target.value = '';
                  }}
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: 'white',
                  }}
                >
                  <option value="">+ Add any other country of citizenship...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Selected list */}
                {((profile as any)[q.id] ?? []).length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {((profile as any)[q.id] as string[]).map((code) => {
                      const name = COUNTRIES.find((c) => c.code === code)?.name ?? code;
                      return (
                        <span
                          key={code}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <strong>{name}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              const list: string[] = (profile as any)[q.id] ?? [];
                              updateField(
                                q.id as keyof Profile,
                                list.filter((c) => c !== code),
                              );
                            }}
                            style={{ color: '#ef4444', fontWeight: 800 }}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Canadian Province Selector */}
            {(q.type === 'province' || q.type === 'provinces') && (
              <div className="chip-grid">
                {[
                  { code: 'ON', name: 'Ontario' },
                  { code: 'BC', name: 'British Columbia' },
                  { code: 'AB', name: 'Alberta' },
                  { code: 'QC', name: 'Quebec' },
                  { code: 'MB', name: 'Manitoba' },
                  { code: 'SK', name: 'Saskatchewan' },
                  { code: 'NS', name: 'Nova Scotia' },
                  { code: 'NB', name: 'New Brunswick' },
                  { code: 'NL', name: 'Newfoundland & Labrador' },
                  { code: 'PE', name: 'Prince Edward Island' },
                ].map((prov) => {
                  const isMulti = q.type === 'provinces';
                  const currentVal = (profile as any)[q.id];
                  const isSelected = isMulti
                    ? (currentVal ?? []).includes(prov.code)
                    : currentVal === prov.code;

                  const handleClick = () => {
                    if (isMulti) {
                      const curArr: string[] = currentVal ?? [];
                      const next = isSelected
                        ? curArr.filter((c) => c !== prov.code)
                        : [...curArr, prov.code];
                      updateField(q.id as keyof Profile, next);
                    } else {
                      updateField(q.id as keyof Profile, prov.code);
                    }
                  };

                  return (
                    <button
                      key={prov.code}
                      type="button"
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      onClick={handleClick}
                    >
                      {prov.name} ({prov.code})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons between Sections */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <button
          type="button"
          disabled={currentSectionIndex === 0}
          onClick={() => setCurrentSectionIndex(currentSectionIndex - 1)}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: 'white',
            color: currentSectionIndex === 0 ? '#94a3b8' : '#334155',
            fontWeight: 700,
            cursor: currentSectionIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ← Previous Section
        </button>

        {currentSectionIndex < SECTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: '#2563eb',
              color: 'white',
              fontWeight: 700,
            }}
          >
            Next: {SECTIONS[currentSectionIndex + 1].title} →
          </button>
        ) : (
          <button
            type="button"
            onClick={onViewResults}
            style={{
              padding: '12px 28px',
              borderRadius: 8,
              background: '#15803d',
              color: 'white',
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            ✨ View All Matching Results →
          </button>
        )}
      </div>

      {/* Floating Bottom Bar with Live Counter */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(15, 23, 42, 0.95)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 9999,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          🎯 <strong>{eligibleCount}</strong> Programs You Currently Qualify For
        </span>
        <button
          onClick={onViewResults}
          style={{
            background: '#c5221f',
            color: 'white',
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          View Pathways & Official Links →
        </button>
      </div>
    </div>
  );
};
