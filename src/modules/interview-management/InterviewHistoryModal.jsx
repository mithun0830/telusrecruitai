import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InterviewHistoryModal.css';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(new Date(2023, 0, 1, hour, minute, 0, 0));
    }
  }
  return slots;
};

const InterviewHistoryModal = ({ isOpen, onClose, candidateHistory }) => {
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [duration, setDuration] = useState('30');
  const [showSlots, setShowSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!isOpen || !candidateHistory) return null;

  const { history, candidateName, jobTitle, jobDepartment } = candidateHistory;

  console.log('Candidate Info:', { candidateName, jobTitle, jobDepartment });

  const interviewers = [
    'interviewer1@example.com',
    'interviewer2@example.com',
    'interviewer3@example.com'
  ];

  const handleDateTimeSelect = (dateTime) => {
    setSelectedDateTime(dateTime);
  };

  const handleCalendarOpen = () => {
    setIsCalendarOpen(true);
  };

  const handleCalendarClose = () => {
    setIsCalendarOpen(false);
  };

  const handleOkClick = () => {
    setIsCalendarOpen(false);
  };

  const handleFindSlots = () => {
    // In a real application, this would typically involve an API call
    // For this example, we'll generate some dummy slots
    const dummySlots = [
      "11:00 AM - 12:00 PM",
      "12:00 PM - 1:00 PM",
      "1:00 PM - 2:00 PM",
      "2:00 PM - 3:00 PM",
      "3:00 PM - 4:00 PM",
      "4:00 PM - 5:00 PM",
      "5:00 PM - 6:00 PM",
      "6:00 PM - 7:00 PM",
      "7:00 PM - 8:00 PM",
      "8:00 PM - 9:00 PM",
      "9:00 PM - 10:00 PM",
      "10:00 PM - 11:00 PM"
    ];
    setAvailableSlots(dummySlots);
    setShowSlots(true);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSchedule = () => {
    if (selectedInterviewer && selectedDateTime) {
      console.log('Scheduled:', { selectedInterviewer, selectedDateTime });
      // Here you would typically make an API call to save the scheduled interview
      onClose();
    } else {
      alert('Please select an interviewer and a date/time');
    }
  };

  return (
    isOpen && candidateHistory && (
      <div className="modal-overlay">
        <div className="modal-content">
        <div className="modal-left">
          <h2>Schedule Interview</h2>
          <div className="schedule-form">
            <label>
              Select Interviewer:
              <select 
                value={selectedInterviewer} 
                onChange={(e) => setSelectedInterviewer(e.target.value)}
              >
                <option value="">Select an interviewer</option>
                {interviewers.map((interviewer, index) => (
                  <option key={index} value={interviewer}>{interviewer}</option>
                ))}
              </select>
            </label>
            <div className="datetime-duration-container">
              <label className="datetime-label">
                Select Date and Time:
              <DatePicker
                selected={selectedDateTime}
                onChange={handleDateTimeSelect}
                showTimeSelect
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                open={isCalendarOpen}
                onCalendarOpen={handleCalendarOpen}
                onCalendarClose={handleCalendarClose}
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled
                }) => (
                  <div className="custom-header">
                    <button onClick={() => setSelectedDateTime(new Date())} className="home-button">
                      <i className="fas fa-home"></i>
                    </button>
                    <div className="month-year-selector">
                      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <span className="month-year">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
                renderCustomFooter={() => (
                  <div className="custom-footer">
                    <button onClick={handleOkClick} className="ok-button">
                      OK
                    </button>
                  </div>
                )}
              />
              </label>
              <div className="duration-find-slots-container">
                <label className="duration-label">
                  Duration:
                  <div className="react-datepicker-wrapper">
                    <div className="react-datepicker__input-container">
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="duration-select"
                      >
                        <option value="30">30 mins</option>
                        <option value="60">60 mins</option>
                      </select>
                    </div>
                  </div>
                </label>
                <button className="find-slots-button" onClick={handleFindSlots}>Find Slots</button>
              </div>
            </div>
            {showSlots && (
              <div className="available-slots">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`slot-button ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <button onClick={handleSchedule} className="schedule-button">Schedule Interview</button>
          </div>
        </div>
        <div className="modal-right">
          <h2>Interview Process</h2>
          <div className="candidate-info">
            <h3>{candidateName || 'Candidate Name Not Available'}</h3>
            <p>{jobTitle ? `${jobTitle}${jobDepartment ? ` - ${jobDepartment}` : ''}` : 'Job Details Not Available'}</p>
          </div>
          <div className="interview-timeline">
            <div className="timeline-line"></div>
            {history.map((interview, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-status">
                  <div className={`status-icon ${interview.status.toLowerCase()}`}>
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                <div className="timeline-content">
                  <h3>{interview.roundName}</h3>
                  <p className="timeline-subtitle">{interview.status}</p>
                  {interview.feedback && (
                    <p className="timeline-description">
                      <strong>Interviewer's feedback: </strong>
                      {interview.feedback}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    )
  );
};


export default InterviewHistoryModal;
