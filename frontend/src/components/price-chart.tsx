"use client"

import React from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface PriceHistoryPoint {
  timestamp: number;
  value: number;
}

interface PriceChartProps {
  refinedData: PriceHistoryPoint[];
  keyData: PriceHistoryPoint[];
}

export function PriceChart({ refinedData, keyData }: PriceChartProps) {
  // Add a check to ensure data is valid before processing
  if (!refinedData || !keyData || !Array.isArray(refinedData) || !Array.isArray(keyData)) {
    return <div className="w-full h-full flex items-center justify-center text-blue-300">Loading or no data available.</div>;
  }

  // Combine and format data for the chart
  const chartData = refinedData.map(refinedPoint => {
    const keyPoint = keyData.find(kp => kp.timestamp === refinedPoint.timestamp);
    return {
      date: new Date(refinedPoint.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      refined: refinedPoint.value,
      key: keyPoint ? keyPoint.value : null, // Handle cases where a timestamp might not exist for both
    };
  }).filter(point => point.key !== null); // Filter out points where key data is missing

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255, 255, 255, 0.5)"
        />
        <YAxis yAxisId="left" stroke="rgba(255, 255, 255, 0.5)" tickFormatter={(value) => `$${value.toFixed(3)}`} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255, 255, 255, 0.5)" tickFormatter={(value) => `$${value.toFixed(2)}`} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const dataPoint = payload[0].payload;
              return (
                <div className="rounded-lg border border-blue-800 bg-blue-950/90 p-2 shadow-md text-sm text-white">
                  <div className="text-xs text-blue-300">{dataPoint.date}</div>
                  <div className="mt-1 grid gap-2">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      <span>Refined: ${dataPoint.refined.toFixed(3)}</span>
                    </div>
                    {dataPoint.key !== null && (
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-cyan-400" />
                        <span>Key: ${dataPoint.key.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          wrapperStyle={{ color: "#fff", paddingTop: '10px' }}
          formatter={(value) => <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{value === 'refined' ? 'Refined Metal' : 'Mann Co. Key'}</span>}
        />
        <Area type="monotone" dataKey="refined" yAxisId="left" stroke="hsl(217, 91%, 60%)" fill="hsla(217, 91%, 60%, 0.2)" activeDot={{ r: 6 }} />
        {chartData.some(point => point.key !== null) && (
          <Area type="monotone" dataKey="key" yAxisId="right" stroke="hsl(180, 100%, 50%)" fill="hsla(180, 100%, 50%, 0.2)" activeDot={{ r: 6 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
