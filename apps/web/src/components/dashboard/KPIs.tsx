'use client';

import { Calendar, ShoppingCart, UserX, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardKPIs } from '@/types';

interface KPIsProps {
  kpis: DashboardKPIs | undefined;
  todayCount: number;
}

export function KPIs({ kpis, todayCount }: KPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[hsl(var(--primary)_/_0.1)] rounded-lg text-[hsl(var(--primary))]">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] px-2 py-1 rounded-full uppercase tracking-tighter">Hoy</span>
        </div>
        <p className="label-md uppercase tracking-widest text-[hsl(var(--on-surface-variant))] font-medium mb-1">Citas Hoy</p>
        <p className="text-4xl font-extrabold text-[hsl(var(--on-surface))] mt-1">
          {kpis?.appointments?.today ?? todayCount}
        </p>
        <p className="text-xs text-[hsl(var(--secondary))] mt-2 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{kpis?.appointments?.delta ?? 0}% vs ayer</span>
        </p>
      </div>

      <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[hsl(var(--secondary-container)_/_0.3)] rounded-lg text-[hsl(var(--secondary))]">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="w-24 h-10 flex items-end gap-1">
            <div className="flex-1 bg-[hsl(var(--primary)_/_0.2)] h-[40%] rounded-t-sm" />
            <div className="flex-1 bg-[hsl(var(--primary)_/_0.2)] h-[60%] rounded-t-sm" />
            <div className="flex-1 bg-[hsl(var(--primary)_/_0.2)] h-[50%] rounded-t-sm" />
            <div className="flex-1 bg-[hsl(var(--primary)_/_0.4)] h-[80%] rounded-t-sm" />
            <div className="flex-1 bg-[hsl(var(--primary)_/_0.6)] h-[100%] rounded-t-sm" />
          </div>
        </div>
        <p className="label-md uppercase tracking-widest text-[hsl(var(--on-surface-variant))] font-medium mb-1">Ingresos Mensuales</p>
        <p className="text-4xl font-extrabold text-[hsl(var(--on-surface))] mt-1">
          {formatCurrency(kpis?.revenue?.currentMonth ?? 0)}
        </p>
        <p className="text-xs text-[hsl(var(--secondary))] mt-2 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>Meta: {formatCurrency(15000)}</span>
        </p>
      </div>

      <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[hsl(var(--tertiary-container)_/_0.3)] rounded-lg text-[hsl(var(--tertiary))]">
            <UserX className="h-5 w-5" />
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[hsl(var(--primary))] flex items-center justify-center text-white text-[10px] font-bold">A</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[hsl(var(--secondary-container))] flex items-center justify-center text-[hsl(var(--on-secondary-container))] text-[10px] font-bold">M</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[hsl(var(--surface-high))] flex items-center justify-center text-[hsl(var(--muted-foreground))] text-[10px] font-bold">+8</div>
          </div>
        </div>
        <p className="label-md uppercase tracking-widest text-[hsl(var(--on-surface-variant))] font-medium mb-1">Nuevos Pacientes</p>
        <p className="text-4xl font-extrabold text-[hsl(var(--on-surface))] mt-1">
          {kpis?.clients?.newThisMonth ?? 0}
        </p>
        <p className="text-xs text-[hsl(var(--tertiary))] mt-2 flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Crecimiento activo</span>
        </p>
      </div>
    </div>
  );
}
