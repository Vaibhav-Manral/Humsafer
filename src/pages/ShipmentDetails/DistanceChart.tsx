import React, { useEffect, useRef } from "react";
import styles from "./ShipmentDetails.module.css";

interface TravelDistanceProps {
  shipmentCompletionPercentage: number;
}

const DistanceChart: React.FC<TravelDistanceProps> = (data) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const percentage_travel = data.shipmentCompletionPercentage;

    const startAngleTravel = -Math.PI / 2;
    const endAngleTravel =
      -Math.PI / 2 + 2 * Math.PI * (percentage_travel / 100);

    const startAngleRemaining = endAngleTravel;
    const endAngleRemaining = 2 * Math.PI - Math.PI / 2;

    ctx.fillStyle = "#03A89E";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 100, startAngleTravel, endAngleTravel, false);
    ctx.lineTo(100, 100);
    ctx.fill();

    ctx.fillStyle = "#BEE8E6";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 100, startAngleRemaining, endAngleRemaining, false);
    ctx.lineTo(100, 100);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 85, 0, Math.PI * 2, false);
    ctx.lineTo(100, 100);
    ctx.fill();

    ctx.fillStyle = "#03A89E";
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 40, 0, Math.PI * 2, false);
    ctx.lineTo(100, 100);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "22px Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${percentage_travel.toFixed(0)}%`, 100, 100);
  }, [data.shipmentCompletionPercentage]);

  return (
    <div>
      <div>
        <canvas ref={canvasRef} width="200" height="200"></canvas>
      </div>
      <div className={styles.chart_text_box}>
        <p>
          <span className={styles.chart_text_box_traveled}></span>Distance
          Traveled
        </p>
        <p>
          <span className={styles.chart_text_box_remaining}></span>Distance
          Remaining
        </p>
      </div>
    </div>
  );
};
export default DistanceChart;
