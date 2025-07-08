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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const {
    filters,
    selectedCandidates,
    handleFilterChange,
    handleSelectCandidate,
  } = useManagerCandidates();

  const handleMoreOptionsClick = (candidateId) => {
    setActiveDropdown(activeDropdown === candidateId ? null : candidateId);
  };

  const handleViewClick = (candidate) => {
    setExpandedCandidate(expandedCandidate?.resume.id === candidate.resume.id ? null : candidate);
    setActiveDropdown(null);
  };

  const renderExpandedView = (candidate) => {
    if (!candidate) return null;

    return (
      <div className="expanded-view">
        <div className="expanded-content">
          <div className="content-section">
            <h4>Executive Summary</h4>
            <p>{candidate.analysis.executiveSummary}</p>
          </div>

          <div className="content-section">
            <h4>Key Strengths</h4>
            <div className="strengths-grid">
              {candidate.analysis.keyStrengths.map((strength, index) => (
                <div key={index} className="strength-card">
                  <h5>{strength.strength}</h5>
                  <p>{strength.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h4>Areas for Improvement</h4>
            <div className="improvement-grid">
              {candidate.analysis.improvementAreas.map((area, index) => (
                <div key={index} className="improvement-card">
                  <h5>{area.gap}</h5>
                  <p>{area.suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h4>Category Scores</h4>
            <div className="scores-grid">
              {Object.entries(candidate.analysis.categoryScores).map(([category, score]) => (
                <div key={category} className="score-card">
                  <div className="score-label">{category.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${score}%` }}></div>
                  </div>
                  <div className="score-number">{score}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h4>Recommendation</h4>
            <div className="recommendation-card">
              <div className="recommendation-type">{candidate.analysis.recommendation.type}</div>
              <p>{candidate.analysis.recommendation.reason}</p>
            </div>
          </div>

          <div className="content-section resume-full-text">
            <h4>Resume</h4>
            <div className="resume-text-card">
              <div className="resume-body">
                {candidate.resume.fullText.split('\n\n').map((section, index) => {
                  const lines = section.split('\n').map(line => line.trim()).filter(line => line !== '');
                  const title = lines[0];
                  const content = lines.slice(1);
                  return (
                    <div key={index} className="resume-section">
                      <h3>{title}</h3>
                      {content.map((line, lineIndex) => (
                        <p key={lineIndex}>{line}</p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearchClick = async (e) => {
    // Prevent any event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any previous error
    setSearchError("");

    // Check if any filter is selected
    const isAnyFilterSelected =
      filters.aiSearch ||
      filters.jobTitle ||
      filters.hardSkills ||
      filters.yearsOfExperience !== "" ||
      filters.score !== "";

    if (!isAnyFilterSelected) {
      setSearchError("Please select at least one filter criteria before searching.");
      return;
    }

    setIsLoading(true);
    const searchString = `${filters.aiSearch || ''}, Job Title: ${filters.jobTitle || ''}, Hard Skill: ${filters.hardSkills || ''}, Years of Experience: ${filters.yearsOfExperience} and Score: ${filters.score}`;
    console.log("searchString", searchString)
    try {
      const response = await candidateService.searchCandidates(searchString);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        console.error('Search failed:', response.message);
      }
    } catch (error) {
      console.error('Error during search:', error);
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
        <div className="filters-section horizontal">
          <div className="filters-container" onClick={(e) => e.currentTarget.classList.add('expanded')}>
            <div className="ai-search-container">
              <input
                type="text"
                placeholder="Search Candidate: E.g., Data Engineers with 4+ years..."
                className="ai-search-input"
                value={filters.aiSearch}
                onChange={(e) => handleFilterChange('aiSearch', e.target.value)}
                onFocus={(e) => e.currentTarget.closest('.filters-container').classList.add('expanded')}
              />
            </div>
            <div className="filter-divider"></div>
            {(
              <>
                <div className="filter-group">
                  <div className="filter-group-content">
                    <select
                      className="filter-select"
                      value={filters.jobTitle}
                      onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
                    >
                      <option value="">Select Job Title</option>
                      {['React Developer', 'DevOps Engineer', 'Mobile App Developer', 'HR Manager', 'SQL Developer', 'Data Engineer', 'GenAI Engineer'].map((job) => (
                        <option key={job} value={job}>{job}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="filter-divider"></div>
                <div className="filter-group">
                  <div className="filter-group-content">
                    <select
                      className="filter-select"
                      value={filters.hardSkills[0] || ''}
                      onChange={(e) => handleFilterChange('hardSkills', [e.target.value])}
                    >
                      <option value="">Select Hard Skill</option>
                      {['GitHub', 'AWS', 'Rust', 'Flutter', 'SQL', 'Hadoop', 'GenAI', 'RedShift'].map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="filter-divider"></div>
                <div className="filter-group">
                  <div className="filter-group-content">
                    <select
                      className="filter-select"
                      value={filters.yearsOfExperience[0] || ''}
                      onChange={(e) => handleFilterChange('yearsOfExperience', [e.target.value])}
                    >
                      <option value="">Select Experience</option>
                      {['0-2 years', '2-4 years', '4-6 years', '6-8 years', '8-10 years', '10-12 years', '12-14 years', '14-16 years', '16-18 years', '18-20 years'].map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="filter-divider"></div>
                <div className="filter-group">
                  <div className="filter-group-content">
                    <input
                      type="text"
                      placeholder="Enter score"
                      className="filter-input"
                      value={filters.score}
                      onChange={(e) => handleFilterChange('score', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="filter-group search-button-container">
              <button
                className="search-button"
                onClick={handleSearchClick}
                aria-label="Search candidates"
              >
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>
        <div className="candidates-list">
          <div className="candidates-list-header">
            <h2>Candidates <span className="candidate-count">{isLoading ? '...' : searchResults.length}</span></h2>
            <div className="header-actions">
            </div>
          </div>
          {searchError && (
            <div className="error-message" style={{ color: '#dc3545', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
              {searchError}
            </div>
          )}
          <div className="candidates-table-container">
            {isLoading ? (
              <div style={loaderContainerStyle}>
                <div style={loaderStyle}></div>
                <span style={loaderTextStyle}>Searching for candidates...</span>
              </div>
            ) : searchResults.length > 0 ? (
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
                  {searchResults.map((candidate) => (
                    <React.Fragment key={candidate.resume.id}>
                      <tr className={expandedCandidate?.resume.id === candidate.resume.id ? 'expanded' : ''}>
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
                        <td>{candidate.resume.fullText.match(/(\d+)\+ years/)?.[1] || 'N/A'} yrs</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="score-cell">{candidate.score}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="dropdown">
                            <button
                              className="btn-more"
                              title="More options"
                              onClick={() => handleMoreOptionsClick(candidate.resume.id)}
                            >
                              ⋮
                            </button>
                            {activeDropdown === candidate.resume.id && (
                              <div className="dropdown-content">
                                <button onClick={() => handleViewClick(candidate)}>Detailed View</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedCandidate?.resume.id === candidate.resume.id && (
                        <tr className="expanded-row">
                          <td colSpan="7">
                            {renderExpandedView(expandedCandidate)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-candidates-message">
                <div>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#4B286D" strokeWidth="2" />
                    <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#4B286D" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 4L23 8M23 4L19 8" stroke="#4B286D" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div>No Candidate found matching your search criteria.</div>
                </div>
              </div>
            )}
          </div>
          <div className="candidates-footer">
            <div className="selection-info">
              Selected: <span className="selected-count">{selectedCandidates.length}</span>
            </div>
            <div className="footer-actions">
              <button className="btn-action secondary">Shortlist</button>
              <button className="btn-action tertiary">Compare</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCandidates;
