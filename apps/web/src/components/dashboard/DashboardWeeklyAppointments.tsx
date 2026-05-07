'use client';

import { Calendar, Plus, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { appointmentTypes } from '@/lib/appointment-types';
import Link from 'next/link';
import type { Appointment } from '@/types';

interface DashboardWeeklyAppointmentsProps {
  appointments: Appointment[];
  isLoading: boolean;
  todayStr: string;
}

export function DashboardWeeklyAppointments({ appointments, isLoading, todayStr }: DashboardWeeklyAppointmentsProps) {
  return (
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
    
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
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
          {appointments.slice(0, 8).map((apt: Appointment, index: number) => {
            const typeInfo = appointmentTypes?.find((t) => t.value === apt.type);
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
  );
}
