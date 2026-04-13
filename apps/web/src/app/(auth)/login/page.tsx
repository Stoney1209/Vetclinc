'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PawPrint, Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AuthProvider, useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data.accessToken, response.data.user);
      toast.success('¡Bienvenido de vuelta!', {
        description: 'Redirigiendo al dashboard...',
      });
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message?.[0] || 'Verifica tus credenciales';
      setErrors({ password: message });
      toast.error('Error al iniciar sesión', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary/30 rounded-full animate-float" />
        <div className="absolute top-40 right-32 w-3 h-3 bg-accent/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-secondary/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <Card className="relative w-full max-w-md mx-4 shadow-2xl shadow-primary/10 border-border/50 backdrop-blur-sm bg-card/95 animate-scale-in">
        <CardHeader className="space-y-1 pb-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/25">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <CardTitle className="font-display text-3xl font-bold tracking-tight">
              VetClinic Pro
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-3 w-3 text-primary animate-pulse-soft" />
              <CardDescription className="text-sm">
                Sistema de gestión veterinaria premium
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                state={errors.email ? 'error' : undefined}
                required
                className="h-12"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive flex items-center gap-1 mt-1" role="alert">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  state={errors.password ? 'error' : undefined}
                  required
                  className="h-12 pr-12"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive flex items-center gap-1 mt-1" role="alert">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.password}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/25" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          {/* Demo credentials - only in development */}
          {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Credenciales de demostración
              </p>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@vetclinic.com');
                    setPassword('password123');
                  }}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-background transition-colors text-sm group"
                >
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    admin@vetclinic.com
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    Admin
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('dr.smith@vetclinic.com');
                    setPassword('password123');
                  }}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-background transition-colors text-sm group"
                >
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    dr.smith@vetclinic.com
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    Veterinario
                  </span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70 pt-1">
                Contraseña para todos: <span className="font-mono">password123</span>
              </p>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
