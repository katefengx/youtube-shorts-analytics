import React from "react";
import "./SentimentAnalysis.css";

interface SentimentAnalysisProps {
  sentimentStats: {
    [key: string]: number;
  };
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  sentimentStats,
}) => {
  // Calculate total for percentage calculations
  const total = Object.values(sentimentStats).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Get counts for each sentiment
  const positiveCount = sentimentStats.positive || 0;
  const negativeCount = sentimentStats.negative || 0;
  const neutralCount = sentimentStats.neutral || 0;

  // Calculate percentages
  const positivePercentage = total > 0 ? (positiveCount / total) * 100 : 0;
  const negativePercentage = total > 0 ? (negativeCount / total) * 100 : 0;
  const neutralPercentage = total > 0 ? (neutralCount / total) * 100 : 0;

  // Find the dominant sentiment
  const dominantSentiment = Object.entries(sentimentStats).reduce((a, b) =>
    sentimentStats[a[0]] > sentimentStats[b[0]] ? a : b,
  )[0];

  return (
    <div className="sentiment-analysis">
      <div className="sentiment-header">
        <h3>SENTIMENT ANALYSIS</h3>
        <p className="sentiment-subtitle">tone of your Shorts titles</p>
      </div>

      <div className="sentiment-summary">
        <div className="dominant-sentiment">
          <span className="dominant-label">Most Common:</span>
          <span className={`dominant-value ${dominantSentiment}`}>
            {dominantSentiment.charAt(0).toUpperCase() +
              dominantSentiment.slice(1)}
          </span>
        </div>
      </div>

      <div className="sentiment-breakdown">
        <div className="sentiment-bar">
          <div
            className="sentiment-segment positive"
            style={{ width: `${positivePercentage}%` }}
          >
            <span className="sentiment-label">Positive</span>
            <span className="sentiment-count">{positiveCount}</span>
          </div>
          <div
            className="sentiment-segment neutral"
            style={{ width: `${neutralPercentage}%` }}
          >
            <span className="sentiment-label">Neutral</span>
            <span className="sentiment-count">{neutralCount}</span>
          </div>
          <div
            className="sentiment-segment negative"
            style={{ width: `${negativePercentage}%` }}
          >
            <span className="sentiment-label">Negative</span>
            <span className="sentiment-count">{negativeCount}</span>
          </div>
        </div>
      </div>

      <div className="sentiment-percentages">
        <div className="percentage-item">
          <span className="percentage-value">
            {positivePercentage.toFixed(1)}%
          </span>
          <span className="percentage-label">Positive</span>
        </div>
        <div className="percentage-item">
          <span className="percentage-value">
            {neutralPercentage.toFixed(1)}%
          </span>
          <span className="percentage-label">Neutral</span>
        </div>
        <div className="percentage-item">
          <span className="percentage-value">
            {negativePercentage.toFixed(1)}%
          </span>
          <span className="percentage-label">Negative</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
