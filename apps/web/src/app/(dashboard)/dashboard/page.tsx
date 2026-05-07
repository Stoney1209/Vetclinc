'use client';

import { useAppointments } from '@/hooks/use-appointments';
import { useLowStock } from '@/hooks/use-inventory';
import { useDashboardKPIs, useRevenueByDay, useAppointmentsByType } from '@/hooks/use-reports';
import { useUpcomingFollowUps } from '@/hooks/use-prescriptions';
import { SkeletonDashboard } from '@/components/dashboard/DashboardSkeleton';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { AppointmentsDonut } from '@/components/dashboard/appointments-donut';
import { KPIs } from '@/components/dashboard/KPIs';
import { DashboardWeeklyAppointments } from '@/components/dashboard/DashboardWeeklyAppointments';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardPage() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: revenue, isLoading: revenueLoading } = useRevenueByDay(7);
  const { data: appointmentsByType, isLoading: typeLoading } = useAppointmentsByType(30);
  const { data: lowStock } = useLowStock();
  const { data: followUps } = useUpcomingFollowUps();

  const { data: todayAppointmentsData } = useAppointments({ 
    startDate: todayStr, 
    endDate: todayStr,
    limit: 10
  });
  const todayAppointments = todayAppointmentsData?.data || [];

  const { data: weeklyAppointmentsData, isLoading: weeklyLoading } = useAppointments({
    startDate: todayStr,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    limit: 10
  });
  const weeklyAppointments = weeklyAppointmentsData?.data || [];

  if (kpisLoading && !kpis) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--on-primary-fixed-variant))]">
          Bienvenido de nuevo
        </h2>
        <p className="text-[hsl(var(--on-surface-variant))] mt-1">Monitoreo del rendimiento clínico y flujo de pacientes.</p>
      </div>

      {/* KPI Grid */}
      <KPIs kpis={kpis} todayCount={todayAppointments.length} />

      {/* Main Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardWeeklyAppointments 
            appointments={weeklyAppointments} 
            isLoading={weeklyLoading} 
            todayStr={todayStr} 
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart data={revenue || []} isLoading={revenueLoading} />
            <AppointmentsDonut data={appointmentsByType || []} isLoading={typeLoading} />
          </div>
        </div>

        {/* Side Panel (4 cols) */}
        <DashboardSidebar 
          todayAppointments={todayAppointments} 
          lowStock={lowStock} 
          followUps={followUps} 
        />
      </div>
    </div>
  );
}