'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/use-clients';
import { useCreatePet, useDeletePet } from '@/hooks/use-pets';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus, Search, Phone, Mail, Dog, PawPrint, MapPin, Calendar, MoreHorizontal, Edit, Trash2, UserPlus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, defaultClientValues, type ClientFormValues } from '@/lib/validations/client';
import { petSchema, defaultPetValues, speciesOptions, genderOptions, type PetFormValues } from '@/lib/validations/pet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonListGrid } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [petDialogClient, setPetDialogClient] = useState<any>(null);
  const [deletePetTarget, setDeletePetTarget] = useState<{ id: string; clientId: string } | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultClientValues,
  });

  const petForm = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: defaultPetValues,
  });

  const { data: clientsData, isLoading } = useClients({ search: debouncedSearch, page });
  const clients = clientsData?.data || [];
  const totalPages = clientsData?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();
  const createPetMutation = useCreatePet();
  const deletePetMutation = useDeletePet();

  const handleCreate = async (data: ClientFormValues) => {
    const payload = {
      ...data,
      email: data.email || undefined,
      address: data.address || undefined,
      rfc: data.rfc || undefined,
    };
    await createMutation.mutateAsync(payload);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleUpdate = async () => {
    if (!editingClient) return;

    const cleanedData = {
      firstName: editingClient.firstName || undefined,
      lastName: editingClient.lastName || undefined,
      phone: editingClient.phone || undefined,
      email: editingClient.email || undefined,
      address: editingClient.address || undefined,
      rfc: editingClient.rfc || undefined,
    };

    await updateMutation.mutateAsync({
      id: editingClient.id,
      data: cleanedData,
    });
    setEditingClient(null);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget);
    setDeleteTarget(null);
    setEditingClient(null);
  };

  const handleCreatePet = async (data: any) => {
    if (!petDialogClient) return;
    await createPetMutation.mutateAsync({
      clientId: petDialogClient.id,
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        gender: data.gender || undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        microchip: data.microchip || undefined,
      },
    });
    setPetDialogClient(null);
    petForm.reset();
  };

  const confirmDeletePet = async () => {
    if (!deletePetTarget) return;
    await deletePetMutation.mutateAsync(deletePetTarget.id);
    setDeletePetTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-4 w-4" />
                </div>
                Nuevo cliente
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre(s) *</Label>
                  <Input
                    placeholder="Juan"
                    state={form.formState.errors.firstName ? 'error' : undefined}
                    {...form.register('firstName')}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Apellido(s) *</Label>
                  <Input
                    placeholder="Pérez"
                    state={form.formState.errors.lastName ? 'error' : undefined}
                    {...form.register('lastName')}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Teléfono *</Label>
                <Input
                  placeholder="5551234567"
                  state={form.formState.errors.phone ? 'error' : undefined}
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email (opcional)</Label>
                <Input
                  type="email"
                  placeholder="juan@email.com"
                  state={form.formState.errors.email ? 'error' : undefined}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Dirección (opcional)</Label>
                <Input
                  placeholder="Calle 123, Col. Centro"
                  {...form.register('address')}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || !form.formState.isValid}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear cliente'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 py-3 px-4 rounded-xl bg-[hsl(var(--surface-low))] ghost-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total de clientes:</span>
          <span className="font-display font-bold text-lg">{clients.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Con mascotas:</span>
          <span className="font-display font-bold text-lg text-primary">
            {clients.filter((c: any) => c.pets?.length > 0).length || 0}
          </span>
        </div>
      </div>

      {/* Clients grid */}
      {isLoading ? (
        <SkeletonListGrid items={6} />
      ) : clients.length === 0 ? (
        search ? (
          <EmptyState 
            variant="search" 
            customTitle="Sin resultados de búsqueda"
            customDescription={`No se encontraron clientes para "${search}"`}
            action={{ label: 'Limpiar búsqueda', onClick: () => setSearch('') }}
          />
        ) : (
          <EmptyState 
            variant="clients" 
            action={{ label: 'Agregar cliente', onClick: () => setIsDialogOpen(true) }}
          />
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any, index: number) => (
            <Card 
              key={client.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-display font-bold text-lg">
                      {client.firstName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {client.firstName} {client.lastName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {client.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingClient(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="font-mono">{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
                
                {client.pets && client.pets.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <PawPrint className="h-3 w-3" />
                      Mascotas ({client.pets.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {client.pets.slice(0, 3).map((pet: any) => (
                        <Badge
                          key={pet.id}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive group/pet"
                          onClick={() => setDeletePetTarget({ id: pet.id, clientId: client.id })}
                        >
                          {pet.name}
                          <X className="h-3 w-3 ml-1 opacity-0 group-hover/pet:opacity-100" />
                        </Badge>
                      ))}
                      {client.pets.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.pets.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setPetDialogClient(client);
                    petForm.reset();
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar mascota
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Edit className="h-4 w-4" />
              </div>
              Editar cliente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input
                  value={editingClient?.firstName || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido(s)</Label>
                <Input
                  value={editingClient?.lastName || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={editingClient?.phone || ''}
                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editingClient?.email || ''}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={editingClient?.address || ''}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>RFC</Label>
              <Input
                value={editingClient?.rfc || ''}
                onChange={(e) => setEditingClient({ ...editingClient, rfc: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => handleDelete(editingClient.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar cliente"
        description="¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!deletePetTarget}
        onOpenChange={(open) => !open && setDeletePetTarget(null)}
        title="Eliminar mascota"
        description="¿Estás seguro de eliminar esta mascota? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={confirmDeletePet}
        isLoading={deletePetMutation.isPending}
      />

      <Dialog open={!!petDialogClient} onOpenChange={(open) => !open && setPetDialogClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <PawPrint className="h-4 w-4" />
              </div>
              Nueva mascota para {petDialogClient?.firstName}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={petForm.handleSubmit(handleCreatePet)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Firulais"
                {...petForm.register('name')}
                className={petForm.formState.errors.name ? 'border-destructive' : ''}
              />
              {petForm.formState.errors.name && (
                <p className="text-xs text-destructive">{petForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Especie *</Label>
                <Select
                  value={petForm.watch('species')}
                  onValueChange={(value) => petForm.setValue('species', value)}
                >
                  <SelectTrigger className={petForm.formState.errors.species ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {petForm.formState.errors.species && (
                  <p className="text-xs text-destructive">{petForm.formState.errors.species.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Género</Label>
                <Select
                  value={petForm.watch('gender')}
                  onValueChange={(value) => petForm.setValue('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raza</Label>
              <Input
                placeholder="Labrador, Siamés, etc."
                {...petForm.register('breed')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  {...petForm.register('weight')}
                />
              </div>
              <div className="space-y-2">
                <Label>Microchip</Label>
                <Input
                  placeholder="Opcional"
                  {...petForm.register('microchip')}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createPetMutation.isPending || !petForm.formState.isValid}
            >
              {createPetMutation.isPending ? 'Agregando...' : 'Agregar mascota'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}