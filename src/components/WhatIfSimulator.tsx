import React, { useState } from 'react';
import type { Profile } from '../engine/types';
import { calculateCRS } from '../engine/crs';
import { evaluateAll } from '../engine/evaluate';

interface WhatIfSimulatorProps {
  baseProfile: Profile;
  onApplyProfile: (newProfile: Profile) => void;
  onViewResults: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseProfile,
  onApplyProfile,
  onViewResults,
}) => {
  const [simProfile, setSimProfile] = useState<Profile>({ ...baseProfile });

  const baseCrs = calculateCRS(baseProfile);
  const simCrs = calculateCRS(simProfile);
  const crsDiff = simCrs.total - baseCrs.total;

  const baseOutcomes = evaluateAll(baseProfile);
  const simOutcomes = evaluateAll(simProfile);

  const baseEligible = baseOutcomes.filter((o) => o.status === 'eligible').length;
  const simEligible = simOutcomes.filter((o) => o.status === 'eligible').length;
  const eligibleDiff = simEligible - baseEligible;

  return (
    <div className="container" style={{ padding: '24px 20px 80px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
          ⚡ "What-If" Odds Simulator
        </h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Experiment with how improving your language scores, gaining Canadian experience, or securing a job offer changes your Express Entry CRS points and unlocks new pathways.
        </p>
      </div>

      {/* Comparison Score Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>EXPRESS ENTRY CRS SCORE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#7c3aed' }}>
              {simCrs.total}
            </span>
            <span style={{ fontSize: 14, color: '#64748b' }}>
              (base: {baseCrs.total})
            </span>
            {crsDiff !== 0 && (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: crsDiff > 0 ? '#15803d' : '#b91c1c',
                }}
              >
                {crsDiff > 0 ? `+${crsDiff}` : crsDiff} pts
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Recent General Draw Cutoff: ~524 | French Category: ~420 | Trades: ~433
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>TOTAL QUALIFIED PATHWAYS</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#15803d' }}>
              {simEligible}
            </span>
            <span style={{ fontSize: 14, color: '#64748b' }}>
              (base: {baseEligible})
            </span>
            {eligibleDiff !== 0 && (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: eligibleDiff > 0 ? '#15803d' : '#b91c1c',
                }}
              >
                {eligibleDiff > 0 ? `+${eligibleDiff}` : eligibleDiff} programs!
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Direct pathways where you meet 100% of the requirements
          </div>
        </div>
      </div>

      {/* Simulator Interactive Levers */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>
          🎛️ Adjust Simulation Levers
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Lever 1: English CLB */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              English Proficiency (CLB {simProfile.englishCLB ?? 0}):
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[0, 4, 5, 6, 7, 8, 9, 10].map((clb) => (
                <button
                  key={clb}
                  type="button"
                  className={`chip ${simProfile.englishCLB === clb ? 'selected' : ''}`}
                  onClick={() => setSimProfile({ ...simProfile, englishCLB: clb })}
                  style={{ padding: '6px 12px' }}
                >
                  CLB {clb}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              💡 Reaching CLB 9 triggers massive Skill Transferability bonus points!
            </div>
          </div>

          {/* Lever 2: French CLB */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              French Proficiency (NCLC {simProfile.frenchCLB ?? 0}):
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[0, 4, 5, 7, 9].map((clb) => (
                <button
                  key={clb}
                  type="button"
                  className={`chip ${simProfile.frenchCLB === clb ? 'selected' : ''}`}
                  onClick={() => setSimProfile({ ...simProfile, frenchCLB: clb })}
                  style={{ padding: '6px 12px' }}
                >
                  {clb === 0 ? 'No French' : `NCLC ${clb}`}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              🌟 NCLC 7 unlocks up to +50 bonus points AND low-cutoff French draws (~420 CRS)!
            </div>
          </div>

          {/* Lever 3: Canadian Work Experience */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Canadian Skilled Work Experience:
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map((yrs) => (
                <button
                  key={yrs}
                  type="button"
                  className={`chip ${(simProfile.canadianExpYears ?? 0) === yrs ? 'selected' : ''}`}
                  onClick={() => setSimProfile({ ...simProfile, canadianExpYears: yrs })}
                  style={{ padding: '6px 12px' }}
                >
                  {yrs === 0 ? 'None' : `${yrs} yr${yrs > 1 ? 's' : ''}`}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Unlocks Canadian Experience Class (CEC) without needing proof of funds.
            </div>
          </div>

          {/* Lever 4: Canadian Job Offer */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Arranged Job Offer in Canada:
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={`chip ${simProfile.jobOffer === 'yes' ? 'selected' : ''}`}
                onClick={() =>
                  setSimProfile({
                    ...simProfile,
                    jobOffer: 'yes',
                    jobOfferFullTime: 'yes',
                    jobOfferType: 'lmia',
                  })
                }
              >
                Yes (Skilled / LMIA)
              </button>
              <button
                type="button"
                className={`chip ${simProfile.jobOffer !== 'yes' ? 'selected' : ''}`}
                onClick={() => setSimProfile({ ...simProfile, jobOffer: 'no' })}
              >
                No Job Offer
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Adds +50 CRS points and exempts you from settlement funds proof.
            </div>
          </div>

          {/* Lever 5: Sibling in Canada */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Brother or Sister in Canada (Citizen/PR):
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={`chip ${simProfile.relativesCitizenPR?.includes('sibling') ? 'selected' : ''}`}
                onClick={() => {
                  const currentRels = simProfile.relativesCitizenPR ?? [];
                  const next = currentRels.includes('sibling')
                    ? currentRels.filter((r) => r !== 'sibling')
                    : [...currentRels, 'sibling' as const];
                  setSimProfile({ ...simProfile, relativesCitizenPR: next });
                }}
              >
                {simProfile.relativesCitizenPR?.includes('sibling') ? '✅ Sibling in Canada' : 'No Sibling'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Awards +15 CRS points in Express Entry!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              onApplyProfile(simProfile);
              onViewResults();
            }}
            style={{
              padding: '10px 20px',
              background: '#15803d',
              color: 'white',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Apply These Simulated Changes & View Results →
          </button>

          <button
            onClick={() => setSimProfile({ ...baseProfile })}
            style={{
              padding: '10px 16px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              color: '#475569',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Reset to My Real Answers
          </button>
        </div>
      </div>
    </div>
  );
};
