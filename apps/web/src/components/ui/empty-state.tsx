'use client';

import { Button } from './button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { 
  PawPrint, 
  Calendar, 
  Users, 
  Package, 
  FileText, 
  Receipt, 
  Search, 
  AlertCircle,
  Plus 
} from 'lucide-react';

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}

const emptyStates: Record<string, EmptyStateConfig> = {
  clients: {
    icon: Users,
    title: 'No hay clientes todavía',
    description: 'Comienza agregando tu primer cliente para gestionar sus mascotas y citas.',
    actionLabel: 'Agregar primer cliente',
  },
  appointments: {
    icon: Calendar,
    title: 'No hay citas programadas',
    description: 'No se encontraron citas en el período seleccionado.',
    actionLabel: 'Agendar primera cita',
  },
  pets: {
    icon: PawPrint,
    title: 'Sin mascotas registradas',
    description: 'Agrega la primera mascota de este cliente.',
    actionLabel: 'Agregar mascota',
  },
  inventory: {
    icon: Package,
    title: 'Inventario vacío',
    description: 'Comienza agregando productos a tu inventario.',
    actionLabel: 'Agregar producto',
  },
  sales: {
    icon: Receipt,
    title: 'Sin ventas aún',
    description: 'Las ventas aparecerán aquí.',
    actionLabel: 'Nueva venta',
  },
  'medical-records': {
    icon: FileText,
    title: 'Sin historial médico',
    description: 'El historial médico de la mascota aparecerá aquí.',
    actionLabel: 'Crear registro',
  },
  search: {
    icon: Search,
    title: 'Sin resultados',
    description: 'No se encontraron elementos que coincidan con tu búsqueda.',
    actionLabel: 'Limpiar búsqueda',
  },
  default: {
    icon: AlertCircle,
    title: 'Nada que mostrar',
    description: 'No hay elementos disponibles en este momento.',
  },
};

type EmptyStateVariant = keyof typeof emptyStates;

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  customTitle?: string;
  customDescription?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
}

function EmptyState({ 
  variant = 'default', 
  icon, 
  customTitle, 
  customDescription, 
  action, 
  className 
}: EmptyStateProps) {
  const config = emptyStates[variant] || emptyStates.default;
  const Icon = icon || config.icon;
  
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const actionLabel = action?.label || config.actionLabel;

  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-4 animate-fade-in', className)}>
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse-soft" />
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/20 ghost-border">
          <Icon className="h-16 w-16 text-primary/60 stroke-1" />
        </div>
      </div>
      
      <h3 className="font-display text-2xl font-semibold mb-3 text-foreground text-center">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground mb-8 max-w-md text-center leading-relaxed">
          {description}
        </p>
      )}
      
      {(action || config.actionLabel) && (
        <Button 
          onClick={action?.onClick} 
          className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };