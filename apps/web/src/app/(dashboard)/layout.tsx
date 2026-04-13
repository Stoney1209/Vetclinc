'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  FileText,
  Package,
  ShoppingCart,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  PawPrint,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { PageTransition } from '@/components/ui/page-transition';
import { AuthProvider, useAuth } from '@/lib/auth-context';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/appointments', icon: Calendar },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Expedientes', href: '/medical-records', icon: FileText },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Ventas', href: '/sales', icon: ShoppingCart },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Mobile sidebar backdrop */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 animate-fade-in">
            <div
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-[min(280px,85vw)] bg-gradient-to-b from-primary via-primary to-primary/95 text-primary-foreground animate-slide-up shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              
              {/* Logo */}
              <div className="relative flex items-center gap-3 h-20 px-6 border-b border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-lg">VetClinic</span>
                  <span className="text-xs text-white/60">Premium</span>
                </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
              </div>
              
              {/* Navigation */}
              <nav className="relative px-3 py-6 space-y-1">
                {navigation.map((item, index) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-white/15 text-white shadow-lg'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
                      )}
                      <item.icon className={cn(
                        'h-5 w-5 transition-transform duration-200',
                        isActive ? '' : 'group-hover:scale-110'
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              {/* User section */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gradient-to-t from-primary/50 to-transparent">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary/90 rounded-r-3xl shadow-2xl" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-40 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2" />
          
          {/* Logo section */}
          <div className="relative flex items-center gap-4 h-24 px-8 pt-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
              <PawPrint className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl text-white tracking-tight">VetClinic</span>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-accent animate-pulse-soft" />
                <span className="text-xs text-white/60 font-medium">Sistema Premium</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="relative flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-accent rounded-r-full" />
                      <div className="absolute inset-0 rounded-2xl bg-white/5" />
                    </>
                  )}
                  <item.icon className={cn(
                    'h-5 w-5 relative z-10 transition-transform duration-200',
                    isActive ? '' : 'group-hover:scale-110'
                  )} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Bottom section */}
          <div className="relative p-4 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 text-accent font-display font-bold text-sm">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-white/50 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full mt-3 px-3 py-2 text-xs font-medium text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" />
                </button>
              <div className="flex flex-col min-w-0">
                <h1 className="font-display font-semibold text-base sm:text-lg text-foreground truncate">
                  {navigation.find((n) => pathname.startsWith(n.href))?.name || 'Dashboard'}
                </h1>
                <div className="hidden sm:block">
                  <Breadcrumb />
                </div>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/appointments?action=new"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Nueva Cita</span>
              </Link>
              <Link
                href="/appointments?action=new"
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25"
              >
                <Calendar className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-3 sm:p-4 lg:p-8 overflow-x-hidden">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
