'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePrescriptions, useCreatePrescription } from '@/hooks/use-prescriptions';
import { useProducts } from '@/hooks/use-inventory';
import { Pill, Plus, Trash2, Clock, FileText } from 'lucide-react';
import type { Prescription, CreatePrescriptionItemDto } from '@/types';

interface PrescriptionFormProps {
  medicalRecordId: string;
  petName?: string;
}

const emptyItem: CreatePrescriptionItemDto = {
  productName: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: 1,
  instructions: '',
  productId: '',
};

export function PrescriptionForm({ medicalRecordId, petName }: PrescriptionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreatePrescriptionItemDto[]>([{ ...emptyItem }]);

  const { data: products } = useProducts();
  const createMutation = useCreatePrescription();
  const productList = products?.data || [];

  const addItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof CreatePrescriptionItemDto, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'productId' && typeof value === 'string' && value) {
      const product = productList.find((p: any) => p.id === value);
      if (product) {
        updated[index].productName = product.name;
      }
    }

    setItems(updated);
  };

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.productName && i.dosage && i.frequency && i.duration);
    if (validItems.length === 0) return;

    await createMutation.mutateAsync({
      medicalRecordId,
      notes: notes || undefined,
      items: validItems.map((i) => ({
        ...i,
        productId: i.productId || undefined,
        instructions: i.instructions || undefined,
      })),
    });

    setIsOpen(false);
    setNotes('');
    setItems([{ ...emptyItem }]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pill className="h-3.5 w-3.5" />
          Prescribir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Pill className="h-4 w-4" />
            </div>
            Nueva prescripción {petName && `— ${petName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {items.map((item, index) => (
            <div key={index} className="p-4 rounded-xl ghost-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Medicamento {index + 1}</span>
                {items.length > 1 && (
                  <Button variant="ghost" size="icon-sm" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Producto del inventario (opcional)</Label>
                  <Select value={item.productId} onValueChange={(v) => updateItem(index, 'productId', v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productList.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre del medicamento *</Label>
                  <Input
                    placeholder="Amoxicilina 500mg"
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dosis *</Label>
                  <Input
                    placeholder="500mg"
                    value={item.dosage}
                    onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Frecuencia *</Label>
                  <Input
                    placeholder="cada 8 horas"
                    value={item.frequency}
                    onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duración *</Label>
                  <Input
                    placeholder="7 días"
                    value={item.duration}
                    onChange={(e) => updateItem(index, 'duration', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cantidad total</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Instrucciones</Label>
                  <Input
                    placeholder="Tomar con alimentos"
                    value={item.instructions}
                    onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Agregar medicamento
          </Button>

          <div className="space-y-1.5">
            <Label className="text-xs">Notas adicionales</Label>
            <Textarea
              placeholder="Observaciones sobre la prescripción..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={createMutation.isPending || items.every((i) => !i.productName || !i.dosage)}
          >
            {createMutation.isPending ? 'Guardando...' : 'Crear prescripción'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PrescriptionListProps {
  recordId: string;
}

export function PrescriptionList({ recordId }: PrescriptionListProps) {
  const { data: prescriptions, isLoading } = usePrescriptions(recordId);

  if (isLoading || !prescriptions || prescriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-3">
      {prescriptions.map((rx: Prescription) => (
        <div key={rx.id} className="p-3 rounded-lg bg-primary/5 ghost-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium flex items-center gap-1 text-primary">
              <Pill className="h-3 w-3" />
              Prescripción
            </span>
            <span className="text-xs text-muted-foreground">
              Dr. {rx.veterinarian.firstName} {rx.veterinarian.lastName}
            </span>
          </div>
          <div className="space-y-1.5">
            {rx.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-muted-foreground">{item.dosage}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.frequency} · {item.duration}
                </div>
              </div>
            ))}
          </div>
          {rx.notes && (
            <p className="mt-2 text-xs text-muted-foreground italic">{rx.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
