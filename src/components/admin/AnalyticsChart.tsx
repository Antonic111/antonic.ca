"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  views: number;
  clicks: number;
}

export default function AnalyticsChart({ data = [] }: { data?: ChartData[] }) {
  // If no data or all zeros, we can still render the empty chart
  return (
    <div className="h-80 w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="name" stroke="#a3a3a3" />
          <YAxis stroke="#a3a3a3" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#141414", borderColor: "#262626", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Line type="monotone" dataKey="views" stroke="#ffffff" strokeWidth={2} />
          <Line type="monotone" dataKey="clicks" stroke="#ff3b30" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
