import React from 'react';

export type TabId = 'survey' | 'results' | 'whatif';

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  eligibleCount: number;
  possibleCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  eligibleCount,
  possibleCount,
}) => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-inner">
          <div className="logo-area">
            <span className="logo-maple" role="img" aria-label="Canada maple leaf">
              🍁
            </span>
            <div>
              <div className="logo-title">Canada PathFinder</div>
              <div className="logo-subtitle">
                Independent, Official Rules-Based Pathway Advisor
              </div>
            </div>
          </div>

          <div className="privacy-pill">
            <span>🔒</span>
            <span>100% Offline & Private • No AI • No Data Leaves Your Machine</span>
          </div>

          <nav className="nav-tabs" aria-label="Navigation">
            <button
              className={`nav-tab ${activeTab === 'survey' ? 'active' : ''}`}
              onClick={() => setActiveTab('survey')}
            >
              📝 Survey Wizard
            </button>
            <button
              className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              📊 Results ({eligibleCount + possibleCount} Matches)
            </button>
            <button
              className={`nav-tab ${activeTab === 'whatif' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatif')}
            >
              ⚡ What-If Simulator
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
