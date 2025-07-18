import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InterviewHistoryModal.css';
import { interviewService } from '../../services/api';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(new Date(2023, 0, 1, hour, minute, 0, 0));
    }
  }
  return slots;
};

const scrollTimeList = (direction) => {
  const timeList = document.querySelector('.react-datepicker__time-list');
  if (timeList) {
    const scrollAmount = direction === 'up' ? -40 : 40;
    timeList.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  }
};

const InterviewHistoryModal = ({ isOpen, onClose, candidateHistory }) => {
  const handleClose = (success = false, meetingLink = null) => {
    resetScheduleFields();
    onClose(success, meetingLink);
  };

  const resetScheduleFields = () => {
    setSelectedInterviewer('');
    setSelectedDateTime(null);
    setDuration('30');
    setShowSlots(false);
    setAvailableSlots([]);
    setSelectedSlot(null);
  };
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [duration, setDuration] = useState('30');
  const [showSlots, setShowSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [latestMeetingLink, setLatestMeetingLink] = useState(null);

  if (!isOpen || !candidateHistory) return null;

  const { history, candidateName, jobTitle, jobDepartment, email } = candidateHistory;

  console.log('Candidate Info:', { candidateName, jobTitle, jobDepartment, email });

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

  const handleFindSlots = async () => {
    if (!selectedInterviewer || !selectedDateTime) {
      alert('Please select an interviewer and a date/time');
      return;
    }

    console.log('Candidate Email:', email);
    console.log('Full candidateHistory:', candidateHistory);

    const requestBody = {
      email: "mithunwalawalkar1002@gmail.com", //selectedInterviewer,
      dateTime: selectedDateTime.toISOString(),
      duration: parseInt(duration),
      title: "Interview",
      description: "Candidate Interview",
      attendees: [email]
    };

    try {
      const response = await interviewService.getFreeSlots(requestBody);
      if (Array.isArray(response.data.slots)) {
        const formattedSlots = response.data.slots.map(slot => {
          const start = new Date(slot);
          const end = new Date(start.getTime() + parseInt(duration) * 60000);
          return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`;
        });

        setAvailableSlots(formattedSlots);
        setShowSlots(true);
        setSelectedSlot(null);
      } else {
        alert('No available slots found');
      }
    } catch (error) {
      console.error('Error fetching free slots:', error);
      alert(error.message || 'Failed to fetch available slots. Please try again.');
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSchedule = async () => {
    if (!selectedInterviewer || !selectedDateTime || !selectedSlot) {
      alert('Please select an interviewer, date/time, and a time slot');
      return;
    }

    // Parse the selected slot to get start time
    const [startTime] = selectedSlot.split(' - ');
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':');

    // Convert to 24-hour format if PM
    hours = parseInt(hours);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Create date in local timezone
    const selectedDate = new Date(selectedDateTime);
    selectedDate.setHours(hours, parseInt(minutes), 0, 0);

    // Add offset to convert to UTC
    const offset = -330; // IST offset in minutes (-5:30)
    const utcDate = new Date(selectedDate.getTime() - (offset * 60000));

    console.log('Selected Date (IST):', selectedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    console.log('UTC Date:', utcDate.toISOString());

    const requestBody = {
      dateTime: selectedDate.toISOString(),
      duration: parseInt(duration),
      title: "Interview",
      description: "Candidate Interview",
      attendees: [email, selectedInterviewer],
      timeZone: "Asia/Kolkata"
    };

    try {
      const response = await interviewService.scheduleMeeting(requestBody);
      console.log('Schedule Meeting Response:', response);
      if (response.data?.meetingEvent?.hangoutLink) {
        const meetingLink = response.data.meetingEvent.hangoutLink;
        alert('Interview scheduled successfully!');
        // Update the history array in the component
        if (history && history.length > 0) {
          history[history.length - 1].meetingLink = meetingLink;
        }
        // Update the latest meeting link state
        setLatestMeetingLink(meetingLink);
        resetScheduleFields();
        // Just update the parent component's state without closing the modal
        if (onClose) {
          onClose(true, meetingLink, false); // Pass false to indicate not to close the modal
        }
      } else {
        alert('Failed to schedule interview. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(error.message || 'Failed to schedule interview. Please try again.');
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
                <div className="datetime-field">
                  <label>Select Date and Time:</label>
                  <DatePicker
                    selected={selectedDateTime}
                    onChange={handleDateTimeSelect}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    timeZone="Asia/Kolkata"
                    open={isCalendarOpen}
                    onCalendarOpen={handleCalendarOpen}
                    onCalendarClose={handleCalendarClose}
                    timeCaption="Time"
                    timeFormat="HH:mm"
                    renderCustomHeader={({
                      date,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled
                    }) => (
                      <div className="custom-header">
                        <button onClick={() => setSelectedDateTime(new Date())} className="home-button">⌂</button>
                        <div className="month-year-selector">
                          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>◀</button>
                          <span className="month-year">
                            {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>▶</button>
                        </div>
                      </div>
                    )}
                    renderCustomTimeSection={({ date }) => (
                      <div className="time-section">
                        <div className="time-arrow time-arrow-up" onClick={() => scrollTimeList('up')}>▲</div>
                        <div className="time-list">
                          <ul className="react-datepicker__time-list">
                            {generateTimeSlots().map((time, index) => (
                              <li
                                key={index}
                                className={`react-datepicker__time-list-item ${
                                  selectedDateTime &&
                                  time.getHours() === selectedDateTime.getHours() &&
                                  time.getMinutes() === selectedDateTime.getMinutes()
                                    ? 'react-datepicker__time-list-item--selected'
                                    : ''
                                }`}
                                onClick={() => {
                                  const newDate = new Date(selectedDateTime || date);
                                  newDate.setHours(time.getHours());
                                  newDate.setMinutes(time.getMinutes());
                                  handleDateTimeSelect(newDate);
                                }}
                              >
                                {time.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="time-arrow time-arrow-down" onClick={() => scrollTimeList('down')}>▼</div>
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
                </div>
                <div className="duration-field">
                  <label>Duration:</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="duration-select"
                  >
                    <option value="30">30 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
                <button className="find-slots-button" onClick={handleFindSlots}>Find Slots</button>
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
            <div className="candidate-info-modal">
              <h3>{candidateName || 'Candidate Name Not Available'}</h3>
              <p>{jobTitle ? `${jobTitle}${jobDepartment ? ` - ${jobDepartment}` : ''}` : 'Job Details Not Available'}</p>
              {latestMeetingLink && (
                <p className="timeline-description">
                  <strong>Meeting Link: </strong>
                  <a href={latestMeetingLink} target="_blank" rel="noopener noreferrer">
                    {latestMeetingLink}
                  </a>
                </p>
              )}
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
          <button onClick={() => handleClose()} className="close-button">×</button>
        </div>
      </div>
    )
  );
};


export default InterviewHistoryModal;
