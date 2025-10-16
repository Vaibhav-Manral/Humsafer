import React, { useEffect, useRef } from 'react';
import styles from "./DriverReports.module.css"

interface IOverSpeed {
    percentage: number
}

const SDSScoreChart: React.FC<IOverSpeed> = (data) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const percentage_travel = data.percentage;

        const center = 75;
        const outerRadius = 75;
        const innerRadius = 63.75;
        const coreRadius = 30;
        const startAngleTravel = -Math.PI / 2;
        const endAngleTravel = (-Math.PI / 2) + 2 * Math.PI * (percentage_travel / 100);

        const startAngleRemaining = endAngleTravel;
        const endAngleRemaining = 2 * Math.PI - Math.PI / 2;

        ctx.fillStyle = '#03A89E';
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, outerRadius, startAngleTravel, endAngleTravel, false);
        ctx.lineTo(center, center);
        ctx.fill();

        ctx.fillStyle = '#BEE8E6';
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, outerRadius, startAngleRemaining, endAngleRemaining, false);
        ctx.lineTo(center, center);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, innerRadius, 0, Math.PI * 2, false);
        ctx.lineTo(center, center);
        ctx.fill();

        ctx.fillStyle = '#03A89E';
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, coreRadius, 0, Math.PI * 2, false);
        ctx.lineTo(center, center);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '16px Verdana';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage_travel.toFixed(0)}%`, center, center);
    }, [data.percentage]);

    return (
        <div>
            <div className={styles.alerts_chart_text_box_chart}>
                <canvas ref={canvasRef} width="150" height="150"></canvas>
            </div>
            <div className={styles.alerts_chart_text_box}>
                <div className={styles.align_center}>
                    {/* <span className={styles.percentage}> +5</span><span className={styles.symbol}>%</span>
                    Increase */}
                    {"Coming Soon!"}
                </div>
            </div>
        </div>
    );
};
export default SDSScoreChart;
