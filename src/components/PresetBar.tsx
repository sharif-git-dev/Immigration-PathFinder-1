import React from 'react';
import { PRESET_PROFILES, type PresetProfile } from '../data/presets';
import type { Profile } from '../engine/types';

interface PresetBarProps {
  currentPresetId: string | null;
  onSelectPreset: (preset: PresetProfile) => void;
  onReset: () => void;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  currentPresetId,
  onSelectPreset,
  onReset,
}) => {
  return (
    <div className="preset-bar">
      <div className="container">
        <div className="preset-inner">
          <span className="preset-label">Test Scenarios:</span>
          {PRESET_PROFILES.map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                className={`preset-chip ${isActive ? 'active' : ''}`}
                onClick={() => onSelectPreset(preset)}
                title={preset.subtitle}
              >
                <span>{preset.badge === 'Special Case' ? '🛡️' : preset.badge === 'Express Entry' ? '🚀' : '👤'}</span>
                <span>{preset.title}</span>
              </button>
            );
          })}
          <button
            className="preset-chip"
            onClick={onReset}
            style={{ color: '#64748b', borderStyle: 'dashed' }}
            title="Clear all answers"
          >
            ↺ Reset Form
          </button>
        </div>
      </div>
    </div>
  );
};
