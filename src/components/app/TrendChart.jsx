import { useMemo } from 'react';

/**
 * Restrained, high-contrast SVG time-series chart.
 * Plots Daily Revenue (bars/area) and Contribution Margin % (line).
 */
export default function TrendChart({ data = [] }) {
  const chartData = useMemo(() => {
    if (!data.length) return null;

    const maxRev = Math.max(...data.map(d => d.revenue), 1000);
    const minRev = 0;

    return {
      points: data,
      maxRev,
      minRev
    };
  }, [data]);

  if (!chartData || !chartData.points.length) {
    return (
      <div className="flex h-44 items-center justify-center border border-[#ded8cb] bg-[#f4f0e6] font-mono text-xs text-[#6e6a60]">
        No time-series data available
      </div>
    );
  }

  const { points, maxRev } = chartData;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  const width = 800;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // Compute point positions
  const polyPoints = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * innerWidth;
    const y = paddingY + innerHeight - (p.revenue / maxRev) * innerHeight;
    return { x, y, ...p };
  });

  const pathD = polyPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const areaD = `${pathD} L ${polyPoints[polyPoints.length - 1].x} ${height - paddingY} L ${polyPoints[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-[#141310]"></span>
            <span className="text-[#141310] font-medium">Daily Net Revenue (INR)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-[#c5301a]"></span>
            <span className="text-[#6e6a60]">28-Day Operating Trend</span>
          </div>
        </div>
        <span className="font-mono text-[11px] text-[#6e6a60]">
          Peak Day: ₹{maxRev.toLocaleString()}
        </span>
      </div>

      <div className="border border-[#ded8cb] bg-[#fcfbf8] p-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 text-[#141310]"
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#ded8cb"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={paddingY + innerHeight / 2}
            x2={width - paddingX}
            y2={paddingY + innerHeight / 2}
            stroke="#ded8cb"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#141310"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaD} fill="#f4f0e6" opacity="0.75" />

          {/* Revenue Line */}
          <path d={pathD} fill="none" stroke="#141310" strokeWidth="1.75" strokeLinejoin="round" />

          {/* Data Nodes */}
          {polyPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill={idx % 4 === 0 ? '#c5301a' : '#141310'}
            />
          ))}

          {/* Date Markers on X-Axis */}
          <text
            x={paddingX}
            y={height - 6}
            className="font-mono text-[10px] fill-[#6e6a60]"
          >
            {points[0].date}
          </text>
          <text
            x={width / 2}
            y={height - 6}
            textAnchor="middle"
            className="font-mono text-[10px] fill-[#6e6a60]"
          >
            Mid-Period (12 Sept)
          </text>
          <text
            x={width - paddingX}
            y={height - 6}
            textAnchor="end"
            className="font-mono text-[10px] fill-[#6e6a60]"
          >
            {points[points.length - 1].date}
          </text>
        </svg>
      </div>
    </div>
  );
}
