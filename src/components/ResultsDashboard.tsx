import React, { useState } from 'react';
import type { Outcome } from '../engine/evaluate';
import type { Category, Status } from '../engine/types';
import { CATEGORY_LABEL } from '../engine/evaluate';
import { ProgramCard } from './ProgramCard';

interface ResultsDashboardProps {
  outcomes: Outcome[];
  onOpenSurvey: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  outcomes,
  onOpenSurvey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const eligibleCount = outcomes.filter((o) => o.status === 'eligible').length;
  const possibleCount = outcomes.filter((o) => o.status === 'possible').length;
  const closeCount = outcomes.filter((o) => o.status === 'close').length;
  const notEligibleCount = outcomes.filter((o) => o.status === 'not_eligible').length;

  const filteredOutcomes = outcomes.filter((o) => {
    // Search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchName = o.program.name.toLowerCase().includes(q);
      const matchSummary = o.program.summary.toLowerCase().includes(q);
      const matchCategory = o.program.category.toLowerCase().includes(q);
      if (!matchName && !matchSummary && !matchCategory) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && o.program.category !== selectedCategory) {
      return false;
    }

    // Status filter
    if (selectedStatus === 'qualified_only' && o.status !== 'eligible') {
      return false;
    }
    if (selectedStatus === 'qualified_or_possible' && o.status !== 'eligible' && o.status !== 'possible') {
      return false;
    }
    if (selectedStatus === 'close' && o.status !== 'close') {
      return false;
    }

    return true;
  });

  const categories: Category[] = [
    'express_entry',
    'provincial',
    'economic',
    'family',
    'refugee',
    'humanitarian',
    'work',
    'study',
    'visit',
    'citizenship',
  ];

  return (
    <div className="container" style={{ padding: '24px 20px 60px' }}>
      {/* Top Banner Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'qualified_only' ? 'all' : 'qualified_only')}
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: selectedStatus === 'qualified_only' ? '0 0 0 2px #15803d' : 'none',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
            ✅ You Qualify
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#15803d' }}>{eligibleCount}</div>
          <div style={{ fontSize: 12, color: '#166534' }}>Programs you meet all rules for</div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'qualified_or_possible' ? 'all' : 'qualified_or_possible')}
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: selectedStatus === 'qualified_or_possible' ? '0 0 0 2px #1d4ed8' : 'none',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
            🟡 You May Qualify
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1d4ed8' }}>{possibleCount}</div>
          <div style={{ fontSize: 12, color: '#1e40af' }}>Pending unanswered details</div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'close' ? 'all' : 'close')}
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: selectedStatus === 'close' ? '0 0 0 2px #b45309' : 'none',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
            🟠 Close (Fixable Gaps)
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#b45309' }}>{closeCount}</div>
          <div style={{ fontSize: 12, color: '#92400e' }}>1–2 steps away (e.g. test score)</div>
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            📚 Evaluated Programs
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#334155' }}>{outcomes.length}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Across all Canadian streams</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="🔍 Search programs, provinces, or keywords (e.g. Turkey, relatives, French, tech, caregiver)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={onOpenSurvey}
            style={{
              padding: '10px 16px',
              background: '#c5221f',
              color: 'white',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✏️ Edit Survey Answers
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginRight: 4 }}>
            CATEGORY:
          </span>
          <button
            className={`preset-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories ({outcomes.length})
          </button>
          {categories.map((cat) => {
            const count = outcomes.filter((o) => o.program.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                className={`preset-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {CATEGORY_LABEL[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Cards List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            Showing {filteredOutcomes.length} Matching Pathways
          </h2>
          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}
            >
              Reset all filters
            </button>
          )}
        </div>

        {filteredOutcomes.length === 0 ? (
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              No programs match the selected filters
            </div>
            <div style={{ fontSize: 14 }}>Try clearing search keywords or selecting "All Categories".</div>
          </div>
        ) : (
          filteredOutcomes.map((outcome) => (
            <ProgramCard key={outcome.program.id} outcome={outcome} />
          ))
        )}
      </div>
    </div>
  );
};
