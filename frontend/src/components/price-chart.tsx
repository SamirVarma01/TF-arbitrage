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
  selectedItem: string;
}

export function PriceChart({ refinedData, keyData, selectedItem }: PriceChartProps) {
  const dataToDisplay = selectedItem === 'refined' ? refinedData : keyData;
  if (!dataToDisplay || !Array.isArray(dataToDisplay) || dataToDisplay.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-blue-300">Loading or no data available.</div>;
  }

  const chartData = dataToDisplay.map(point => ({
    date: new Date(point.timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    value: point.value,
  }));

  const dataKey = 'value';
  const strokeColor = selectedItem === 'refined' ? "hsl(217, 91%, 60%)" : "hsl(180, 100%, 50%)";
  const fillColor = selectedItem === 'refined' ? "hsla(217, 91%, 60%, 0.2)" : "hsla(180, 100%, 50%, 0.2)";
  const tooltipLabel = selectedItem === 'refined' ? 'Refined' : 'Key';
  const tickFormatter = (value: number) => selectedItem === 'refined' ? `$${value.toFixed(3)}` : `${value.toFixed(2)} ref`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 20,
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
        <YAxis
          yAxisId="left"
          stroke="rgba(255, 255, 255, 0.5)"
          tickFormatter={tickFormatter}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const dataPoint = payload[0].payload;
              return (
                <div className="rounded-lg border border-blue-800 bg-blue-950/90 p-2 shadow-md text-sm text-white">
                  <div className="text-xs text-blue-300">{dataPoint.date}</div>
                  <div className="mt-1 grid gap-2">
                    <div className="flex items-center">
                      <div className={`mr-2 h-2 w-2 rounded-full ${selectedItem === 'refined' ? 'bg-blue-500' : 'bg-cyan-400'}`} />
                      <span>{tooltipLabel}: {selectedItem === 'refined' ? `$${dataPoint.value.toFixed(3)}` : `${dataPoint.value.toFixed(2)} ref`}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          wrapperStyle={{ color: "#fff", paddingTop: '10px' }}
          formatter={() => <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{selectedItem === 'refined' ? 'Refined Metal' : 'Mann Co. Key'}</span>}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          yAxisId="left"
          stroke={strokeColor}
          fill={fillColor}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
