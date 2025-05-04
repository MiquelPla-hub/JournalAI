import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Placeholder data structure
const data = [
  { name: '10:00', happy: 4, sad: 2, neutral: 10 },
  { name: '10:05', happy: 3, sad: 1, neutral: 12 },
  { name: '10:10', happy: 5, sad: 3, neutral: 8 },
  { name: '10:15', happy: 2, sad: 4, neutral: 10 },
  { name: '10:20', happy: 6, sad: 1, neutral: 9 },
];

const EmotionTrends: React.FC = () => {
  // TODO: Fetch actual emotion data from local storage/state management

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-blue-200 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data} // Use actual data here
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="happy" stroke="#3b82f6" activeDot={{ r: 8 }} name="Happy" />
          <Line type="monotone" dataKey="sad" stroke="#ef4444" name="Sad" />
          <Line type="monotone" dataKey="neutral" stroke="#6b7280" name="Neutral" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionTrends;

