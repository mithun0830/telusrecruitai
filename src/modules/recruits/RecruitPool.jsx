import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheckCircle, faTimesCircle, faTimes as faClose, faUserGroup, faUser, faCalendarAlt, faSearch, faRobot } from '@fortawesome/free-solid-svg-icons';

const RecruitPool = () => {
  const [selectedJD, setSelectedJD] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [filteredJobDescriptions, setFilteredJobDescriptions] = useState([]);

  const jobDescriptions = [
    {
      id: 'JD_001',
      position: 'Senior React Developer',
      manager: 'Alice Johnson',
      requirements: [
        'Minimum 5 years of experience in React.js',
        'Strong understanding of Redux and state management',
        'Experience with Node.js and Express',
        'Knowledge of AWS services',
      ],
      candidates: [
        {
          id: 'CAN_001',
          name: 'John Smith',
          matchScore: 92,
          skills: ['React.js', 'Redux', 'Node.js', 'AWS', 'TypeScript'],
          experience: '7 years',
          status: 'Selected'
        },
        {
          id: 'CAN_002',
          name: 'Emily Brown',
          matchScore: 88,
          skills: ['React.js', 'Redux', 'MongoDB', 'Docker'],
          experience: '5 years',
          status: 'Under Review'
        }
      ]
    },
    {
      id: 'JD_002',
      position: 'UX Designer',
      manager: 'Bob Smith',
      requirements: [
        'Minimum 3 years of experience in UX Design',
        'Proficiency in Figma and Adobe XD',
        'Experience with user research and testing',
        'Portfolio demonstrating UI/UX projects',
      ],
      candidates: [
        {
          id: 'CAN_003',
          name: 'Sarah Wilson',
          matchScore: 95,
          skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research'],
          experience: '4 years',
          status: 'Selected'
        }
      ]
    }
  ];

  const managers = [...new Set(jobDescriptions.map(jd => jd.manager))];

  const interviewers = [
    { id: 'INT_001', name: 'Alice Johnson', role: 'Senior Developer', experience: '8 years' },
    { id: 'INT_002', name: 'Bob Smith', role: 'UX Designer', experience: '6 years' },
    { id: 'INT_003', name: 'Carol Williams', role: 'Project Manager', experience: '10 years' },
    { id: 'INT_004', name: 'David Brown', role: 'Data Scientist', experience: '7 years' },
  ];

  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [interviewDateTime, setInterviewDateTime] = useState('');

  const togglePanelist = (id) => {
    setSelectedPanelists(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(panelistId => panelistId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDateTimeChange = (e) => {
    setInterviewDateTime(e.target.value);
  };


  useEffect(() => {
    filterJobs();
  }, [searchTerm, selectedManager]);

  const filterJobs = () => {
    let filtered = jobDescriptions;
    
    if (searchTerm) {
      filtered = filtered.filter(jd => 
        jd.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedManager) {
      filtered = filtered.filter(jd => jd.manager === selectedManager);
    }
    
    setFilteredJobDescriptions(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleManagerSelect = (e) => {
    setSelectedManager(e.target.value);
  };

  const handleJDSelect = (jd) => {
    setSelectedJD(jd);
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Job Openings</h2>
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by job description"
              value={searchTerm}
              onChange={handleSearch}
            />
            <select
              className="form-select"
              value={selectedManager}
              onChange={handleManagerSelect}
              style={{ maxWidth: '200px' }}
            >
              <option value="">All Managers</option>
              {managers.map(manager => (
                <option key={manager} value={manager}>{manager}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Job Openings</h5>
            </div>
            <div className="list-group list-group-flush">
              {filteredJobDescriptions.map(jd => (
                <button
                  key={jd.id}
                  className={`list-group-item list-group-item-action ${selectedJD?.id === jd.id ? 'active' : ''}`}
                  onClick={() => handleJDSelect(jd)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{jd.position}</h6>
                      <small className="text-muted">ID: {jd.id}</small>
                      <small className="d-block text-muted">Manager: {jd.manager}</small>
                    </div>
                    <span className={`badge ${selectedJD?.id === jd.id ? 'bg-light text-primary' : 'bg-primary'} rounded-pill`}>
                      {jd.candidates.length} candidates
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          {selectedJD ? (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">{selectedJD.position} - Requirements & Candidates</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="mb-3">Requirements:</h6>
                  <ul className="list-unstyled">
                    {selectedJD.requirements.map((req, index) => (
                      <li key={index} className="mb-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <h6 className="mb-3">Candidates:</h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Match Score</th>
                        <th>Skills</th>
                        <th>Experience</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJD.candidates.map(candidate => (
                        <tr key={candidate.id}>
                          <td>{candidate.name}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className={`badge ${
                                candidate.matchScore >= 90 ? 'bg-success' :
                                candidate.matchScore >= 80 ? 'bg-primary' : 'bg-warning'
                              }`}>
                                {candidate.matchScore}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {candidate.skills.map((skill, index) => (
                                <span key={index} className="badge bg-light text-dark">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>{candidate.experience}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary px-2" 
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowPanel(true);
                              }}
                              style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
                            >
                              <FontAwesomeIcon icon={faRobot} className="me-1" />
                              Match Panelist
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted">
                <p>Select a job description to view requirements and candidates</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPanel && (
        <div className="right-panel">
          <div className="panel-header">
            <h3>Panelists for {selectedCandidate.name}</h3>
            <button className="btn btn-link" onClick={() => {
              setShowPanel(false);
              setSelectedCandidate(null);
            }}>
              <FontAwesomeIcon icon={faClose} />
            </button>
          </div>
          <div className="panel-content">
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </span>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={interviewDateTime}
                  onChange={handleDateTimeChange}
                  placeholder="Select Date and Time"
                />
              </div>
            </div>
            <div className="list-group">
              {interviewers.map((interviewer) => (
                <div key={interviewer.id} className="list-group-item p-2">
                  <div className="d-flex align-items-center">
                    <div className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`panelist-${interviewer.id}`}
                        checked={selectedPanelists.includes(interviewer.id)}
                        onChange={() => togglePanelist(interviewer.id)}
                      />
                    </div>
                    <div className="flex-shrink-0 me-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{interviewer.name}</h6>
                      <p className="mb-0 small">{interviewer.role} | {interviewer.experience}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="panel-footer mt-4 d-flex justify-content-end">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Implement interview creation logic
                  console.log('Creating interview with:', {
                    candidate: selectedCandidate,
                    panelists: selectedPanelists,
                    dateTime: interviewDateTime
                  });
                }}
                disabled={selectedPanelists.length === 0 || !interviewDateTime}
              >
                Create Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitPool;
