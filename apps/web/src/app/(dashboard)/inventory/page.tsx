'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts, useLowStock, useExpiringProducts, useCategories, useAdjustStock, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-inventory';
import { Package, AlertTriangle, Clock, Plus, Minus, TrendingDown, TrendingUp, Pencil, Trash2, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const tabs = [
  { id: 'all', label: 'Todos', icon: Package, color: 'primary' },
  { id: 'low', label: 'Stock bajo', icon: AlertTriangle, color: 'warning' },
  { id: 'expiring', label: 'Por caducar', icon: Clock, color: 'destructive' },
] as const;

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'expiring'>('all');
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    categoryId: '',
    expiryDate: '',
    batch: '',
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useProducts({ 
    search: debouncedSearch, 
    page,
    limit: 10
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);
  const { data: lowStock } = useLowStock();
  const { data: expiring } = useExpiringProducts(30);
  const { data: categories } = useCategories();

  const adjustMutation = useAdjustStock();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.data || [];
  const displayProducts = (activeTab === 'all' ? products : activeTab === 'low' ? lowStock : expiring) || [];

  const stats = [
    { label: 'Total productos', value: products.length || 0, icon: Package, color: 'primary' },
    { label: 'Stock bajo', value: lowStock?.length || 0, icon: AlertTriangle, color: 'warning' },
    { label: 'Por caducar', value: expiring?.length || 0, icon: Clock, color: 'destructive' },
  ];

  const handleAdjust = async () => {
    if (!adjustingProduct) return;
    await adjustMutation.mutateAsync({
      id: adjustingProduct.id,
      data: { adjustment },
    });
    setAdjustingProduct(null);
    setAdjustment(0);
  };

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.categoryId) return;
    
    const productData: Record<string, unknown> = {
      name: newProduct.name,
      sku: newProduct.sku,
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
      minStock: Number(newProduct.minStock) || 5,
      categoryId: newProduct.categoryId,
    };
    
    if (newProduct.description && newProduct.description.trim()) {
      productData.description = newProduct.description.trim();
    }
    if (newProduct.cost && Number(newProduct.cost) > 0) {
      productData.cost = Number(newProduct.cost);
    }
    if (newProduct.expiryDate && newProduct.expiryDate.trim()) {
      productData.expiryDate = newProduct.expiryDate.trim();
    }
    if (newProduct.batch && newProduct.batch.trim()) {
      productData.batch = newProduct.batch.trim();
    }
    
    await createMutation.mutateAsync(productData);
    setIsCreateDialogOpen(false);
    setNewProduct({
      name: '',
      sku: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      categoryId: '',
      expiryDate: '',
      batch: '',
    });
  };

  const handleUpdate = async () => {
    if (!editingProduct || !editingProduct.id) return;
    
    const updateData: Record<string, unknown> = {};
    
    if (editingProduct.name && editingProduct.name.trim()) {
      updateData.name = editingProduct.name.trim();
    }
    if (editingProduct.sku && editingProduct.sku.trim()) {
      updateData.sku = editingProduct.sku.trim();
    }
    if (editingProduct.description && editingProduct.description.trim()) {
      updateData.description = editingProduct.description.trim();
    }
    if (editingProduct.price !== undefined && editingProduct.price !== null) {
      updateData.price = Number(editingProduct.price) || 0;
    }
    if (editingProduct.cost !== undefined && editingProduct.cost !== null) {
      updateData.cost = Number(editingProduct.cost) || 0;
    }
    if (editingProduct.minStock !== undefined && editingProduct.minStock !== null) {
      updateData.minStock = Number(editingProduct.minStock) || 5;
    }
    if (editingProduct.expiryDate) {
      updateData.expiryDate = editingProduct.expiryDate;
    }
    
    if (Object.keys(updateData).length === 0) {
      return;
    }
    
    await updateMutation.mutateAsync({
      id: editingProduct.id,
      data: updateData,
    });
    setEditingProduct(null);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    await deleteMutation.mutateAsync(deletingProduct.id);
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Inventario</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {productsData?.total || 0} productos en total
          </p>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-sm ml-auto mr-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Agregar producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package className="h-4 w-4" />
                </div>
                Nuevo producto
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Descripción del producto..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio *</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Costo</Label>
                  <Input
                    type="number"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock inicial</Label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock mínimo</Label>
                  <Input
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={newProduct.categoryId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de caducidad</Label>
                <Input
                  type="date"
                  value={newProduct.expiryDate}
                  onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={createMutation.isPending || !newProduct.name || !newProduct.sku || !newProduct.categoryId}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear producto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 text-${stat.color === 'primary' ? 'primary' : stat.color === 'warning' ? 'amber-500' : 'destructive'}`} />
              </div>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl w-fit min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={isActive ? 'shadow-sm whitespace-nowrap' : 'whitespace-nowrap'}
              >
                <Icon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge 
                  variant={isActive ? 'secondary' : 'outline'} 
                  className="hidden sm:inline-flex ml-2 h-5 px-1.5"
                >
                  {tab.id === 'all' ? products.length || 0 : tab.id === 'low' ? lowStock?.length || 0 : expiring?.length || 0}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="whitespace-nowrap">Producto</TableHead>
                <TableHead className="hidden md:table-cell">SKU</TableHead>
                <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                <TableHead className="text-right whitespace-nowrap">Precio</TableHead>
                <TableHead className="text-right whitespace-nowrap">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Caducidad</TableHead>
                <TableHead className="text-right w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState 
                      variant="inventory" 
                      className="py-12"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                displayProducts.map((product: any, idx: number) => (
                  <TableRow key={product.id} className="table-row-hover animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                    <TableCell className="font-medium max-w-[140px] sm:max-w-none truncate">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {product.category?.name || 'Sin categoría'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono whitespace-nowrap">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock <= product.minStock ? 'text-destructive font-medium' : ''}>
                        {product.stock} uds
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.expiryDate ? (
                        <span className={new Date(product.expiryDate) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground text-sm'}>
                          {formatDate(product.expiryDate)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAdjustingProduct(product);
                                setAdjustment(0);
                              }}
                            >
                              <TrendingDown className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <Package className="h-4 w-4" />
                                </div>
                                Ajustar stock
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground">Producto</p>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm mt-2 text-muted-foreground">Stock actual</p>
                                <p className="font-display font-bold text-lg">{product.stock} uds</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Ajuste (±)</Label>
                                <Input
                                  type="number"
                                  value={adjustment}
                                  onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                                  className="text-center text-lg font-mono"
                                />
                              </div>
                              <div className="flex items-center justify-center gap-4 py-2">
                                <Button variant="outline" onClick={() => setAdjustment(-10)}>-10</Button>
                                <Button variant="outline" onClick={() => setAdjustment(-1)}>-1</Button>
                                <span className="font-display font-bold text-lg w-20 text-center">
                                  {product.stock + adjustment}
                                </span>
                                <Button variant="outline" onClick={() => setAdjustment(1)}>+1</Button>
                                <Button variant="outline" onClick={() => setAdjustment(10)}>+10</Button>
                              </div>
                              <Button className="w-full" onClick={handleAdjust} disabled={adjustment === 0}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Confirmar: nuevo stock {product.stock + adjustment}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={editingProduct?.id === product.id}
                          onOpenChange={(open) => {
                            if (!open) setEditingProduct(null);
                            else setEditingProduct(product);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <Pencil className="h-4 w-4" />
                                </div>
                                Editar producto
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Nombre</Label>
                                  <Input
                                    value={editingProduct?.name || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>SKU</Label>
                                  <Input
                                    value={editingProduct?.sku || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                  value={editingProduct?.description || ''}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Precio</Label>
                                  <Input
                                    type="number"
                                    value={editingProduct?.price || 0}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Costo</Label>
                                  <Input
                                    type="number"
                                    value={editingProduct?.cost || 0}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Stock mínimo</Label>
                                  <Input
                                    type="number"
                                    value={editingProduct?.minStock || 5}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 5 })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Fecha de caducidad</Label>
                                  <Input
                                    type="date"
                                    value={editingProduct?.expiryDate ? new Date(editingProduct.expiryDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, expiryDate: e.target.value })}
                                  />
                                </div>
                              </div>
                              <Button className="w-full" onClick={handleUpdate} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Eliminar producto"
        description={`¿Estás seguro de eliminar "${deletingProduct?.name}"? Esta acción marcará el producto como agotado.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {activeTab === 'all' && products.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={productsData?.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
