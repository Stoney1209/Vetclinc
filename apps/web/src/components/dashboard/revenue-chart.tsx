'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import type { RevenueByDay } from '@/types';

interface RevenueChartProps {
  data: RevenueByDay[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const chartData = data?.map((d) => ({
    date: new Date(d.date + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
    }),
    total: d.total,
  })) || [];

  const totalRevenue = chartData.reduce((sum, d) => sum + d.total, 0);

  if (isLoading) {
    return (
      <Card variant="elevated" className="overflow-hidden ghost-border">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            Ingresos últimos 7 días
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] flex items-center justify-center">
            <div className="space-y-3 w-full">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="bg-muted rounded animate-pulse" style={{ height: `${20 + Math.random() * 150}px`, width: '100%' }} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden ghost-border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            Ingresos últimos 7 días
          </CardTitle>
          <span className="text-sm font-mono font-semibold text-primary">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[280px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Sin datos de ingresos en los últimos 7 días
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(value as number), 'Ingresos']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                }}
              />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
