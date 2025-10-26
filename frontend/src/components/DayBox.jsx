import React from 'react';
import './DayBox.css';

const DayBox = ({ dayNumber, onClick }) => {
  return (
    <div className="day-box" onClick={() => onClick(dayNumber)}>
      <h3>Day {dayNumber}</h3>
    </div>
  );
};

export default DayBox;
