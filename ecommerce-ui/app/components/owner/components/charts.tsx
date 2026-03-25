
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { UserProfile } from '../../../../type';
type chart = {


}

export const BehavioralRadar: React.FC<{ behavior: UserProfile['behavior'] }> = ({ behavior }) => {
  const data = [
    { subject: 'Mua thường xuyên', value: behavior.purchase_frequency_score * 100 },
    { subject: 'Trung thành', value: behavior.loyalty_score * 100 },
    { subject: 'Khả năng quay lại', value: (1 - behavior.churn_risk) * 100 },
  ];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
          <PolarGrid strokeOpacity={0.3} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            axisLine={false}
          />

          {/* full mark */}
          <Radar
            dataKey={() => 100}
            stroke="#e5e7eb"
            fill="#e5e7eb"
            fillOpacity={0.15}
          />

          {/* actual behavior */}
          <Radar
            name="Hành vi khách hàng"
            dataKey="value"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.55}
          />

        <Tooltip
          formatter={(value) => {
          const num = typeof value === "number" ? value : Number(value);
          return [`${num.toFixed(0)}%`, ""];
        }}
        />

        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};


export const OrderPie: React.FC<{ orders: UserProfile['orders'] }> = ({ orders }) => {
  const data = [
    { name: 'Thành công', value: orders.confirmed_orders },
    { name: 'Hủy', value: orders.cancelled_orders },
  ];

  const COLORS = ['#10b981', '#ef4444'];
  const total = orders.confirmed_orders + orders.cancelled_orders;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) =>
              `${name}: ${((value / total) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip
              formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value);
              return [`${num.toFixed(0)}%`, ""];
            }}
          />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
