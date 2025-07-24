import React, { useEffect, useState } from "react";
import type { ShortData } from "./types";
import "./ShortsDashboard.css";

const ShortsDashboard: React.FC = () => {
  const [shortsData, setShortsData] = useState<ShortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shorts_data")
      .then((res) => res.json())
      .then((data) => {
        setShortsData(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch shorts data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!shortsData.length) return <div>No data available.</div>;

  return (
    <div className="dashboard-container">
      <h1>How are your Shorts captions performing?</h1>
      <div className="dashboard-grid">
        <div className="summary-cards">
          {/* Avg. Views, Likes, Comments */}
          <div className="card">
            AVG. VIEWS
            <br />
            TBD
          </div>
          <div className="card">
            AVG. LIKES
            <br />
            TBD
          </div>
          <div className="card">
            AVG. COMMENTS
            <br />
            TBD
          </div>
        </div>
        <div className="donut-charts">
          <div className="donut-card">
            # USE
            <br />
            Donut Chart
          </div>
          <div className="donut-card">
            😀 USE
            <br />
            Donut Chart
          </div>
        </div>
        <div className="scatter-charts">
          <div className="scatter-card">
            % Caps vs Views
            <br />
            Scatter Plot
          </div>
          <div className="scatter-card">
            Length vs Views
            <br />
            Scatter Plot
          </div>
        </div>
        <div className="top-shorts">
          Top Performing Shorts
          <br />
          TBD
        </div>
        <div className="large-chart">TBD</div>
        <div className="small-card">TBD</div>
        <div className="small-card">TBD</div>
        <div className="small-card">TBD</div>
        <div className="wide-card">TBD</div>
      </div>
    </div>
  );
};

export default ShortsDashboard;
