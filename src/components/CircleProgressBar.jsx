import * as React from "react";

const radius = 175;
const diameter = Math.round(Math.PI * radius * 2);
const getOffset = (val = 0) =>
  Math.round(((100 - Math.min(val, 100)) / 100) * diameter);

export const CircleProgressBar = ({
  children,
  clockStart = 0,
  clockEnd = 1,
  progressPercentage,
  progressColor = "text-blue",
  circleBgColor = "text-blue-bluesoft",
  size = "100",
  strokeWidth = "25",
  roundedStroke = false
}) => {
  const strokeDashoffset = getOffset(progressPercentage);
  const strokeLinecap = roundedStroke ? "round" : "butt";

  return (
    <svg width={size} height={size} viewBox="-25 -25 400 400">
      <circle
        stroke="currentColor"
        className={circleBgColor}
        cx="175"
        cy="175"
        r="175"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        className={progressColor}
        stroke="currentColor"
        transform="rotate(-90 175 175)"
        cx="175"
        cy="175"
        r="175"
        strokeDasharray="1100"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        fill="none"
        style={{ strokeDashoffset }}
      />
      {children}
    </svg>
  );
};
