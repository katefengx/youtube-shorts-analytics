import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { format, parseISO } from "date-fns";
import "./TimeFilter.css";

type TimeFilterProps = {
  allDates: string[];
  sliderRange: [number, number];
  pendingRange: [number, number];
  onPendingRangeChange: (range: [number, number]) => void;
  onSelectedRangeChange: (range: [number, number]) => void;
};

const TimeFilter: React.FC<TimeFilterProps> = ({
  allDates,
  sliderRange,
  pendingRange,
  onPendingRangeChange,
  onSelectedRangeChange,
}) => {
  if (allDates.length <= 1) return null;

  return (
    <div className="time-filter">
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
        onChange={(range) => onPendingRangeChange(range as [number, number])}
        onAfterChange={(range) =>
          onSelectedRangeChange(range as [number, number])
        }
        allowCross={false}
        pushable={1}
      />
    </div>
  );
};

export default TimeFilter;
