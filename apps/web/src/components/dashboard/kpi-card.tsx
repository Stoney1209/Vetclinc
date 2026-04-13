'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  gradient: string;
  isLoading?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  delta,
  deltaLabel = 'vs. período anterior',
  icon: Icon,
  gradient,
  isLoading,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card variant="elevated" className="ghost-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="h-8 w-20 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = (delta ?? 0) > 0;
  const isNeutral = delta === 0;
  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const deltaColor = isNeutral
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-green-600'
      : 'text-red-500';

  return (
    <Card variant="elevated" className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 ghost-border">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      <CardHeader className="relative flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-all duration-300`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-tight">
            {value}
          </span>
          {subtitle && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        {delta !== undefined && (
          <div className={cn('mt-2 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-xs', deltaColor)}>
            <DeltaIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>
              {isNeutral ? '0' : `${isPositive ? '+' : ''}${delta}%`} {deltaLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
