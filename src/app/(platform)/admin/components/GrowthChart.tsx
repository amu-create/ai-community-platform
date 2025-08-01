'use client';

import { UserGrowth } from '@/types/admin';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

interface GrowthChartProps {
  data: UserGrowth[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
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
        <Bar 
          dataKey="users" 
          fill="#3b82f6" 
          name="Total Users"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="growth" 
          fill="#10b981" 
          name="New Users"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
