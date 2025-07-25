import React from 'react';
import './Loader.css';

const Loader = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
    </div>
  );
};

export default Loader;
