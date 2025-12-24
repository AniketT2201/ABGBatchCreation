import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { useHistory } from 'react-router-dom';
import { CSVLink } from "react-csv";
import { Icon } from '@fluentui/react/lib/Icon';
import DashboardOps from '../../services/BAL/BatchCreationDashboard';
import logo from '../../assets/ABGlogo.jpg';
import { Search24Regular } from "@fluentui/react-icons";
import { SPComponentLoader } from '@microsoft/sp-loader';
import '../styles.scss';
import '../TNICreation.scss';
import { IBatchCreationDashboard } from '../../services/interface/IBatchCreationDashboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faEdit,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "../Calender.scss";

export interface ICalendarPageProps extends IAbgBatchCreationProps {
  events?: { date: string; title?: string }[];
}


export const CalenderPage: React.FunctionComponent<ICalendarPageProps> = ( props) => {
  const history = useHistory();
  const { events = [] } = props;
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const hasEvent = (day: number) =>
    events.some(
      (e) =>
        new Date(e.date).toDateString() ===
        new Date(year, month, day).toDateString()
    );

  return (
    <div className='calenderContainer'>
      <div className="calendar-container">
        <div className='cancleIcon'>
          <FontAwesomeIcon
            icon={faTimes}
            size="lg"
            //style={{ color: '#d13438', cursor: 'pointer', top: '10px', right: '10px', position: 'absolute' }}
            title="Cancel"
            onClick={() => history.push("/")}
          />
        </div>
        {/* Header */}
        <div className="calendar-header">
          <FontAwesomeIcon
            icon={faChevronLeft}
            onClick={() => changeMonth(-1)}
            className="nav-icon"
          />
          <h3>
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h3>
          <FontAwesomeIcon
            icon={faChevronRight}
            onClick={() => changeMonth(1)}
            className="nav-icon"
          />
        </div>
        {/* Week Days */}
        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        {/* Days */}
        <div className="calendar-grid">
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty"></div>
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            return (
              <div
                key={day}
                className={`calendar-cell ${isToday ? "today" : ""}`}
                onClick={() => console.log("Clicked day:", day)}
              >
                <span>{day}</span>
                {hasEvent(day) && <div className="event-dot"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};