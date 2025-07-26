import React from "react";
import KPICard from "./KPICard";
import "./KPICardsContainer.css";

interface KPICardsContainerProps {
  avgViews: string | number;
  avgLikes: string | number;
  avgComments: string | number;
  timeSeriesData?: {
    views: Array<{ date: string; view_count: number }>;
    likes: Array<{ date: string; like_count: number }>;
    comments: Array<{ date: string; comment_count: number }>;
  };
  className?: string;
}

const KPICardsContainer: React.FC<KPICardsContainerProps> = ({
  avgViews,
  avgLikes,
  avgComments,
  timeSeriesData,
  className = "",
}) => {
  return (
    <div className={`kpi-cards-container ${className}`}>
      <KPICard
        title="AVG. VIEWS"
        value={avgViews}
        timeSeriesData={timeSeriesData?.views?.map((item) => ({
          date: item.date,
          value: item.view_count,
        }))}
      />
      <KPICard
        title="AVG. LIKES"
        value={avgLikes}
        timeSeriesData={timeSeriesData?.likes?.map((item) => ({
          date: item.date,
          value: item.like_count,
        }))}
      />
      <KPICard
        title="AVG. COMMENTS"
        value={avgComments}
        timeSeriesData={timeSeriesData?.comments?.map((item) => ({
          date: item.date,
          value: item.comment_count,
        }))}
      />
    </div>
  );
};

export default KPICardsContainer;
