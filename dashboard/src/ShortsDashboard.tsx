import React, { useEffect, useState } from "react";
import type { ShortData } from "./types";
import "./ShortsDashboard.css";

const ShortsDashboard: React.FC = () => {
  const [shortsData, setShortsData] = useState<ShortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ShortsDashboard: Starting to fetch data...");
    fetch("/api/shorts_data")
      .then((res) => {
        console.log("ShortsDashboard: Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("ShortsDashboard: Received data:", data);
        setShortsData(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ShortsDashboard: Failed to fetch shorts data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!shortsData.length) return <div>No data available.</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          How are your Shorts captions performing?
        </h1>
        <div className="timeline-bar"></div>
      </div>

      <div className="dashboard-grid">
        {/* Summary Cards - KPI Row */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-title">AVG. VIEWS</div>
            <div className="card-value">10.2K</div>
            <div className="sparkline"></div>
          </div>
          <div className="card">
            <div className="card-title">AVG. LIKES</div>
            <div className="card-value">5.3K</div>
            <div className="sparkline"></div>
          </div>
          <div className="card">
            <div className="card-title">AVG. COMMENTS</div>
            <div className="card-value">2.3K</div>
            <div className="sparkline"></div>
          </div>
        </div>

        {/* Donut Charts Column */}
        <div className="donut-charts">
          <div className="donut-instruction">
            Click on sections in the donut charts to filter charts
          </div>
          <div className="donut-card">
            <div className="donut-chart">
              <div className="donut-icon">#</div>
              <div className="donut-label">USE</div>
            </div>
            <div className="donut-description">
              stats on shorts that have hashtags
            </div>
          </div>
          <div className="donut-card">
            <div className="donut-chart">
              <div className="donut-icon">😀</div>
              <div className="donut-label">USE</div>
            </div>
            <div className="donut-description">
              average number of hashtags for hashtag videos
            </div>
          </div>
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
                {/* Sample scatter dots */}
                <div
                  className="scatter-dot"
                  style={{ left: "20%", top: "30%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "40%", top: "60%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "60%", top: "80%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "80%", top: "90%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "30%", top: "40%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "50%", top: "70%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "70%", top: "85%" }}
                ></div>
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
                {/* Sample scatter dots */}
                <div
                  className="scatter-dot"
                  style={{ left: "25%", top: "25%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "45%", top: "55%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "65%", top: "75%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "85%", top: "85%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "35%", top: "35%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "55%", top: "65%" }}
                ></div>
                <div
                  className="scatter-dot"
                  style={{ left: "75%", top: "80%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Shorts */}
        <div className="top-shorts">
          <div className="top-shorts-title">TOP PERFORMING SHORTS</div>
          <div className="short-caption active">
            this will have some title text example
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
          <div className="short-caption">oh yes this is another caption</div>
          <div className="short-caption">this is more text</div>
          <div className="short-caption">THIS IS A CAPTION AGAINNNN</div>
          <div className="short-caption">LAST ONE!!!!</div>
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
