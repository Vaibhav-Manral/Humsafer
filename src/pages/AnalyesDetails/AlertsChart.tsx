import React, { useEffect, useRef } from 'react';
import styles from "./AnalyseDetails.module.css"

interface travelDistance {
    obeyedAlertsPercentage: number;
    ignoredAlertsPercentage: number;
}

const AlertsChart: React.FC<travelDistance> = (data) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const canvasSize = 150;
    const center = canvasSize / 2;
    const maxRadius = center;
    const segmentInnerRadius = 0.75 * center;
    const innerCircleRadius = 0.75 * center;
    const segmentInnerRadiusForThird = 0.75 * center;
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const percentage1 = data.obeyedAlertsPercentage;
        const percentage2 = data.ignoredAlertsPercentage;
        const percentage3 = 100 - percentage1 - percentage2;
        const startAngle1 = Math.PI / 2;
        const endAngle1 = startAngle1 + 2 * Math.PI * (percentage1 / 100);

        const startAngle2 = endAngle1;
        const endAngle2 = startAngle2 + 2 * Math.PI * (percentage2 / 100);

        const startAngle3 = endAngle2;
        const endAngle3 = startAngle3 + 2 * Math.PI * (percentage3 / 100);

        ctx.fillStyle = '#03A89E';
        ctx.beginPath();
        ctx.arc(center, center, segmentInnerRadius, startAngle1, endAngle1, false);
        ctx.arc(center, center, maxRadius, endAngle1, startAngle1, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FF5733';
        ctx.beginPath();
        ctx.arc(center, center, segmentInnerRadius, startAngle2, endAngle2, false);
        ctx.arc(center, center, maxRadius, endAngle2, startAngle2, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#E4E4E4';
        ctx.beginPath();
        ctx.arc(center, center, segmentInnerRadiusForThird, startAngle3, endAngle3, false);
        ctx.arc(center, center, maxRadius, endAngle3, startAngle3, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(center, center, innerCircleRadius, 0, Math.PI * 2, false);
        ctx.fill();

    }, [center, data.obeyedAlertsPercentage, data.ignoredAlertsPercentage, innerCircleRadius, maxRadius, segmentInnerRadius, segmentInnerRadiusForThird]);

    return (
        <div className={styles.mt_15}>
            <canvas ref={canvasRef} width={canvasSize} height={canvasSize}></canvas>
        </div>
    );
};

export default AlertsChart;
