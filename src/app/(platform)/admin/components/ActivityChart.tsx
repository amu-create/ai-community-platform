'use client';

import { UserActivity } from '@/types/admin';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface ActivityChartProps {
  data: UserActivity[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd')
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="newUsers" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="New Users"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="posts" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Posts"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="comments" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          name="Comments"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="resources" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name="Resources"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
