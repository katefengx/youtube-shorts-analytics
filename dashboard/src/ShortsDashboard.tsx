import React, { useEffect, useState } from "react";
import type { DashboardData, TimeRange } from "./types";
import "./ShortsDashboard.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { format, parseISO, differenceInDays } from "date-fns";
import DonutChart from "./components/DonutChart";

const ShortsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 0]);
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
  const [pendingRange, setPendingRange] = useState<[number, number]>([0, 0]);
  const [activeFilters, setActiveFilters] = useState<{
    hashtags?: boolean;
    emojis?: boolean;
  }>({});

  // Fetch all available dates on mount
  useEffect(() => {
    fetch("/api/shorts_data")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          // Extract and sort unique dates
          const dates = Array.from(
            new Set(data.data.map((row: any) => row.date)),
          ) as string[];
          dates.sort();
          setAllDates(dates);
          setSliderRange([0, dates.length - 1]);
          setSelectedRange([0, dates.length - 1]);
          setPendingRange([0, dates.length - 1]);
        }
      });
  }, []);

  // Fetch dashboard data when selectedRange changes and allDates is loaded
  useEffect(() => {
    if (allDates.length === 0) return;
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];
    setLoading(true);
    setError(null);
    let url = `/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedRange, allDates]);

  const handleFilterChange = (filter: {
    type: string;
    hasFeature: boolean;
  }) => {
    // Update active filters
    const newFilters = { ...activeFilters };
    if (filter.type === "hashtags") {
      newFilters.hashtags = filter.hasFeature;
    } else if (filter.type === "emojis") {
      newFilters.emojis = filter.hasFeature;
    }
    setActiveFilters(newFilters);

    setLoading(true);

    // Make a new API call with filter parameters
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];

    let url = `/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

    // Add filter parameters
    if (newFilters.hashtags !== undefined) {
      url += `&hashtag_filter=${newFilters.hashtags}`;
    }
    if (newFilters.emojis !== undefined) {
      url += `&emoji_filter=${newFilters.emojis}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const resetFilters = () => {
    setActiveFilters({});
    setLoading(true);

    // Make a new API call without filter parameters
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];

    const url = `/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Use dashboardData directly since filtering is now handled server-side
  const filteredData = dashboardData;

  if (error) return <div>Error: {error}</div>;
  if (!dashboardData || !filteredData)
    return <div>No dashboard data available.</div>;

  return (
    <div className="dashboard-container" style={{ position: "relative" }}>
      {loading && <div className="dashboard-loading-overlay"></div>}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          How are your Shorts captions performing?
        </h1>
        {allDates.length > 1 && (
          <div className="timeline-slider">
            <div className="slider-labels">
              <span>
                {format(parseISO(allDates[pendingRange[0]]), "MMM d, yyyy")}
              </span>
              <span>
                {format(parseISO(allDates[pendingRange[1]]), "MMM d, yyyy")}
              </span>
            </div>
            <Slider
              range
              min={sliderRange[0]}
              max={sliderRange[1]}
              value={pendingRange}
              onChange={(range) => setPendingRange(range as [number, number])}
              onAfterChange={(range) =>
                setSelectedRange(range as [number, number])
              }
              allowCross={false}
              pushable={1}
            />
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Summary Cards - KPI Row */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-title">AVG. VIEWS</div>
            <div className="card-value">{filteredData.summary.avg_views}</div>
            <div className="sparkline"></div>
          </div>
          <div className="card">
            <div className="card-title">AVG. LIKES</div>
            <div className="card-value">{filteredData.summary.avg_likes}</div>
            <div className="sparkline"></div>
          </div>
          <div className="card">
            <div className="card-title">AVG. COMMENTS</div>
            <div className="card-value">
              {filteredData.summary.avg_comments}
            </div>
            <div className="sparkline"></div>
          </div>
        </div>

        {/* Donut Charts Column */}
        <div className="donut-charts">
          <div className="donut-header">
            <div className="donut-instruction">
              Click on sections in the donut charts to filter charts
            </div>
            {(activeFilters.hashtags !== undefined ||
              activeFilters.emojis !== undefined) && (
              <button
                className="reset-filters-btn"
                onClick={resetFilters}
                title="Reset all filters"
              >
                Reset Filters
              </button>
            )}
          </div>
          <DonutChart
            usage_percentage={filteredData.hashtag_stats.usage_percentage}
            non_usage_percentage={
              filteredData.hashtag_stats.non_usage_percentage
            }
            label={`USE`}
            icon={<span>#</span>}
            title="hashtags"
            description={`${filteredData.hashtag_stats.avg_hashtags_per_video} hashtags per Short`}
            onFilterChange={handleFilterChange}
          />
          <DonutChart
            usage_percentage={filteredData.emoji_stats.usage_percentage}
            non_usage_percentage={filteredData.emoji_stats.non_usage_percentage}
            label={`USE`}
            icon={<span>😀</span>}
            title="emojis"
            description={`${filteredData.emoji_stats.avg_emojis_per_video} emojis per Short`}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Scatter Charts */}
        <div className="scatter-charts">
          <div className="scatter-card">
            <div className="scatter-title">
              How does % of capitalized letters affect the number of views?
            </div>
            <div className="scatter-chart">
              <div className="scatter-axis x"></div>
              <div className="scatter-axis y"></div>
              <div className="scatter-dots">
                {filteredData.scatter_data.caps_vs_views.map((point, index) => {
                  const maxViews = Math.max(
                    ...filteredData.scatter_data.caps_vs_views.map(
                      (p) => p.view_count,
                    ),
                  );
                  const maxCaps = Math.max(
                    ...filteredData.scatter_data.caps_vs_views.map(
                      (p) => p.caps_percentage,
                    ),
                  );
                  const left = `${(point.caps_percentage / maxCaps) * 100}%`;
                  const top = `${100 - (point.view_count / maxViews) * 100}%`;
                  return (
                    <div
                      key={index}
                      className="scatter-dot"
                      style={{ left, top }}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="scatter-card">
            <div className="scatter-title">
              How does caption length affect the number of views?
            </div>
            <div className="scatter-chart">
              <div className="scatter-axis x"></div>
              <div className="scatter-axis y"></div>
              <div className="scatter-dots">
                {filteredData.scatter_data.length_vs_views.map(
                  (point, index) => {
                    const maxViews = Math.max(
                      ...filteredData.scatter_data.length_vs_views.map(
                        (p) => p.view_count,
                      ),
                    );
                    const maxLength = Math.max(
                      ...filteredData.scatter_data.length_vs_views.map(
                        (p) => p.title_length,
                      ),
                    );
                    const left = `${(point.title_length / maxLength) * 100}%`;
                    const top = `${100 - (point.view_count / maxViews) * 100}%`;
                    return (
                      <div
                        key={index}
                        className="scatter-dot"
                        style={{ left, top }}
                      ></div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Shorts */}
        <div className="top-shorts">
          <div className="top-shorts-title">TOP PERFORMING SHORTS</div>
          {filteredData.top_shorts.map((short, index) => {
            const maxViews = Math.max(
              ...filteredData.top_shorts.map((s) => s.view_count),
            );
            const progressPercentage = (short.view_count / maxViews) * 100;
            return (
              <div
                key={index}
                className={`short-caption ${index === 0 ? "active" : ""}`}
              >
                {short.title}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Large Chart */}
        <div className="large-chart">TBD</div>

        {/* Small Cards */}
        <div className="small-card">TBD</div>
        <div className="small-card">TBD</div>
        <div className="small-card">TBD</div>

        {/* Wide Card */}
        <div className="wide-card">TBD</div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
