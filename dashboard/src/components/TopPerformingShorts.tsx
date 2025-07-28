import React, { useState, useMemo } from "react";
import "./TopPerformingShorts.css";

export type SortType = "view" | "like" | "comment";

interface TopShort {
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

interface TopPerformingShortsProps {
  topShorts: TopShort[];
}

const TopPerformingShorts: React.FC<TopPerformingShortsProps> = ({
  topShorts,
}) => {
  const [sortBy, setSortBy] = useState<SortType>("view");

  // Safety check for empty or undefined data
  if (!topShorts || topShorts.length === 0) {
    return (
      <div className="top-performing-shorts">
        <div className="top-performing-shorts-header">
          <h3>TOP PERFORMING SHORTS</h3>
          <p className="top-performing-shorts-subtitle">
            your best performing Shorts by engagement
          </p>
        </div>
        <div className="shorts-list">
          <div className="short-item">
            <div className="short-title">No data available</div>
          </div>
        </div>
      </div>
    );
  }

  const sortedShorts = useMemo(() => {
    const sorted = [...topShorts]
      .sort((a, b) => {
        const aValue = (a[`${sortBy}_count` as keyof TopShort] as number) || 0;
        const bValue = (b[`${sortBy}_count` as keyof TopShort] as number) || 0;
        return bValue - aValue;
      })
      .slice(0, 5); // Get top 5

    return sorted;
  }, [topShorts, sortBy]);

  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return "0";
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const getSortValue = (short: TopShort): number => {
    const value = short[`${sortBy}_count` as keyof TopShort] as number;
    return value || 0;
  };

  return (
    <div className="top-performing-shorts">
      <div className="top-performing-shorts-header">
        <h3>TOP PERFORMING SHORTS</h3>
        <p className="top-performing-shorts-subtitle">
          your best performing Shorts by engagement
        </p>
        <div className="sort-controls">
          <span className="sort-label">SORT BY</span>
          <div className="sort-buttons">
            <button
              className={`sort-button ${sortBy === "view" ? "active" : ""}`}
              onClick={() => setSortBy("view")}
            >
              VIEWS
            </button>
            <button
              className={`sort-button ${sortBy === "like" ? "active" : ""}`}
              onClick={() => setSortBy("like")}
            >
              LIKES
            </button>
            <button
              className={`sort-button ${sortBy === "comment" ? "active" : ""}`}
              onClick={() => setSortBy("comment")}
            >
              COMMENTS
            </button>
          </div>
        </div>
      </div>

      <div className="shorts-list">
        {sortedShorts.map((short, index) => {
          const value = getSortValue(short);
          // Calculate percentage based on position (1st = 100%, 2nd = 80%, 3rd = 60%, etc.)
          const percentage =
            sortedShorts.length > 0
              ? ((sortedShorts.length - index) / sortedShorts.length) * 100
              : 0;

          return (
            <div key={index} className="short-item">
              <div className="short-title">{short.title || "Untitled"}</div>
              <div className="short-bar-container">
                <div
                  className="short-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="short-value">{formatValue(value)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopPerformingShorts;
