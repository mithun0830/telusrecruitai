import React, { useState } from 'react';
import './ManagerCandidates.css';
import useManagerCandidates from './useManagerCandidates';
import dummyData from './DummyList';
import { candidateService } from '../../services/api';

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
    handleLocationTagClick,
    collapsedFilters,
    aiEnabled,
  } = useManagerCandidates();

  const [searchResults, setSearchResults] = useState([]);

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
    }
  };

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
            <h2>Candidates <span className="candidate-count">{searchResults.length || dummyData.length}</span></h2>
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
                <th>Phone</th>
                <th>Skill Set</th>
                <th>Exp.</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(searchResults.length > 0 ? searchResults : dummyData).map((candidate) => (
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
