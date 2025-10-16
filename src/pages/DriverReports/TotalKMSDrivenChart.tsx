import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer
} from 'recharts';
import CircleIcon from '@mui/icons-material/Circle';
import { Loading } from '../../components/loading/Loading';
import { Grid } from '@mui/material';

interface IProps {
    distanceDrivenInLastYearMap?: { [key: string]: number };
    hideLegend?: boolean;
}

interface IChartDataElement {
    [key: string]: string | number;
}

const getData = (distanceDrivenInLastYearMap: { [key: string]: number }): IChartDataElement[] => {
    const newData = Object.entries(distanceDrivenInLastYearMap ?? {})
            .map(([monthString, distanceValue]) => {
                return {
                    "month": monthString,
                    "distance": parseFloat(((distanceValue ?? 0) / 1000).toFixed(1))
                };
            });
    return newData;    
}

const TotalKMSDrivenChart: React.FC<IProps> = (props) => {

    const { hideLegend = false } = props;
    
    const [data, setData] = useState<IChartDataElement[]>()

    useEffect(() => {
        if (props.distanceDrivenInLastYearMap !== undefined) {
            setData(getData(props.distanceDrivenInLastYearMap))
        }
    }, [props.distanceDrivenInLastYearMap])
    
    const CustomLegend = (props) => {
        const { payload } = props;
        return (
            <ul style={{ display: 'flex', alignItems: "center", visibility: hideLegend ? "hidden" : "visible" }}>
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} style={{ listStyle: 'none', display: 'flex', marginRight: '10px', alignItems: "center" }}>
                        <CircleIcon style={{ color: entry.color, fontSize: "18px" }} />
                        {entry.value}
                    </li>
                ))}
            </ul>
        );
    };

    const CustomTick = (props) => {
        const { x, y, payload } = props;

        return (
            <g transform={`translate(${x},${y})`}>
                <circle r="3" fill="#fff" stroke="#B9BBBD" strokeWidth="1" />
                <text x={0} y={10} dy={11} textAnchor="middle" fill="#666">
                    {payload.value}
                </text>
            </g>
        );
    };

    return (
        <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer>
                <>
                    {data && (
                        <LineChart width={500} height={250} data={data}>
                            <XAxis dataKey="month" padding={{ left: 10, right: 10 }} tickLine={false} axisLine={false} tick={<CustomTick />} />
                            <YAxis domain={[0, 'dataMax + 10']} tickCount={13} interval={0} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Legend content={<CustomLegend />} />
                            {data.map(item => (
                                <ReferenceLine x={item.month} stroke="gray" strokeDasharray="3 3" strokeOpacity={0.3} />
                            ))}
                            {Object.keys(data[0]).filter(key => key !== 'month').map((key, index) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={key}
                                    stroke={['#8ecae6', '#023047', '#fb8500', '#cdb4db', '#ffafcc', '#a2d2ff', '#dda15e', '#a3b18a'][index]}
                                    activeDot={{ r: 8 }}
                                    strokeWidth={3}
                                />
                            ))}
                        </LineChart>
                    )}
                    {!data && (
                        <Grid display={"flex"} justifyContent={"center"} height={"90%"} alignItems={"center"}>
                                <Loading isLoading />
                        </Grid>
                    )}
                </>
            </ResponsiveContainer>

        </div>

    );
}
export default TotalKMSDrivenChart