// import React from 'react';
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import { UserProfile } from '../../../../type';

// export const OrderPie: React.FC<{ orders: UserProfile['orders'] }> = ({ orders }) => {
//   const data = [
//     { name: 'Thành công', value: orders.confirmed_orders },
//     { name: 'Hủy', value: orders.cancelled_orders },
//   ];

//   const COLORS = ['#10b981', '#ef4444'];
//   const total = orders.confirmed_orders + orders.cancelled_orders;

//   return (
//     <div className="h-[220px] w-full">
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={85}
//             paddingAngle={4}
//             dataKey="value"
//             label={({ name, value }) => {
//               if (!total) return `${name}: 0%`;
//               return `${name}: ${((value / total) * 100).toFixed(0)}%`;
//             }}
//           >
//             {data.map((_, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index]} />
//             ))}
//           </Pie>

//           <Tooltip
//             formatter={(value, name) => {
//               if (typeof value === 'number') {
//                 return [`${value} đơn`, name];
//               }
//               return [value, name];
//             }}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };
