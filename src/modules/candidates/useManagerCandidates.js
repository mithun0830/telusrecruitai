import { useState, useMemo, useCallback } from 'react';

const useManagerCandidates = () => {

  const [filters, setFilters] = useState({
    search: '',
    aiSearch: '',
    jobTitle: '',
    hardSkills: [],
    yearsOfExperience: [],
    score: '',
  });

  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSelectCandidate = (id) => {
    console.log('Toggling candidate selection:', id);
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  return {
    filters,
    selectedCandidates,
    handleFilterChange,
    handleSelectCandidate,
  };
};

export default useManagerCandidates;
