'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { AppointmentsByType } from '@/types';

interface AppointmentsDonutProps {
  data: AppointmentsByType[];
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  URGENCY: 'Urgencia',
  SURGERY: 'Cirugía',
  VACCINATION: 'Vacunación',
  GROOMING: 'Estética',
};

const TYPE_COLORS: Record<string, string> = {
  CONSULTATION: '#3b82f6',
  URGENCY: '#ef4444',
  SURGERY: '#8b5cf6',
  VACCINATION: '#22c55e',
  GROOMING: '#f59e0b',
};

export function AppointmentsDonut({ data, isLoading }: AppointmentsDonutProps) {
  const chartData = data?.map((d) => ({
    name: TYPE_LABELS[d.type] || d.type,
    value: d.count,
    color: TYPE_COLORS[d.type] || '#94a3b8',
  })) || [];

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return (
      <Card variant="elevated" className="overflow-hidden ghost-border">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <PieIcon className="h-4 w-4" />
            </div>
            Citas por tipo (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden ghost-border">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
            <PieIcon className="h-4 w-4" />
          </div>
          Citas por tipo (30 días)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Sin datos de citas en los últimos 30 días
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} citas`, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                }}
              />
              <Legend
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="mt-2 text-center">
          <span className="text-2xl font-display font-bold">{total}</span>
          <span className="text-sm text-muted-foreground ml-2">citas totales</span>
        </div>
      </CardContent>
    </Card>
  );
}
