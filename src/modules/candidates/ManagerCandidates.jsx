import React, { useState } from 'react';
import './ManagerCandidates.css';
import useManagerCandidates from './useManagerCandidates';
import { candidateService } from '../../services/api';

const loaderStyle = {
  width: '50px',
  height: '50px',
  border: '3px solid #4B286D',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const loaderContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '300px',
  flexDirection: 'column',
  gap: '20px',
};

const loaderTextStyle = {
  color: '#4B286D',
  fontSize: '18px',
};

const ManagerCandidates = () => {
  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
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
    handleLocationTagClick,
    collapsedFilters,
    aiEnabled,
  } = useManagerCandidates();

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedJobTitle, setSelectedJobTitle] = React.useState("");
  const [selectedHardSkills, setSelectedHardSkills] = React.useState([]);
  const [sliderValues, setSliderValues] = React.useState({
    experience: "4",
    score: "50"
  });

  const handleStaticRangeChange = (type) => (event) => {
    setSliderValues(prev => ({
      ...prev,
      [type]: event.target.value
    }));
  };

  const handleSkillClick = (skill) => {
    setSelectedHardSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSearchClick = async () => {
    setIsLoading(true);
    const searchString = `${filters.aiSearch || ''}, Job Title: ${selectedJobTitle || ''}, Hard Skills: ${selectedHardSkills.join(', ')}, Years of Experience: ${sliderValues.experience} and Score: ${sliderValues.score}`;
    try {
      const response = await candidateService.searchCandidates(searchString);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        console.error('Search failed:', response.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error during search:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="candidates-page">
      <style>{spinKeyframes}</style>
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
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              >
                <option value="">Select Job Title</option>
                <option value="software-engineer">Software Engineer</option>
                <option value="data-scientist">Data Scientist</option>
                <option value="product-manager">Product Manager</option>
                <option value="ux-designer">UX Designer</option>
              </select>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('hardSkills') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('hardSkills')}>Hard Skills</h3>
            <div className="filter-group-content">
              <div className="skills-tags">
                {['GitHub', 'AWS', 'Rust', 'Flutter', 'SQL', 'Hadoop', 'GenAI', 'RedShift'].map((skill) => (
                  <span 
                    key={skill} 
                    className={`skill-tag ${selectedHardSkills.includes(skill) ? 'active' : ''}`}
                    onClick={() => handleSkillClick(skill)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedHardSkills.includes(skill) ? '#4B286D' : undefined,
                      color: selectedHardSkills.includes(skill) ? 'white' : undefined
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('experience') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('experience')}>Years of Experience</h3>
            <div className="filter-group-content">
              <div className="range-values">
                <span>{sliderValues.experience} yr.</span>
                <span>20 yrs.</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min="0" 
                max="20" 
                defaultValue="4"
                onChange={handleStaticRangeChange('experience')}
                value={sliderValues.experience}
              />
            </div>
          </div>
          <div className={`filter-group ${collapsedFilters.includes('score') ? 'collapsed' : ''}`}>
            <h3 onClick={() => handleFilterCollapse('score')}>Score</h3>
            <div className="filter-group-content">
              <div className="range-values">
                <span>{sliderValues.score}</span>
                <span>100</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min="0" 
                max="100" 
                defaultValue="50"
                onChange={handleStaticRangeChange('score')}
                value={sliderValues.score}
              />
            </div>
          </div>
          <div className="filter-search-button">
            <button 
              className="btn-action secondary"
              onClick={handleSearchClick}
              disabled={isLoading}
              style={{ 
                width: '100%',
                transition: 'transform 0.1s ease',
                ':active': {
                  transform: 'scale(0.95)'
                }
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Search Candidates
            </button>
          </div>
        </div>
        <div className="candidates-list">
          <div className="candidates-list-header">
            <h2>Candidates <span className="candidate-count">{isLoading ? '...' : searchResults.length}</span></h2>
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
            {isLoading ? (
              <div style={loaderContainerStyle}>
                <div style={loaderStyle}></div>
                <span style={loaderTextStyle}>Searching for candidates...</span>
              </div>
            ) : (
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Skill Set</th>
                    <th>Exp.</th>
                    <th>Score</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.length > 0 ? (
                    searchResults.map((candidate) => (
                  <tr key={candidate.resume.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.resume.id)}
                        onChange={() => handleSelectCandidate(candidate.resume.id)}
                      />
                    </td>
                    <td>
                      <div className="candidate-name">
                        <div className="candidate-avatar">{candidate.resume.name.charAt(0).toUpperCase()}</div>
                        <span>{candidate.resume.name}</span>
                      </div>
                    </td>
                    <td><div className="candidate-name"><span>{candidate.resume.phoneNumber}</span></div></td>
                    <td><div className="candidate-name"><span>{candidate.analysis.keyStrengths[0].strength}</span></div></td>
                    <td style={{textAlign: 'center'}}><div className="candidate-name"><span>{candidate.resume.fullText.match(/(\d+)\+ years/)?.[1] || 'N/A'} yrs</span></div></td>
                    <td style={{textAlign: 'center'}}>
                      <span className="score-cell">{candidate.score}</span>
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <button className="btn-more" title="More options">⋮</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '10px',
                      color: '#4B286D'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#4B286D" strokeWidth="2"/>
                        <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#4B286D" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M19 4L23 8M23 4L19 8" stroke="#4B286D" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      No Candidate found matching your search criteria.
                    </div>
                  </td>
                </tr>
                  )}
                </tbody>
              </table>
            )}
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
