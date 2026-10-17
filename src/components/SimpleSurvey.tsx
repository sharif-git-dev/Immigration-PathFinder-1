import React from 'react';
import type { Profile } from '../engine/types';
import { SECTIONS, SURVEY_QUESTIONS } from '../survey/questions';
import { COUNTRIES } from '../data/countries';

interface SimpleSurveyProps {
  profile: Profile;
  onChangeProfile: (updated: Profile) => void;
  onViewResults: () => void;
  totalMatches: number;
}

export const SimpleSurvey: React.FC<SimpleSurveyProps> = ({
  profile,
  onChangeProfile,
  onViewResults,
  totalMatches,
}) => {
  const updateField = (field: keyof Profile, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  return (
    <div className="container" style={{ padding: '16px 16px 80px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Profile Questionnaire</h2>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
            Fill in your details below to evaluate matches against all Canadian pathways.
          </div>
        </div>

        <button
          onClick={onViewResults}
          style={{
            padding: '8px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          View Matching Pathways ({totalMatches}) →
        </button>
      </div>

      {SECTIONS.map((sec) => {
        const visibleQuestions = SURVEY_QUESTIONS.filter(
          (q) => q.section === sec.id && (!q.showIf || q.showIf(profile)),
        );

        if (visibleQuestions.length === 0) return null;

        return (
          <div key={sec.id} className="survey-section">
            <h3 className="survey-section-title">
              {sec.icon} {sec.title}
            </h3>

            {visibleQuestions.map((q) => {
              const currentValue = (profile as any)[q.id];

              return (
                <div key={q.id} className="form-group">
                  <label className="form-label">{q.title}</label>
                  {q.help && <div className="form-hint">{q.help}</div>}

                  {/* Single Choice Radio List */}
                  {q.type === 'single' && q.options && (
                    <div className="options-vertical">
                      {q.options.map((opt) => (
                        <label key={String(opt.value)} className="radio-row">
                          <input
                            type="radio"
                            name={q.id}
                            value={String(opt.value)}
                            checked={currentValue === opt.value}
                            onChange={() => updateField(q.id as keyof Profile, opt.value)}
                          />
                          <div>
                            <div>{opt.label}</div>
                            {opt.hint && (
                              <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                                {opt.hint}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Multi Choice Checkbox List */}
                  {q.type === 'multi' && q.options && (
                    <div className="options-vertical">
                      {q.options.map((opt) => {
                        const selectedArr: any[] = currentValue ?? [];
                        const isChecked = selectedArr.includes(opt.value);

                        const handleToggle = () => {
                          let next: any[];
                          if (q.exclusive?.includes(opt.value)) {
                            next = isChecked ? [] : [opt.value];
                          } else {
                            const withoutExclusive = selectedArr.filter(
                              (v) => !q.exclusive?.includes(v),
                            );
                            if (isChecked) {
                              next = withoutExclusive.filter((v) => v !== opt.value);
                            } else {
                              next = [...withoutExclusive, opt.value];
                            }
                          }
                          updateField(q.id as keyof Profile, next);
                        };

                        return (
                          <label key={String(opt.value)} className="radio-row">
                            <input
                              type="checkbox"
                              name={q.id}
                              value={String(opt.value)}
                              checked={isChecked}
                              onChange={handleToggle}
                            />
                            <div>
                              <div>{opt.label}</div>
                              {opt.hint && (
                                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                                  {opt.hint}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Number Input */}
                  {q.type === 'number' && (
                    <div style={{ marginTop: 4 }}>
                      <input
                        type="number"
                        min={q.min ?? 0}
                        max={q.max ?? 100}
                        value={currentValue ?? ''}
                        onChange={(e) =>
                          updateField(
                            q.id as keyof Profile,
                            e.target.value === '' ? undefined : Number(e.target.value),
                          )
                        }
                        style={{
                          width: 120,
                          padding: '6px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          fontSize: 14,
                        }}
                      />
                    </div>
                  )}

                  {/* Single Country Dropdown */}
                  {q.type === 'country' && (
                    <div style={{ marginTop: 4 }}>
                      <select
                        value={currentValue ?? ''}
                        onChange={(e) =>
                          updateField(q.id as keyof Profile, e.target.value || undefined)
                        }
                        style={{
                          width: '100%',
                          maxWidth: 360,
                          padding: '6px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          fontSize: 13,
                          background: 'white',
                        }}
                      >
                        <option value="">-- Select Country --</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Multi Countries */}
                  {q.type === 'countries' && (
                    <div style={{ marginTop: 4 }}>
                      <select
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const list: string[] = currentValue ?? [];
                          if (!list.includes(e.target.value)) {
                            updateField(q.id as keyof Profile, [...list, e.target.value]);
                          }
                          e.target.value = '';
                        }}
                        style={{
                          width: '100%',
                          maxWidth: 360,
                          padding: '6px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          fontSize: 13,
                          background: 'white',
                          marginBottom: 6,
                        }}
                      >
                        <option value="">+ Add country of citizenship...</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {((currentValue as string[]) ?? []).length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {(currentValue as string[]).map((code) => {
                            const name = COUNTRIES.find((c) => c.code === code)?.name ?? code;
                            return (
                              <span
                                key={code}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: 4,
                                  padding: '3px 8px',
                                  fontSize: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                {name}
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateField(
                                      q.id as keyof Profile,
                                      (currentValue as string[]).filter((c) => c !== code),
                                    )
                                  }
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#b91c1c',
                                    fontWeight: 700,
                                  }}
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

                  {/* Province Selector */}
                  {(q.type === 'province' || q.type === 'provinces') && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {[
                        { code: 'ON', name: 'Ontario' },
                        { code: 'BC', name: 'British Columbia' },
                        { code: 'AB', name: 'Alberta' },
                        { code: 'QC', name: 'Quebec' },
                        { code: 'MB', name: 'Manitoba' },
                        { code: 'SK', name: 'Saskatchewan' },
                        { code: 'NS', name: 'Nova Scotia' },
                        { code: 'NB', name: 'New Brunswick' },
                        { code: 'NL', name: 'Newfoundland' },
                        { code: 'PE', name: 'PEI' },
                      ].map((prov) => {
                        const isMulti = q.type === 'provinces';
                        const isSel = isMulti
                          ? (currentValue ?? []).includes(prov.code)
                          : currentValue === prov.code;

                        const toggle = () => {
                          if (isMulti) {
                            const cur: string[] = currentValue ?? [];
                            const next = isSel
                              ? cur.filter((c) => c !== prov.code)
                              : [...cur, prov.code];
                            updateField(q.id as keyof Profile, next);
                          } else {
                            updateField(q.id as keyof Profile, prov.code);
                          }
                        };

                        return (
                          <button
                            key={prov.code}
                            type="button"
                            onClick={toggle}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 4,
                              border: isSel ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                              background: isSel ? '#fef2f2' : 'white',
                              color: isSel ? 'var(--primary)' : 'var(--text-main)',
                              fontWeight: isSel ? 700 : 500,
                              fontSize: 12,
                            }}
                          >
                            {prov.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={onViewResults}
          style={{
            padding: '10px 24px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          View Matching Pathways ({totalMatches}) →
        </button>
      </div>
    </div>
  );
};
