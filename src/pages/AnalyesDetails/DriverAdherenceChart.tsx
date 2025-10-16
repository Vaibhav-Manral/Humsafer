import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface IAdherence {
  highAdherence: number;
  lowAdherence: number;
}

const DriverAdherenceChart: React.FC<IAdherence> = (props) => {
  const { highAdherence, lowAdherence } = props;

  const data = [
    { name: "Good Driving", value: highAdherence, color: "#2D9CDB" },
    { name: "Needs Improvement", value: lowAdherence, color: "#EB5757" },
  ];

  const filteredData = data.filter((entry) => entry.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const isSmallPercentage = percent < 0.05;

    let radius;
    if (isSmallPercentage) {
      radius = outerRadius * 0.9;
    } else {
      radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    }

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const fontSize = isSmallPercentage ? 10 : 12;

    // Center text for all but very small percentages
    const textAnchor = isSmallPercentage
      ? Math.abs(midAngle) > 90
        ? "end"
        : "start"
      : "middle";

    return (
      <text
        x={x}
        y={y}
        fill="white"
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor={textAnchor}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={180} minWidth={180}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          minAngle={1}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DriverAdherenceChart;
