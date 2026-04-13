'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useSales, useCreateSale, useDailySummary } from '@/hooks/use-sales';
import { useProducts } from '@/hooks/use-inventory';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Receipt, Trash2, CreditCard, Banknote, Building2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const paymentMethods = [
  { id: 'cash', label: 'Efectivo', icon: Banknote },
  { id: 'card', label: 'Tarjeta', icon: CreditCard },
  { id: 'transfer', label: 'Transferencia', icon: Building2 },
];

export default function SalesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const { data: salesData } = useSales();
  const { data: summary } = useDailySummary();
  const { data: productsData } = useProducts();
  const createMutation = useCreateSale();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const handleSale = async () => {
    if (cart.length === 0) return;
    await createMutation.mutateAsync({
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      paymentMethod,
    });
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Punto de venta</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* POS Terminal */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {productsData?.data?.slice(0, 8).map((product: any) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto min-h-[4rem] sm:h-20 justify-start text-left hover-lift py-2"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Carrito
                <Badge variant="secondary" className="ml-auto">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Agrega productos al carrito</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 animate-slide-up">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatCurrency(item.price)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon-sm" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.productId, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-mono font-medium">{item.quantity}</span>
                        <Button size="icon-sm" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.productId, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.productId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="border-t pt-3 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>IVA (16%)</span>
                        <span className="font-mono">{formatCurrency(tax)}</span>
                      </div>
                    </div>

                    {/* Cart Total - Visual Highlight */}
                    <div className="p-4 rounded-xl bg-[hsl(var(--primary-container))]/10 ghost-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                            <Receipt className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-[hsl(var(--on-primary-fixed-variant))]">Total a pagar</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-[hsl(var(--primary))] font-mono">
                            {formatCurrency(total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cart.reduce((sum, i) => sum + i.quantity, 0)} {cart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'producto' : 'productos'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Método de pago</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <Button
                            key={method.id}
                            variant={paymentMethod === method.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPaymentMethod(method.id)}
                            className="flex-col h-auto py-2 gap-1"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{method.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    className="w-full shadow-lg shadow-primary/25"
                    size="lg"
                    onClick={handleSale}
                    disabled={cart.length === 0 || createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Procesando...' : `Completar venta · ${formatCurrency(total)}`}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales History */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Ventas del día</span>
                </div>
                <p className="text-2xl font-display font-bold">{formatCurrency(summary?.totalSales || 0)}</p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Transacciones</span>
                </div>
                <p className="text-2xl font-display font-bold">{summary?.salesCount || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Ventas recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Folio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="p-0">
                        <EmptyState 
                          variant="sales" 
                          className="py-12"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesData?.data?.slice(0, 10).map((sale: any, idx: number) => (
                      <TableRow key={sale.id} className="table-row-hover animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                        <TableCell className="font-mono text-sm font-medium">
                          #{sale.id.slice(0, 6).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(sale.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(sale.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
