'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/use-clients';
import { useCreateMedicalRecord } from '@/hooks/use-medical-records';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { FileText, Calendar, Clock, User, PawPrint, Plus, Stethoscope, X, CalendarCheck, Pill } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PrescriptionForm, PrescriptionList } from '@/components/prescriptions/prescription-form';
import { FollowUpDialog } from '@/components/medical-records/follow-up-dialog';
import { RecordDetailDialog } from '@/components/medical-records/record-detail-dialog';
import { Eye } from 'lucide-react';

export default function MedicalRecordsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedVetId, setSelectedVetId] = useState('');
  const [detailDialog, setDetailDialog] = useState<{ petId: string; petName: string; petSpecies?: string; petBreed?: string; clientName: string } | null>(null);
  const [newRecord, setNewRecord] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: '',
    treatment: '',
  });

  const { data: clientsData, isLoading } = useClients();
  const { data: veterinarians } = useQuery({
    queryKey: ['veterinarians'],
    queryFn: () => usersApi.getVeterinarians().then((res) => res.data),
  });

  const createMutation = useCreateMedicalRecord();

  const clients = clientsData?.data || [];
  const selectedClient = clients.find((c: any) => c.id === selectedClientId);
  const selectedPet = selectedClient?.pets?.find((p: any) => p.id === selectedPetId);

  const handleCreate = async () => {
    if (!selectedPetId || !selectedVetId) return;
    await createMutation.mutateAsync({
      petId: selectedPetId,
      veterinarianId: selectedVetId,
      ...newRecord,
    });
    setIsDialogOpen(false);
    setSelectedClientId('');
    setSelectedPetId('');
    setSelectedVetId('');
    setNewRecord({
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      diagnosis: '',
      treatment: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Expedientes clínicos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length || 0} clientes registrados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo expediente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                Nuevo expediente médico
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={selectedClientId} onValueChange={(v) => { setSelectedClientId(v); setSelectedPetId(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mascota *</Label>
                  <Select value={selectedPetId} onValueChange={setSelectedPetId} disabled={!selectedClient?.pets?.length}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedClient?.pets?.map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Veterinario *</Label>
                <Select value={selectedVetId} onValueChange={setSelectedVetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar veterinario" />
                  </SelectTrigger>
                  <SelectContent>
                    {veterinarians?.map((vet: any) => (
                      <SelectItem key={vet.id} value={vet.id}>
                        Dr. {vet.firstName} {vet.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Nota SOAP</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Subjetivo (S)</Label>
                    <Textarea 
                      placeholder="Síntomas reportados por el propietario..."
                      value={newRecord.subjective}
                      onChange={(e) => setNewRecord({ ...newRecord, subjective: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Objetivo (O)</Label>
                    <Textarea 
                      placeholder="Hallazgos del examen físico..."
                      value={newRecord.objective}
                      onChange={(e) => setNewRecord({ ...newRecord, objective: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Evaluación (A)</Label>
                    <Textarea 
                      placeholder="Diagnóstico presuntivo..."
                      value={newRecord.assessment}
                      onChange={(e) => setNewRecord({ ...newRecord, assessment: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Plan (P)</Label>
                    <Textarea 
                      placeholder="Tratamiento y recomendaciones..."
                      value={newRecord.plan}
                      onChange={(e) => setNewRecord({ ...newRecord, plan: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Diagnóstico</Label>
                  <Input 
                    placeholder="Diagnóstico principal"
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tratamiento</Label>
                  <Input 
                    placeholder="Tratamiento indicado"
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreate}
                disabled={createMutation.isPending || !selectedPetId || !selectedVetId}
              >
                {createMutation.isPending ? 'Guardando...' : 'Crear expediente'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState 
              variant="medical-records"
              className="py-16"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {clients.map((client: any, idx: number) => (
            <Card 
              key={client.id} 
              className="overflow-hidden hover-lift animate-slide-up"
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-display font-bold text-lg">
                      {client.firstName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {client.firstName} {client.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {client.phone}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {client.pets?.length || 0} mascotas
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {client.pets && client.pets.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {client.pets.map((pet: any) => (
                      <div key={pet.id} className="p-6 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10 text-secondary">
                              <PawPrint className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{pet.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {pet.species} {pet.breed && `• ${pet.breed}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {pet.gender && (
                              <Badge variant="outline" className="text-xs">
                                {pet.gender}
                              </Badge>
                            )}
                            {pet.weight && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {pet.weight} kg
                              </Badge>
                            )}
                            {pet.medicalRecords && pet.medicalRecords.length > 0 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setDetailDialog({
                                    petId: pet.id,
                                    petName: pet.name,
                                    petSpecies: pet.species,
                                    petBreed: pet.breed,
                                    clientName: `${client.firstName} ${client.lastName}`,
                                  })}
                                  className="text-muted-foreground hover:text-primary"
                                  aria-label="Ver expediente"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <PrescriptionForm 
                                  medicalRecordId={pet.medicalRecords[0]?.id} 
                                  petName={pet.name} 
                                />
                                <FollowUpDialog 
                                  recordId={pet.medicalRecords[0]?.id} 
                                  petName={pet.name} 
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {pet.vaccinations && pet.vaccinations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              Vacunas ({pet.vaccinations.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {pet.vaccinations.map((vac: any) => (
                                <Badge key={vac.id} variant="vaccination" size="sm">
                                  {vac.vaccineName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {pet.weightHistory && pet.weightHistory.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Historial de peso
                            </p>
                            <div className="flex gap-4">
                              {pet.weightHistory.map((wh: any) => (
                                <div key={wh.id} className="text-center p-3 rounded-xl bg-muted/30">
                                  <p className="font-mono font-bold text-lg">{wh.weight}kg</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(wh.recordedAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin mascotas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Record Detail Dialog */}
      {detailDialog && (
        <RecordDetailDialog
          petId={detailDialog.petId}
          petName={detailDialog.petName}
          petSpecies={detailDialog.petSpecies}
          petBreed={detailDialog.petBreed}
          clientName={detailDialog.clientName}
          open={!!detailDialog}
          onOpenChange={(open) => !open && setDetailDialog(null)}
        />
      )}
    </div>
  );
}
