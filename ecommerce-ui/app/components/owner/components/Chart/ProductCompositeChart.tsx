import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  ProductChartInfo,
  ProductCompositeChartProps,
} from "../../../../../type";
import { stringify } from "querystring";
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg text-sm space-y-1">
      <div className="font-semibold text-base">{data.name}</div>
      <div>Date: {data.date}</div>
      <div>Revenue: ${data.revenue.toLocaleString()}</div>
      <div>Cost: ${data.cost.toLocaleString()}</div>
      <div>Margin: {data.margin.toFixed(2)}%</div>
    </div>
  )
}
export const ProductCompositeChart: React.FC<ProductCompositeChartProps> = ({
  orders,
}) => {
  console.log("orders:", orders);
  
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart data={orders}>
        <XAxis dataKey="date" />

        <YAxis
          yAxisId="money"
          orientation="left"
          tickFormatter={(v) => `$${v.toLocaleString()}`}
        />

   

        <YAxis
          yAxisId="margin"
          orientation="right"
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {/* Revenue volume */}
        <Bar
          yAxisId="volume"
          dataKey="revenue"
          barSize={28}
          fill="#999"
          opacity={0.25}
          name="Revenue"
        />

        {/* Cost */}
        <Line
          yAxisId="money"
          type="monotone"
          dataKey="cost"
          stroke="#ff4d4f"
          dot={false}
          name="Cost"
        />

        {/* Revenue trend */}
        <Line
          yAxisId="money"
          type="monotone"
          dataKey="revenue"
          stroke="#52c41a"
          dot={false}
          name="Revenue Trend"
        />

        {/* Margin */}
        <Line
          yAxisId="margin"
          type="monotone"
          dataKey="margin"
          stroke="#1677ff"
          dot={false}
          name="Margin (%)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
