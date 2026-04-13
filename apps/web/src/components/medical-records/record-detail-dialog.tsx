'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, PawPrint, FileText, Stethoscope, Pill, Activity, Printer } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useMedicalRecords } from '@/hooks/use-medical-records';
import { usePrescriptions } from '@/hooks/use-prescriptions';
import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';

interface RecordDetailDialogProps {
  petId: string;
  petName: string;
  petSpecies?: string;
  petBreed?: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordDetailDialog({
  petId,
  petName,
  petSpecies,
  petBreed,
  clientName,
  open,
  onOpenChange,
}: RecordDetailDialogProps) {
  const { data: records, isLoading } = useMedicalRecords(petId);
  const recordsList = useMemo(() => records || [], [records]);
  const firstRecordId = recordsList.length > 0 ? recordsList[0].id : '';
  const { data: prescriptionsResponse } = usePrescriptions(firstRecordId);
  const prescriptions = useMemo(() => prescriptionsResponse || [], [prescriptionsResponse]);

  const handlePrint = useCallback(() => {
    const recordsHtml = recordsList.map((record: any, index: number) => `
      <div class="record">
        <h2>Expediente #${index + 1} - ${formatDate(record.createdAt)}</h2>
        <p><strong>Veterinario:</strong> ${record.veterinarian ? `Dr. ${record.veterinarian.firstName} ${record.veterinarian.lastName}` : 'N/A'}</p>
        ${record.subjective ? `<div class="soap"><p class="soap-label">Subjetivo (S)</p><p>${record.subjective}</p></div>` : ''}
        ${record.objective ? `<div class="soap"><p class="soap-label">Objetivo (O)</p><p>${record.objective}</p></div>` : ''}
        ${record.assessment ? `<div class="soap"><p class="soap-label">Evaluación (A)</p><p>${record.assessment}</p></div>` : ''}
        ${record.plan ? `<div class="soap"><p class="soap-label">Plan (P)</p><p>${record.plan}</p></div>` : ''}
        ${record.diagnosis ? `<p><strong>Diagnóstico:</strong> ${record.diagnosis}</p>` : ''}
        ${record.treatment ? `<p><strong>Tratamiento:</strong> ${record.treatment}</p>` : ''}
        ${record.followUpDate ? `<p><strong>Seguimiento:</strong> ${formatDate(record.followUpDate)}</p>` : ''}
        <p><span class="badge ${record.dischargedAt ? 'badge-discharged' : 'badge-active'}">${record.dischargedAt ? 'Dado de alta' : 'Activo'}</span></p>
      </div>
    `).join('');

    const prescriptionsHtml = prescriptions.length > 0 ? `
      <h2>Prescripciones (${prescriptions.length})</h2>
      ${prescriptions.map((rx: any) => `
        <div class="soap">
          <p><strong>${rx.medication}</strong></p>
          <p>${rx.dosage} • ${rx.frequency}${rx.duration ? ` • Duración: ${rx.duration}` : ''}</p>
        </div>
      `).join('')}
    ` : '';

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión. Verifica que tu navegador no bloquee las ventanas emergentes.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expediente Médico - ${petName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #1a1a1a; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
          h2 { color: #4a5568; margin-top: 20px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .record { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
          .soap { background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 8px; }
          .soap-label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .badge-active { background: #dbeafe; color: #1e40af; }
          .badge-discharged { background: #f0fdf4; color: #166534; }
          .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Expediente Médico - ${petName}</h1>
            <p><strong>Especie:</strong> ${petSpecies || 'N/A'} | <strong>Raza:</strong> ${petBreed || 'N/A'}</p>
            <p><strong>Propietario:</strong> ${clientName}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        ${recordsHtml}
        ${prescriptionsHtml}
        <div class="footer">
          <p>VetClinic Pro - Expediente generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [petName, petSpecies, petBreed, clientName, records, prescriptions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">{petName}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {petSpecies} {petBreed && `• ${petBreed}`} • Propietario: {clientName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : recordsList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay expedientes médicos registrados</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {recordsList.map((record: any, index: number) => (
                <Card key={record.id} className="ghost-border ambient-shadow hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Expediente #{index + 1}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.veterinarian && (
                          <Badge variant="secondary" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Dr. {record.veterinarian.firstName} {record.veterinarian.lastName}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* SOAP Notes */}
                    <div className="grid gap-3 mb-4">
                      {record.subjective && (
                        <div className="p-3 rounded-lg bg-[hsl(var(--surface-low))]">
                          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                            Subjetivo (S)
                          </p>
                          <p className="text-sm">{record.subjective}</p>
                        </div>
                      )}
                      {record.objective && (
                        <div className="p-3 rounded-lg bg-[hsl(var(--surface-low))]">
                          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                            Objetivo (O)
                          </p>
                          <p className="text-sm">{record.objective}</p>
                        </div>
                      )}
                      {record.assessment && (
                        <div className="p-3 rounded-lg bg-[hsl(var(--surface-low))]">
                          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                            Evaluación (A)
                          </p>
                          <p className="text-sm">{record.assessment}</p>
                        </div>
                      )}
                      {record.plan && (
                        <div className="p-3 rounded-lg bg-[hsl(var(--surface-low))]">
                          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                            Plan (P)
                          </p>
                          <p className="text-sm">{record.plan}</p>
                        </div>
                      )}
                    </div>

                    {/* Diagnosis & Treatment */}
                    {(record.diagnosis || record.treatment) && (
                      <div className="grid gap-3 sm:grid-cols-2 mb-4">
                        {record.diagnosis && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--tertiary-container))]/30">
                            <Stethoscope className="h-4 w-4 text-[hsl(var(--tertiary))] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-[hsl(var(--tertiary))] mb-0.5">Diagnóstico</p>
                              <p className="text-sm">{record.diagnosis}</p>
                            </div>
                          </div>
                        )}
                        {record.treatment && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--primary-container))]/20">
                            <Pill className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-[hsl(var(--primary))] mb-0.5">Tratamiento</p>
                              <p className="text-sm">{record.treatment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Follow-up */}
                    {record.followUpDate && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--secondary-container))]/30">
                        <Calendar className="h-4 w-4 text-[hsl(var(--secondary))]" />
                        <p className="text-sm">
                          Seguimiento: <span className="font-medium">{formatDate(record.followUpDate)}</span>
                        </p>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {prescriptions.length > 0 && record.id === firstRecordId && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          Prescripciones ({prescriptions.length})
                        </p>
                        <div className="space-y-2">
                          {prescriptions.map((rx: any) => (
                            <div key={rx.id} className="p-3 rounded-lg bg-[hsl(var(--surface-low))]">
                              <p className="text-sm font-medium">{rx.medication}</p>
                              <p className="text-xs text-muted-foreground">{rx.dosage} • {rx.frequency}</p>
                              {rx.duration && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  Duración: {rx.duration}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                      <Badge
                        variant={record.dischargedAt ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        {record.dischargedAt ? 'Dado de alta' : 'Activo'}
                      </Badge>
                      {record.dischargedAt && (
                        <p className="text-xs text-muted-foreground">
                          Alta: {formatDate(record.dischargedAt)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Usa {'"Guardar como PDF"'} en el di&aacute;logo de impresi&oacute;n
          </p>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
