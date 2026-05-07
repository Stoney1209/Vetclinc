'use client';

import { PawPrint, AlertTriangle, CalendarCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Appointment, Product, MedicalRecord } from '@/types';

interface DashboardSidebarProps {
  todayAppointments: Appointment[];
  lowStock: Product[] | undefined;
  followUps: MedicalRecord[] | undefined;
}

export function DashboardSidebar({ todayAppointments, lowStock, followUps }: DashboardSidebarProps) {
  return (
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
          {todayAppointments.slice(0, 3).map((apt: Appointment) => (
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

      {/* Low Stock Alerts */}
      <div className="bg-[hsl(var(--surface-lowest))] p-6 rounded-xl ambient-shadow ghost-border relative">
        <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-[hsl(var(--destructive))]/40" />
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
          <h3 className="text-sm font-bold text-[hsl(var(--on-surface))]">Alertas de Stock Bajo</h3>
        </div>
        <div className="space-y-3">
          {lowStock && lowStock.length > 0 ? (
            lowStock.slice(0, 3).map((product: Product) => (
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
            {followUps.slice(0, 2).map((fu: MedicalRecord) => (
              <div key={fu.id} className="flex items-center gap-3 p-2 hover:bg-[hsl(var(--surface-low))] rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary-container))]/20 flex items-center justify-center text-[hsl(var(--primary))]">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--on-surface))]">{fu.pet?.name || 'Mascota'}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(fu.followUpDate as any)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
