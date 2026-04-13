'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ShoppingCart, 
  AlertTriangle,
  ChevronRight,
  PawPrint,
  CalendarCheck,
  UserX,
  TrendingUp,
  Users,
  Plus,
} from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';
import { useLowStock } from '@/hooks/use-inventory';
import { useDashboardKPIs, useRevenueByDay, useAppointmentsByType } from '@/hooks/use-reports';
import { useUpcomingFollowUps } from '@/hooks/use-prescriptions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { appointmentTypes } from '@/lib/appointment-types';
import Link from 'next/link';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { AppointmentsDonut } from '@/components/dashboard/appointments-donut';

export default function DashboardPage() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: revenue, isLoading: revenueLoading } = useRevenueByDay(7);
  const { data: appointmentsByType, isLoading: typeLoading } = useAppointmentsByType(30);
  const { data: lowStock } = useLowStock();
  const { data: followUps } = useUpcomingFollowUps();

  const { data: todayAppointmentsData, isLoading: todayLoading } = useAppointments({ 
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
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--on-primary-fixed-variant))]">
            Bienvenido de nuevo
          </h2>
          <p className="text-[hsl(var(--on-surface-variant))] mt-1">Monitoreo del rendimiento clínico y flujo de pacientes.</p>
        </div>
      </div>

      {/* KPI Grid */}
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
              {kpis?.appointments?.today ?? todayAppointments.length}
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
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[hsl(var(--primary)] flex items-center justify-center text-white text-[10px] font-bold">A</div>
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

        {/* Main Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Weekly Calendar */}
            <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[hsl(var(--on-primary-fixed-variant))]">
                  Citas de la Semana
                </h3>
                <Link href="/appointments">
                  <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] text-xs font-bold hover:underline">
                    Ver todas
                  </Button>
                </Link>
              </div>
            
            {weeklyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : weeklyAppointments.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No hay citas en los próximos 7 días</p>
                <Link href="/appointments?action=new">
                  <Button className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar cita
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {weeklyAppointments.slice(0, 8).map((apt: any, index: number) => {
                  const typeInfo = appointmentTypes?.find((t: any) => t.value === apt.type);
                  const aptDate = new Date(apt.dateTime);
                  const isToday = aptDate.toISOString().split('T')[0] === todayStr;
                  
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--surface-low))] hover:bg-[hsl(var(--surface-high))] transition-colors group animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className="w-1.5 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: apt.colorCode || typeInfo?.color || 'hsl(var(--primary))' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[hsl(var(--on-surface))] truncate">
                            {apt.pet?.name || 'Mascota'}
                          </p>
                          {isToday && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">Hoy</Badge>
                          )}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {apt.pet?.species || 'Mascota'} • {typeInfo?.label || apt.type}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-[hsl(var(--on-surface))]">
                          {aptDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {aptDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueChart data={revenue || []} isLoading={revenueLoading} />
              <AppointmentsDonut data={appointmentsByType || []} isLoading={typeLoading} />
            </div>
          </div>

          {/* Side Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[hsl(var(--on-primary-fixed-variant))]">Próximas Citas</h3>
                <Link href="/appointments">
                  <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] text-xs font-bold hover:underline">
                    Ver todas
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {todayAppointments.slice(0, 3).map((apt: any) => (
                  <div key={apt.id} className="flex items-center gap-4 p-3 hover:bg-[hsl(var(--surface-low))] rounded-lg transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--secondary-container))]/50 flex items-center justify-center text-[hsl(var(--secondary))]">
                      <PawPrint className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[hsl(var(--on-surface))]">{apt.pet.name}</h4>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                        {apt.pet.species || 'Mascota'} • {new Date(apt.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts - Ghost Border Error Indicator */}
            <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border relative">
              <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-[hsl(var(--destructive))]/40" />
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--on-surface))]">Alertas de Stock Bajo</h3>
              </div>
              <div className="space-y-3">
                {lowStock && lowStock.length > 0 ? (
                  lowStock.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="flex justify-between items-center text-xs">
                      <span className="text-[hsl(var(--on-surface-variant))]">{product.name}</span>
                      <span className="font-bold text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-2 py-0.5 rounded-full">
                        {product.stock} unidades
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground font-medium">No hay alertas de stock bajo</p>
                  </div>
                )}
              </div>
              <Link href="/inventory">
                <Button className="w-full mt-4 text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-widest text-center ghost-border py-2 rounded hover:bg-[hsl(var(--primary))]/5 transition-colors" variant="ghost">
                  Ordenar suministros
                </Button>
              </Link>
            </div>

            {/* Follow-ups */}
            {followUps && followUps.length > 0 && (
              <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-[hsl(var(--on-primary-fixed-variant))]">Seguimientos</h3>
                  <span className="text-[10px] font-bold text-[hsl(var(--tertiary))] bg-[hsl(var(--tertiary))]/10 px-2 py-0.5 rounded-full">{followUps.length}</span>
                </div>
                <div className="space-y-3">
                  {followUps.slice(0, 2).map((fu: any) => (
                    <div key={fu.id} className="flex items-center gap-3 p-2 hover:bg-[hsl(var(--surface-low))] rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary-container))]/20 flex items-center justify-center text-[hsl(var(--primary))]">
                        <CalendarCheck className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[hsl(var(--on-surface))]">{fu.pet.name}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(fu.followUpDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}