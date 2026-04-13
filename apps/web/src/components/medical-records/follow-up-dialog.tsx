'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useScheduleFollowUp } from '@/hooks/use-prescriptions';
import { CalendarCheck } from 'lucide-react';

interface FollowUpDialogProps {
  recordId: string;
  petName?: string;
}

export function FollowUpDialog({ recordId, petName }: FollowUpDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const scheduleMutation = useScheduleFollowUp();

  const handleSchedule = async () => {
    if (!followUpDate) return;

    await scheduleMutation.mutateAsync({
      recordId,
      data: {
        followUpDate: new Date(followUpDate).toISOString(),
        followUpNotes: followUpNotes || undefined,
      },
    });

    setIsOpen(false);
    setFollowUpDate('');
    setFollowUpNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <CalendarCheck className="h-3.5 w-3.5" />
          Seguimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
            Programar seguimiento {petName && `— ${petName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Fecha de seguimiento *</Label>
            <Input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              placeholder="Motivo del seguimiento..."
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSchedule}
            disabled={scheduleMutation.isPending || !followUpDate}
          >
            {scheduleMutation.isPending ? 'Programando...' : 'Programar seguimiento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
