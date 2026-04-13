'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const pageNames: Record<string, string> = {
  dashboard: 'Dashboard',
  appointments: 'Agenda',
  clients: 'Clientes',
  'medical-records': 'Expedientes',
  inventory: 'Inventario',
  sales: 'Ventas',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  breadcrumbs.push({ label: 'Inicio', href: '/dashboard' });

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    if (currentPath === '/dashboard') continue;
    const label = pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || '/'}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded'
                )}
              >
                {index === 0 ? (
                  <Home className="h-4 w-4" />
                ) : (
                  item.label
                )}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}