import * as React from "react";
import { useState } from "react";
import type { IAbgBatchCreationProps } from "../IAbgBatchCreationProps";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../Calender.scss";

export interface ICalendarPageProps extends IAbgBatchCreationProps {
  events?: { date: string; title?: string }[];
}

export const CalenderPage: React.FunctionComponent<ICalendarPageProps> = (
  props
) => {
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
    <div className="bigCalendarPage">
      <div className="bigCalendarContainer">

        {/* Cancel / Close */}
        <FontAwesomeIcon
          icon={faTimes}
          className="bigCalendarCancelIcon"
          title="Close"
          onClick={() => history.push("/")}
        />

        {/* Header */}
        <div className="bigCalendarHeader">
          <div className="bigCalendarTitle">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </div>

          <div className="bigCalendarNav">
            <FontAwesomeIcon
              icon={faChevronLeft}
              className="bigCalendarNavIcon"
              onClick={() => changeMonth(-1)}
            />
            <FontAwesomeIcon
              icon={faChevronRight}
              className="bigCalendarNavIcon"
              onClick={() => changeMonth(1)}
            />
          </div>
        </div>

        {/* Weekdays */}
        <div className="bigCalendarWeekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bigCalendarGrid">
          {/* Empty cells */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bigCalendarCell empty"
            />
          ))}

          {/* Days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={day}
                className={`bigCalendarCell ${isToday ? "today" : ""}`}
                onClick={() => console.log("Clicked day:", day)}
              >
                <div className="bigCalendarDate">{day}</div>

                {hasEvent(day) && (
                  <div className="bigCalendarEvents">
                    <div className="bigCalendarEvent">
                      Batch Created
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
