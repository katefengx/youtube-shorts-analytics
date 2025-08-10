import React, { useEffect, useState } from "react";
import type { DashboardData } from "./types";
import { API_BASE_URL } from "./config";
import "./ShortsDashboard.css";
import DonutEngagement from "./components/DonutEngagement";
import TimeFilter from "./components/TimeFilter";
import AreaChart from "./components/AreaChart";
import TopPerformingShorts from "./components/TopPerformingShorts";
import ScatterPlot from "./components/ScatterPlot";
import SentimentAnalysis from "./components/SentimentAnalysis";
import PostingSchedule from "./components/PostingSchedule";

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

  // State for KPI card hover data
  const [hoverData, setHoverData] = useState<{
    views?: { monthYear: string; value: string } | null;
    likes?: { monthYear: string; value: string } | null;
    comments?: { monthYear: string; value: string } | null;
  }>({});

  // Fetch all available dates on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/shorts_data`)
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
    let url = `${API_BASE_URL}/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

    // Add filter parameters
    if (activeFilters.hashtags !== undefined) {
      url += `&hashtag_filter=${activeFilters.hashtags}`;
    }
    if (activeFilters.emojis !== undefined) {
      url += `&emoji_filter=${activeFilters.emojis}`;
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
  }, [selectedRange, allDates, activeFilters]);

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
  };

  const resetFilters = () => {
    setActiveFilters({});
    setLoading(true);

    // Make a new API call without filter parameters
    const [startIdx, endIdx] = selectedRange;
    const startDate = allDates[startIdx];
    const endDate = allDates[endIdx];

    const url = `${API_BASE_URL}/api/dashboard_data?start_date=${startDate}&end_date=${endDate}`;

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

      {/* Header Section with Right Side Content */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">
              Youtube Shorts Caption Performance Dashboard
            </h1>
            <p className="dashboard-subtitle">
              Track how different captions impact your Shorts' success.
            </p>
            <div className="summary-metrics">
              <div className="summary-metric">
                <span className="summary-metric-value">
                  {filteredData.summary.total_shorts}
                </span>
                <span className="summary-metric-label">SHORTS POSTED</span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-value">
                  {filteredData.summary.avg_shorts_per_day}
                </span>
                <span className="summary-metric-label">
                  AVG. SHORTS PER DAY
                </span>
              </div>
              <div className="summary-metric">
                <span className="summary-metric-value">
                  {filteredData.summary.avg_words || "6.92"}
                </span>
                <span className="summary-metric-label">WORDS PER CAPTION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="header-right-content">
          {/* Date Range Section */}
          <div className="date-range-section">
            <TimeFilter
              allDates={allDates}
              sliderRange={sliderRange}
              pendingRange={pendingRange}
              onPendingRangeChange={setPendingRange}
              onSelectedRangeChange={setSelectedRange}
            />
          </div>

          {/* Performance Metrics */}
          <div className="performance-metrics">
            <div className="metric-card">
              <span className="metric-label">AVG. VIEWS</span>
              <span className="metric-value">
                {filteredData.summary.avg_views}
              </span>
              <div className="metric-hover-info">
                <span className="hover-date">
                  {hoverData.views
                    ? hoverData.views.monthYear
                    : "Hover chart for details"}
                </span>
                <span className="hover-value">
                  {hoverData.views ? hoverData.views.value : ""}
                </span>
              </div>
              {filteredData.time_series_data?.views && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.views.map((item) => ({
                      date: item.date,
                      value: item.view_count,
                    }))}
                    onHoverData={(data) =>
                      setHoverData((prev) => ({ ...prev, views: data }))
                    }
                  />
                </div>
              )}
            </div>
            <div className="metric-card">
              <span className="metric-label">AVG. LIKES</span>
              <span className="metric-value">
                {filteredData.summary.avg_likes}
              </span>
              <div className="metric-hover-info">
                <span className="hover-date">
                  {hoverData.likes
                    ? hoverData.likes.monthYear
                    : "Hover chart for details"}
                </span>
                <span className="hover-value">
                  {hoverData.likes ? hoverData.likes.value : ""}
                </span>
              </div>
              {filteredData.time_series_data?.likes && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.likes.map((item) => ({
                      date: item.date,
                      value: item.like_count,
                    }))}
                    onHoverData={(data) =>
                      setHoverData((prev) => ({ ...prev, likes: data }))
                    }
                  />
                </div>
              )}
            </div>
            <div className="metric-card">
              <span className="metric-label">AVG. COMMENTS</span>
              <span className="metric-value">
                {filteredData.summary.avg_comments}
              </span>
              <div className="metric-hover-info">
                <span className="hover-date">
                  {hoverData.comments
                    ? hoverData.comments.monthYear
                    : "Hover chart for details"}
                </span>
                <span className="hover-value">
                  {hoverData.comments ? hoverData.comments.value : ""}
                </span>
              </div>
              {filteredData.time_series_data?.comments && (
                <div className="metric-chart">
                  <AreaChart
                    data={filteredData.time_series_data.comments.map(
                      (item) => ({
                        date: item.date,
                        value: item.comment_count,
                      }),
                    )}
                    onHoverData={(data) =>
                      setHoverData((prev) => ({ ...prev, comments: data }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Engagement Analysis */}
        <div className="engagement-analysis">
          {/* Donut Charts Stacked */}
          <DonutEngagement
            hashtagData={filteredData.hashtag_stats}
            emojiData={filteredData.emoji_stats}
            activeFilters={{
              hashtags: activeFilters.hashtags ?? false,
              emojis: activeFilters.emojis ?? false,
            }}
            resetFilters={resetFilters}
            onFilterChange={handleFilterChange}
            filteredData={filteredData}
          />
        </div>

        <div className="middle-column">
          {/* Top Performing Shorts */}
          <div className="top-shorts-section">
            <TopPerformingShorts topShorts={filteredData.top_shorts} />
          </div>

          {/* Scatter Plot */}
          <div className="scatter-section">
            <ScatterPlot
              data={filteredData.scatter_data.duration_vs_engagement}
              onHoverPoint={(point) => {
                if (point) {
                  console.log(
                    `Hovered point - Duration: ${point.duration}, Engagement: ${point.engagement}`,
                  );
                } else {
                  console.log("Hover cleared");
                }
              }}
            />
          </div>
        </div>

        <div className="right-column">
          {/* Sentiment Analysis Component */}
          <div className="sentiment-section">
            <SentimentAnalysis sentimentStats={filteredData.sentiment_stats} />
          </div>

          {/* Posting Schedule Component */}
          <div className="posting-schedule-section">
            <PostingSchedule
              postingSchedule={filteredData.posting_schedule}
              avgViewsPerDay={filteredData.avg_views_per_day}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
