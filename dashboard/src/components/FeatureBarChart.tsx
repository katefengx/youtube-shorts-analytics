import React, { useRef, useEffect, useState } from "react";
import "./FeatureBarChart.css";

interface EngagementData {
  withFeature: number;
  withoutFeature: number;
}

interface FeatureBarChartProps {
  hashtagData: EngagementData;
  emojiData: EngagementData;
}

const FeatureBarChart: React.FC<FeatureBarChartProps> = ({
  hashtagData,
  emojiData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Use container size, but maintain reasonable minimums
        const width = Math.max(containerWidth, 200);
        const height = Math.max(containerHeight, 100);

        setDimensions({ width, height });
      }
    };

    // Initial dimensions calculation
    updateDimensions();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also update on next tick to ensure dimensions are available
    const timeoutId = setTimeout(updateDimensions, 0);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(0);
    }
  };

  // Calculate relative heights based on the maximum value
  const maxValue = Math.max(
    hashtagData.withFeature,
    hashtagData.withoutFeature,
    emojiData.withFeature,
    emojiData.withoutFeature,
  );

  // Use responsive height based on container
  const maxHeight = Math.min(dimensions.height * 0.6, 200);

  return (
    <div className="bars-container" ref={containerRef}>
      {/* With hashtags */}
      <div className="bar-group">
        <div className="bar-value">{formatNumber(hashtagData.withFeature)}</div>
        <div
          className="bar with-feature"
          style={{
            height: `${(hashtagData.withFeature / maxValue) * maxHeight}px`,
            backgroundColor: "#e78383",
          }}
        ></div>
        <div className="bar-label">with hashtags</div>
      </div>

      {/* Without hashtags */}
      <div className="bar-group">
        <div className="bar-value">
          {formatNumber(hashtagData.withoutFeature)}
        </div>
        <div
          className="bar without-feature"
          style={{
            height: `${(hashtagData.withoutFeature / maxValue) * maxHeight}px`,
            backgroundColor: "#ddd",
          }}
        ></div>
        <div className="bar-label">without hashtags</div>
      </div>

      {/* With emojis */}
      <div className="bar-group">
        <div className="bar-value">{formatNumber(emojiData.withFeature)}</div>
        <div
          className="bar with-feature"
          style={{
            height: `${(emojiData.withFeature / maxValue) * maxHeight}px`,
            backgroundColor: "#e78383",
          }}
        ></div>
        <div className="bar-label">with emojis</div>
      </div>

      {/* Without emojis */}
      <div className="bar-group">
        <div className="bar-value">
          {formatNumber(emojiData.withoutFeature)}
        </div>
        <div
          className="bar without-feature"
          style={{
            height: `${(emojiData.withoutFeature / maxValue) * maxHeight}px`,
            backgroundColor: "#ddd",
          }}
        ></div>
        <div className="bar-label">without emojis</div>
      </div>
    </div>
  );
};

export default FeatureBarChart;
