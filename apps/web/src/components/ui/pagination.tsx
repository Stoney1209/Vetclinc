import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (showFirstLast && startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (showFirstLast && endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-between gap-4 py-4', className)}>
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </p>
      
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="text-muted-foreground"
            aria-label="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-muted-foreground"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {showPageNumbers && pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-sm text-muted-foreground">···</span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'min-w-[2rem] h-9 px-3 text-sm font-medium',
                  currentPage === page
                    ? 'cta-gradient text-white hover:opacity-90'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))]'
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-muted-foreground"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="text-muted-foreground"
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
