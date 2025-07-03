import { useState, useMemo, useCallback } from 'react';

const useManagerCandidates = () => {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [collapsedFilters, setCollapsedFilters] = useState([]);
  const [candidates] = useState([
    { 
      id: 1, 
      name: 'John Smith', 
      avatar: '/images/avatars/avatar1.jpg',
      location: 'Los Angeles, CA',
      company: 'Chase',
      companyLogo: '/images/companies/chase.png',
      position: 'Lead Data Analysis Engineer', 
      experience: 10, 
      readiness: 5,
      score: 984 
    },
    { 
      id: 2, 
      name: 'Emma Johnson', 
      avatar: '/images/avatars/avatar2.jpg',
      location: 'Sacramento, CA',
      company: 'Dropbox',
      companyLogo: '/images/companies/dropbox.png',
      position: 'Lead Data Analysis Engineer', 
      experience: 8, 
      readiness: 4,
      score: 850 
    },
    { 
      id: 3, 
      name: 'Michael Brown', 
      avatar: '/images/avatars/avatar3.jpg',
      location: 'Los Angeles, CA',
      company: 'Nvidia',
      companyLogo: '/images/companies/nvidia.png',
      position: 'Data Analysis Engineer', 
      experience: 8, 
      readiness: 3,
      score: 784 
    },
    { 
      id: 4, 
      name: 'Olivia Davis', 
      avatar: '/images/avatars/avatar4.jpg',
      location: 'Los Angeles, CA',
      company: 'Microsoft',
      companyLogo: '/images/companies/microsoft.png',
      position: 'Senior Database Engineer', 
      experience: 7, 
      readiness: 4,
      score: 730 
    },
    { 
      id: 5, 
      name: 'William Wilson', 
      avatar: '/images/avatars/avatar5.jpg',
      location: 'San Francisco, CA',
      company: 'OpenAI',
      companyLogo: '/images/companies/openai.png',
      position: 'Data Analysis Engineer', 
      experience: 6, 
      readiness: 4,
      score: 572 
    },
    { 
      id: 6, 
      name: 'Sophia Martinez', 
      avatar: '/images/avatars/avatar6.jpg',
      location: 'San Diego, CA',
      company: 'Poe',
      companyLogo: '/images/companies/poe.png',
      position: 'Data Analysis Engineer', 
      experience: 6, 
      readiness: 4,
      score: 543 
    },
    { 
      id: 7, 
      name: 'David Anderson', 
      avatar: '/images/avatars/avatar7.jpg',
      location: 'San Jose, CA',
      company: 'Runway',
      companyLogo: '/images/companies/runway.png',
      position: 'Lead Data Engineer', 
      experience: 8, 
      readiness: 4,
      score: 590 
    },
    { 
      id: 8, 
      name: 'Ava Garcia', 
      avatar: '/images/avatars/avatar8.jpg',
      location: 'Fresno, CA',
      company: 'Nexer',
      companyLogo: '/images/companies/nexer.png',
      position: 'Data Analysis Engineer', 
      experience: 8, 
      readiness: 4,
      score: 482 
    },
    { 
      id: 9, 
      name: 'James Taylor', 
      avatar: '/images/avatars/avatar9.jpg',
      location: 'Long Beach, CA',
      company: 'Amazon',
      companyLogo: '/images/companies/amazon.png',
      position: 'Data Analysis Engineer', 
      experience: 9, 
      readiness: 4,
      score: 360 
    },
    { 
      id: 10, 
      name: 'Isabella Lopez', 
      avatar: '/images/avatars/avatar10.jpg',
      location: 'Oakland, CA',
      company: 'Capgemini',
      companyLogo: '/images/companies/capgemini.png',
      position: 'Data Platform Engineer', 
      experience: 5, 
      readiness: 4,
      score: 590 
    },
    { 
      id: 11, 
      name: 'Daniel Thomas', 
      avatar: '/images/avatars/avatar11.jpg',
      location: 'Bakersfield, CA',
      company: 'Oracle',
      companyLogo: '/images/companies/oracle.png',
      position: 'Product Data Science', 
      experience: 6, 
      readiness: 4,
      score: 562 
    },
    { 
      id: 12, 
      name: 'Mia Wright', 
      avatar: '/images/avatars/avatar12.jpg',
      location: 'San Francisco, CA',
      company: 'Shopify',
      companyLogo: '/images/companies/shopify.png',
      position: 'Data Engineer', 
      experience: 5, 
      readiness: 4,
      score: 556 
    },
    { 
      id: 13, 
      name: 'Robert Murphy', 
      avatar: '/images/avatars/avatar13.jpg',
      location: 'Santa Ana, CA',
      company: 'Snowflake',
      companyLogo: '/images/companies/snowflake.png',
      position: 'Data Analysis Engineer', 
      experience: 5, 
      readiness: 4,
      score: 549 
    },
    { 
      id: 14, 
      name: 'Charlotte Young', 
      avatar: '/images/avatars/avatar14.jpg',
      location: 'Riverside, CA',
      company: 'Google',
      companyLogo: '/images/companies/google.png',
      position: 'Core Data Analyst', 
      experience: 5, 
      readiness: 4,
      score: 461 
    },
  ]);

  const [filters, setFilters] = useState({
    search: '',
    aiSearch: '',
    jobTitle: '',
    hardSkills: [],
    softSkills: [],
    discipline: '',
    university: '',
    yearsOfExperience: { min: 4, max: 20 },
    location: ['California'],
    score: { min: 500, max: 1000 },
    readiness: { min: 4, max: 5 }
  });

  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const jobOptions = useMemo(() => {
    return [...new Set(candidates.map(candidate => candidate.position))];
  }, [candidates]);

  const handleAIToggle = useCallback(() => {
    setAiEnabled(prev => !prev);
  }, []);

  const handleFilterCollapse = useCallback((filterName) => {
    setCollapsedFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName) 
        : [...prev, filterName]
    );
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const handleRangeChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: {
        ...prev[filterName],
        min: value
      }
    }));
  }, []);

  const handleLocationTagClick = useCallback((location) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(l => l !== location)
        : [...prev.location, location]
    }));
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const searchMatch = 
        !filters.search || 
        candidate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.position.toLowerCase().includes(filters.search.toLowerCase());

      const jobMatch = !filters.job || candidate.position.includes(filters.job);

      const experienceMatch = 
        (!filters.yearsOfExperience.min || candidate.experience >= Number(filters.yearsOfExperience.min)) &&
        (!filters.yearsOfExperience.max || candidate.experience <= Number(filters.yearsOfExperience.max));

      const scoreMatch = 
        (!filters.score.min || candidate.score >= Number(filters.score.min)) &&
        (!filters.score.max || candidate.score <= Number(filters.score.max));

      return searchMatch && jobMatch && experienceMatch && scoreMatch;
    });
  }, [candidates, filters]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSearchChange = (event) => {
    setFilters(prev => ({ ...prev, search: event.target.value }));
  };

  return {
    candidates,
    filters,
    selectedCandidates,
    jobOptions,
    filteredCandidates,
    handleFilterChange,
    handleSelectAll,
    handleSelectCandidate,
    handleSearchChange,
    handleAIToggle,
    handleFilterCollapse,
    handleRangeChange,
    handleLocationTagClick,
    aiEnabled,
    collapsedFilters,
  };
};

export default useManagerCandidates;
