import { Stethoscope, AlertCircle, Syringe, Scissors } from 'lucide-react';

export const appointmentTypes = [
  { value: 'CONSULTATION', label: 'Consulta', color: '#3b82f6', icon: Stethoscope },
  { value: 'URGENCY', label: 'Urgencia', color: '#ef4444', icon: AlertCircle },
  { value: 'SURGERY', label: 'Cirugía', color: '#8b5cf6', icon: Stethoscope },
  { value: 'VACCINATION', label: 'Vacunación', color: '#22c55e', icon: Syringe },
  { value: 'GROOMING', label: 'Estética', color: '#f59e0b', icon: Scissors },
];

export const typeBadgeVariant: Record<string, any> = {
  CONSULTATION: 'consultation',
  URGENCY: 'destructive',
  SURGERY: 'surgery',
  VACCINATION: 'vaccination',
  GROOMING: 'grooming',
};
