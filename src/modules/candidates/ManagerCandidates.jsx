import React from 'react';
import './ManagerCandidates.css';
import useManagerCandidates from './useManagerCandidates';

const ManagerCandidates = () => {
  const {
    filters,
    selectedCandidates,
    openFilter,
    jobOptions,
    filteredCandidates,
    toggleFilter,
    handleFilterChange,
    handleSelectAll,
    handleSelectCandidate,
    handleSearchChange,
    handleAIToggle,
    handleFilterCollapse,
    handleRangeChange,
    handleLocationTagClick,
    collapsedFilters,
    aiEnabled,
  } = useManagerCandidates();

  return (
    <div className="candidates-page">
      <div className="candidates-header">
        <h1>Manager Candidates</h1>
      </div>
      <div className="candidates-content">
        <div className="filters-section">
          <div className="filters-header">
            <h2>Filters</h2>
            <div className="filters-actions">
              <button className="filter-action-btn" title="Add Filter">+</button>
              <button className="filter-action-btn" title="Reset Filters">⟳</button>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('ai') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('ai')}>AI Search</h3>
            <div className="filter-group-content">
              <div className="ai-search-container">
                <input
                  type="text"
                  placeholder="E.g., Data Engineers with 4+ years..."
                  className="ai-search-input"
                  value={filters.aiSearch}
                  onChange={(e) => handleFilterChange('aiSearch', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('jobTitle') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('jobTitle')}>Job Title</h3>
            <div className="filter-group-content">
              <select 
                className="filter-select"
                value={filters.jobTitle}
                onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
              >
                <option value="">Select Job Title</option>
                {jobOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('hardSkills') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('hardSkills')}>Hard Skills</h3>
            <div className="filter-group-content">
              <div className="skills-tags">
                {['GitHub', 'AWS', 'Rust', 'Flutter', 'SQL', 'Hadoop', 'GenAI', 'RedShift'].map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
                <span className="skill-tag add-skill" title="Add Skill">+</span>
              </div>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('softSkills') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('softSkills')}>Soft Skills</h3>
            <div className="filter-group-content">
              <div className="skills-tags">
                {['Problem-Solving', 'Leadership', 'Communication', 'Teamwork'].map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
                <span className="skill-tag add-skill" title="Add Skill">+</span>
              </div>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('discipline') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('discipline')}>Discipline</h3>
            <div className="filter-group-content">
              <select 
                className="filter-select"
                value={filters.discipline}
                onChange={(e) => handleFilterChange('discipline', e.target.value)}
              >
                <option value="">Select Discipline</option>
                <option value="data-science">Data Science</option>
                <option value="data-engineering">Data Engineering</option>
                <option value="data-analysis">Data Analysis</option>
              </select>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('university') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('university')}>University</h3>
            <div className="filter-group-content">
              <select 
                className="filter-select"
                value={filters.university}
                onChange={(e) => handleFilterChange('university', e.target.value)}
              >
                <option value="">Select University</option>
                <option value="stanford">Stanford University</option>
                <option value="berkeley">UC Berkeley</option>
                <option value="mit">MIT</option>
              </select>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('experience') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('experience')}>Years of Experience</h3>
            <div className="filter-group-content">
              <div className="range-values">
                <span>4 yr.</span>
                <span>Max</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min="0" 
                max="20" 
                value={filters.yearsOfExperience.min}
                onChange={(e) => handleRangeChange('yearsOfExperience', e.target.value)}
              />
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('location') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('location')}>Location</h3>
            <div className="filter-group-content">
              <div className="location-tags">
                {['California', 'New York', 'Texas'].map((location) => (
                  <span 
                    key={location}
                    className={`location-tag ${filters.location.includes(location) ? 'active' : ''}`}
                    onClick={() => handleLocationTagClick(location)}
                  >
                    {location}
                  </span>
                ))}
                <span className="location-tag add-skill" title="Add Location">+</span>
              </div>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('score') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('score')}>Score</h3>
            <div className="filter-group-content">
              <div className="range-values">
                <span>500</span>
                <span>Max</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min="0" 
                max="1000" 
                value={filters.score.min}
                onChange={(e) => handleRangeChange('score', e.target.value)}
              />
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('readiness') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('readiness')}>Readiness</h3>
            <div className="filter-group-content">
              <div className="range-values">
                <span>4</span>
                <span>Max</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min="0" 
                max="5" 
                value={filters.readiness.min}
                onChange={(e) => handleRangeChange('readiness', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="candidates-list">
          <div className="candidates-list-header">
            <h2>Candidates <span className="candidate-count">{filteredCandidates.length}</span></h2>
            <div className="header-actions">
              <input 
                type="text" 
                placeholder="Search candidates" 
                className="search-input" 
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="candidates-table-container">
            <table className="candidates-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Location</th>
                <th>Current Job</th>
                <th>Exp.</th>
                <th>Ready</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => handleSelectCandidate(candidate.id)}
                  />
                </td>
                <td>
                  <div className="candidate-name">
                    <div className="candidate-avatar">{candidate.name.charAt(0).toUpperCase()}</div>
                    <span>{candidate.name}</span>
                  </div>
                </td>
                <td><span className="candidate-location">{candidate.location}</span></td>
                <td>
                  <div className="current-job">
                    <div className="company-logo">{candidate.company?.charAt(0).toUpperCase() || 'C'}</div>
                    <span>{candidate.position}</span>
                  </div>
                </td>
                <td style={{textAlign: 'center'}}>{candidate.experience} yrs</td>
                <td>
                  <div className="readiness-indicator" style={{width: `${candidate.readiness * 20}%`}} title={`${candidate.readiness}/5`}></div>
                </td>
                <td style={{textAlign: 'center'}}>
                  <span className="score-cell">{candidate.score}</span>
                </td>
                <td style={{textAlign: 'center'}}>
                  <button className="btn-more" title="More options">⋮</button>
                </td>
              </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div className="candidates-footer">
            <div className="selection-info">
              Selected: <span className="selected-count">{selectedCandidates.length}</span>
            </div>
            <div className="footer-actions">
              <button className="btn-action primary">Contact Selected</button>
              <button className="btn-action secondary">Move To Project</button>
              <button className="btn-action secondary">Compare</button>
              <button className="btn-action tertiary">Export CSV</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCandidates;
