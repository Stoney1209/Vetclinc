'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppointments, useCreateAppointment, useDeleteAppointment, useConfirmAppointment, useResendConfirmation } from '@/hooks/use-appointments';
import { useClients } from '@/hooks/use-clients';
import { useVeterinarians } from '@/hooks/use-veterinarians';
import { formatDateTime, cn } from '@/lib/utils';
import { appointmentTypes, typeBadgeVariant } from '@/lib/appointment-types';
import { Calendar as CalendarIcon, Plus, Clock, User, Dog, Stethoscope, Syringe, Scissors, AlertCircle, X, LayoutGrid, List, ArrowRight, Check, Mail, Send } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import dynamic from 'next/dynamic';

const CalendarView = dynamic(
  () => import('@/components/calendar/calendar-view').then((mod) => ({ default: mod.CalendarView })),
  { ssr: false, loading: () => <div className="h-[600px] flex items-center justify-center"><p className="text-muted-foreground">Cargando calendario...</p></div> }
);

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    petId: '',
    doctorId: '',
    dateTime: '',
    duration: 30,
    type: 'CONSULTATION',
    notes: '',
  });

  const { data: appointmentsData, isLoading } = useAppointments({ ...filters, page });
  const appointments = appointmentsData?.data || [];
  const totalPages = appointmentsData?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data: clientsData } = useClients();
  const clients = Array.isArray(clientsData?.data) ? clientsData.data : [];
  const { data: veterinarians } = useVeterinarians();

  const createMutation = useCreateAppointment();
  const deleteMutation = useDeleteAppointment();
  const confirmMutation = useConfirmAppointment();
  const resendMutation = useResendConfirmation();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      ...newAppointment,
      dateTime: new Date(newAppointment.dateTime).toISOString(),
    });
    setIsDialogOpen(false);
    setNewAppointment({
      petId: '',
      doctorId: '',
      dateTime: '',
      duration: 30,
      type: 'CONSULTATION',
      notes: '',
    });
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with view toggle and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-[hsl(var(--surface-low))] rounded-xl">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Calendario
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Nueva cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                Nueva cita
              </DialogTitle>
              <DialogDescription>
                Complete los datos para agendar una nueva cita
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Cliente y Mascota</Label>
                <Select
                  value={newAppointment.petId}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, petId: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client: any) =>
                      client.pets.map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          <div className="flex items-center gap-2">
                            <Dog className="h-4 w-4" />
                            {client.firstName} {client.lastName} - {pet.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Veterinario</Label>
                <Select
                  value={newAppointment.doctorId}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, doctorId: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar veterinario" />
                  </SelectTrigger>
                  <SelectContent>
                    {veterinarians?.map((vet: any) => (
                      <SelectItem key={vet.id} value={vet.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Dr. {vet.firstName} {vet.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha y hora</Label>
                  <Input
                    type="datetime-local"
                    className="h-11"
                    value={newAppointment.dateTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, dateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración (min)</Label>
                  <Input
                    type="number"
                    className="h-11"
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de cita</Label>
                <Select
                  value={newAppointment.type}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, type: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }} 
                            />
                            <Icon className="h-4 w-4" style={{ color: type.color }} />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Notas adicionales para la cita..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                className="w-full h-11"
                onClick={handleCreate}
                disabled={createMutation.isPending || !newAppointment.petId || !newAppointment.doctorId || !newAppointment.dateTime}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear cita'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar - Premium date range selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
          {[
            { label: 'Hoy', days: 0 },
            { label: 'Semana', days: 7 },
            { label: 'Mes', days: 30 },
          ].map((preset) => {
            const isActive = (() => {
              const today = new Date();
              const start = new Date(filters.startDate);
              const presetStart = new Date(today);
              presetStart.setDate(presetStart.getDate());
              return start.toDateString() === presetStart.toDateString();
            })();
            
            return (
              <button
                key={preset.label}
                onClick={() => {
                  const today = new Date();
                  const start = new Date(today);
                  start.setHours(0, 0, 0, 0);
                  const end = new Date(today);
                  end.setDate(end.getDate() + preset.days);
                  end.setHours(23, 59, 59, 999);
                  setFilters({
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                  });
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/80 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"
                data-active={isActive}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Date range display */}
        <div 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card ambient-shadow ghost-border hover:bg-[hsl(var(--surface-low))] transition-colors duration-200 cursor-pointer"
          onClick={() => (document.getElementById('startDateInput') as HTMLInputElement)?.showPicker?.()}
        >
          <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {new Date(filters.startDate + 'T12:00:00').toLocaleDateString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">
              {new Date(filters.endDate + 'T12:00:00').toLocaleDateString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
          {/* Hidden date inputs triggered by clicking the display */}
          <input
            type="date"
            className="absolute opacity-0 w-0 h-0"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            id="startDateInput"
          />
          <input
            type="date"
            className="absolute opacity-0 w-0 h-0"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            id="endDateInput"
          />
        </div>
      </div>

      {/* Appointments List or Calendar View */}
      {view === 'calendar' ? (
        <CalendarView />
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Citas programadas
              <Badge variant="secondary" className="ml-2">
                {appointments.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--surface-low))]">
                    <div className="w-14 h-1.5 rounded-full bg-muted animate-pulse" />
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <EmptyState 
                variant="appointments" 
                action={{ label: 'Agendar cita', onClick: () => setIsDialogOpen(true) }}
              />
            ) : (
              <div className="divide-y divide-border/50">
                {appointments.map((apt: any, index: number) => {
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
                            <Badge variant={typeBadgeVariant[apt.type]} className="flex-shrink-0">
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
                            onClick={() => resendMutation.mutate(apt.id)}
                            disabled={resendMutation.isPending}
                          >
                            <Send className="h-3 w-3" />
                            Reenviar
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(apt.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          {view === 'list' && appointments.length > 0 && (
            <div className="p-4 border-t border-border/50">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Cancelar cita"
        description="¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer."
        confirmLabel="Cancelar cita"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando citas...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}