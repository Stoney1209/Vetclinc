'use client';

import { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useCalendar, useCreateAppointment, useDeleteAppointment } from '@/hooks/use-appointments';
import { useClients } from '@/hooks/use-clients';
import { useVeterinarians } from '@/hooks/use-veterinarians';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { appointmentTypes, typeBadgeVariant } from '@/lib/appointment-types';
import { formatDateTime, cn } from '@/lib/utils';
import {
  CalendarIcon,
  Plus,
  Clock,
  User,
  Dog,
  Stethoscope,
  Syringe,
  Scissors,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es },
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
}

interface CalendarViewProps {
  className?: string;
}

export function CalendarView({ className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    petId: '',
    doctorId: '',
    dateTime: '',
    duration: 30,
    type: 'CONSULTATION',
    notes: '',
  });

  const dateRange = useMemo(() => {
    if (currentView === Views.MONTH) {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      };
    }
    return {
      startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(addMonths(currentDate, 2)), 'yyyy-MM-dd'),
    };
  }, [currentDate, currentView]);

  const { data: appointmentsData, isLoading } = useCalendar(dateRange.startDate, dateRange.endDate);
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  const { data: clientsData } = useClients();
  const clients = Array.isArray(clientsData?.data) ? clientsData.data : [];
  const { data: veterinarians } = useVeterinarians();

  const createMutation = useCreateAppointment();
  const deleteMutation = useDeleteAppointment();

  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt: any) => {
      const typeInfo = appointmentTypes.find((t) => t.value === apt.type);
      const start = new Date(apt.dateTime);
      const end = addMinutes(start, apt.duration);
      return {
        id: apt.id,
        title: `${apt.pet?.name || 'Mascota'} - ${typeInfo?.label || apt.type}`,
        start,
        end,
        resource: apt,
      };
    });
  }, [appointments]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const apt = event.resource;
    const typeInfo = appointmentTypes.find((t) => t.value === apt.type);
    return {
      style: {
        backgroundColor: apt.colorCode || typeInfo?.color || '#3b82f6',
        borderRadius: '8px',
        opacity: apt.status === 'CANCELLED' ? 0.5 : 1,
        color: 'white',
        border: 'none',
        padding: '2px 8px',
        fontSize: '12px',
        fontWeight: 500,
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
    setIsCreating(false);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedEvent(null);
    setIsCreating(true);
    setNewAppointment({
      ...newAppointment,
      dateTime: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  }, [newAppointment]);

  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    setCurrentDate((prev) => {
      if (action === 'PREV') {
        return subMonths(prev, 1);
      }
      if (action === 'NEXT') {
        return addMonths(prev, 1);
      }
      return new Date();
    });
  }, []);

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
    setIsCreating(false);
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
    setIsDialogOpen(false);
    setSelectedEvent(null);
    setDeleteTarget(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as typeof Views[keyof typeof Views]);
  };

  const selectedApt = selectedEvent?.resource;
  const typeInfo = selectedApt ? appointmentTypes.find((t) => t.value === selectedApt.type) : null;
  const TypeIcon = typeInfo?.icon || Stethoscope;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleNavigate('PREV')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleNavigate('NEXT')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleNavigate('TODAY')}>
              Hoy
            </Button>
          </div>
          <h2 className="font-semibold text-lg">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === Views.MONTH ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange(Views.MONTH)}
          >
            Mes
          </Button>
          <Button
            variant={currentView === Views.WEEK ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange(Views.WEEK)}
          >
            Semana
          </Button>
          <Button
            variant={currentView === Views.DAY ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange(Views.DAY)}
          >
            Día
          </Button>
          <Button
            variant={currentView === Views.AGENDA ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange(Views.AGENDA)}
          >
            <List className="h-4 w-4 mr-1" />
            Agenda
          </Button>
        </div>
      </div>

        <CardContent className="p-2 sm:p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] sm:h-[600px] w-full" />
            </div>
          ) : (
            <div className="h-[400px] sm:h-[600px] overflow-x-auto">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minWidth: currentView === 'month' ? '600px' : 'auto' }}
                date={currentDate}
                view={currentView}
                onNavigate={setCurrentDate}
                onView={handleViewChange}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                culture="es"
                messages={{
                  today: 'Hoy',
                  previous: 'Atrás',
                  next: 'Siguiente',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  agenda: 'Agenda',
                  noEventsInRange: 'No hay citas en este período.',
                }}
                components={{
                  event: ({ event }) => (
                    <div className="font-medium text-xs truncate">
                      {event.title}
                    </div>
                  ),
                }}
              />
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {isCreating ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Plus className="h-4 w-4" />
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
            </>
          ) : selectedEvent ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: typeInfo?.color }}
                  >
                    <TypeIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Dog className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApt?.pet?.name || 'Mascota'}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="mt-1"
                      style={{ backgroundColor: typeInfo?.color + '20', color: typeInfo?.color }}
                    >
                      {typeInfo?.label}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detalles de la cita
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedApt?.pet?.client?.firstName} {selectedApt?.pet?.client?.lastName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Veterinario</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Dr. {selectedApt?.doctor?.firstName} {selectedApt?.doctor?.lastName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha y hora</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDateTime(selectedApt?.dateTime)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="font-medium">{selectedApt?.duration} minutos</p>
                  </div>
                </div>

                {selectedApt?.room && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sala</p>
                    <p className="font-medium">{selectedApt?.room?.name}</p>
                  </div>
                )}

                {selectedApt?.notes && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedApt?.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(selectedEvent.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Cancelando...' : 'Cancelar cita'}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Cancelar cita"
        description="¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer."
        confirmLabel="Cancelar cita"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
}
