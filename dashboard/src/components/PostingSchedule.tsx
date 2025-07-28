import React from "react";
import "./PostingSchedule.css";

interface PostingScheduleProps {
  postingSchedule: {
    [key: string]: number;
  };
}

const PostingSchedule: React.FC<PostingScheduleProps> = ({
  postingSchedule,
}) => {
  // Define the order of days
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const dayAbbreviations = ["M", "T", "W", "T", "F", "S", "S"];

  // Calculate total for percentage calculations
  const total = Object.values(postingSchedule).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Find the maximum count for scaling
  const maxCount = Math.max(...Object.values(postingSchedule), 1);

  // Get the most active day
  const mostActiveDay = Object.entries(postingSchedule).reduce((a, b) =>
    postingSchedule[a[0]] > postingSchedule[b[0]] ? a : b,
  )[0];

  return (
    <div className="posting-schedule">
      <div className="schedule-header">
        <h3>POSTING SCHEDULE</h3>
        <p className="schedule-subtitle">how many Shorts are posted each day</p>
      </div>

      <div className="schedule-summary">
        <div className="most-active-day">
          <span className="active-label">Most Active:</span>
          <span className="active-value">{mostActiveDay}</span>
        </div>
      </div>

      <div className="schedule-chart">
        <div className="chart-bars">
          {dayOrder.map((day, index) => {
            const count = postingSchedule[day] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isMostActive = day === mostActiveDay;

            return (
              <div key={day} className="chart-column">
                <div
                  className={`chart-bar ${isMostActive ? "most-active" : ""}`}
                  style={{ height: `${height}%` }}
                  title={`${day}: ${count} Shorts (${percentage.toFixed(1)}%)`}
                >
                  {count > 0 && <span className="bar-count">{count}</span>}
                </div>
                <span className="day-label">{dayAbbreviations[index]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="schedule-stats">
        <div className="stat-item">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Shorts</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{Math.round(total / 7)}</span>
          <span className="stat-label">Avg per Day</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {Object.keys(postingSchedule).length}
          </span>
          <span className="stat-label">Active Days</span>
        </div>
      </div>
    </div>
  );
};

export default PostingSchedule;
