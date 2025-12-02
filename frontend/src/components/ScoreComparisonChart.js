import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const ScoreComparisonChart = ({ data }) => {
    return (
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Efficiency Comparison vs Standard CNS Drugs
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip
                            formatter={(value) => [`${value}%`, 'Efficiency']}
                            contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend />
                        <Bar dataKey="efficiency" name="N2B Efficiency (%)" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.is_user ? '#2196f3' : '#9e9e9e'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Blue bar indicates your analyzed drug. Grey bars are standard CNS drugs for reference.
            </Typography>
        </Paper>
    );
};

export default ScoreComparisonChart;
