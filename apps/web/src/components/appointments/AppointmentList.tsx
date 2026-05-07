'use client';

import { Calendar as CalendarIcon, Clock, User, Dog, Stethoscope, Check, Send, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { appointmentTypes, typeBadgeVariant } from '@/lib/appointment-types';
import { SkeletonAppointmentCard } from '@/components/appointments/AppointmentSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { Appointment } from '@/types';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onResend: (id: string) => void;
  isResending: boolean;
  onCreateNew: () => void;
}

export function AppointmentList({
  appointments,
  isLoading,
  onDelete,
  onResend,
  isResending,
  onCreateNew,
}: AppointmentListProps) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonAppointmentCard key={i} />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <EmptyState 
        variant="appointments" 
        action={{ label: 'Agendar cita', onClick: onCreateNew }}
      />
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {appointments.map((apt: Appointment, index: number) => {
        const typeInfo = appointmentTypes.find((t) => t.value === apt.type);
        const TypeIcon = typeInfo?.icon || Stethoscope;
        
        return (
          <div
            key={apt.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors animate-slide-up group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div
                className="hidden sm:block w-1.5 h-14 rounded-full flex-shrink-0"
                style={{ backgroundColor: apt.colorCode || typeInfo?.color }}
              />
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white flex-shrink-0"
                style={{ backgroundColor: typeInfo?.color }}
              >
                <TypeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Dog className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium truncate">{apt.pet.name}</span>
                  <Badge variant={typeBadgeVariant[apt.type] as any} className="flex-shrink-0">
                    {typeInfo?.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {apt.pet.client.firstName} {apt.pet.client.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 pl-14 sm:pl-0">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm font-mono">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDateTime(apt.dateTime)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                </div>
              </div>

              {apt.confirmedAt ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                  <Check className="h-3 w-3" />
                  Confirmada
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => onResend(apt.id)}
                  disabled={isResending}
                >
                  <Send className="h-3 w-3" />
                  Reenviar
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(apt.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
