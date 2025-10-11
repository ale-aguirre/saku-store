"use client";

import { useState } from "react";
import { createAdminClient } from '@/lib/supabase/admin-client'
// Removed auxiliary types import - using as any directly
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  Save,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
  sku: string;
}

interface ProductStockManagerProps {
  variants: ProductVariant[];
  onUpdate: () => void;
}

export function ProductStockManager({
  variants,
  onUpdate,
}: ProductStockManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [operation, setOperation] = useState<"add" | "remove">("add");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (variant: ProductVariant, op: "add" | "remove") => {
    setSelectedVariant(variant);
    setOperation(op);
    setQuantity(1);
    setReason("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedVariant || quantity <= 0 || !reason) return;

    setIsSubmitting(true);

    try {
      const supabase = createAdminClient();

      // 1. Update variant stock
      const newStock =
        operation === "add"
          ? selectedVariant.stock_quantity + quantity
          : Math.max(0, selectedVariant.stock_quantity - quantity);

      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock } as any)
        .eq('id', selectedVariant.id);

      if (updateError) throw updateError;

      // 2. Create inventory movement record
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          variant_id: selectedVariant.id,
          movement_type: 'adjustment',
          quantity: operation === "add" ? quantity : -quantity,
          reason: reason || null,
          created_by: null
        } as any);

      if (movementError) throw movementError;

      // Success
      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error al actualizar el stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "text-red-600";
    if (stock < 5) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variante</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="outline">Talle {variant.size}</Badge>
                      <Badge variant="outline">{variant.color}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{variant.sku}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${getStockStatusColor(
                        variant.stock_quantity
                      )}`}
                    >
                      {variant.stock_quantity} unidades
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(variant, "add")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(variant, "remove")}
                        disabled={variant.stock_quantity === 0}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Quitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {variants.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No hay variantes disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {operation === "add" ? "Agregar Stock" : "Quitar Stock"}
            </DialogTitle>
          </DialogHeader>

          {selectedVariant && (
            <div className="space-y-4 py-2">
              <div className="flex gap-2 items-center">
                <Badge variant="outline">Talle {selectedVariant.size}</Badge>
                <Badge variant="outline">{selectedVariant.color}</Badge>
                <span className="text-sm">
                  Stock actual:{" "}
                  <span className={getStockStatusColor(selectedVariant.stock_quantity)}>
                    {selectedVariant.stock_quantity} unidades
                  </span>
                </span>
              </div>

              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  min="1"
                  max={
                    operation === "remove" ? selectedVariant.stock_quantity : undefined
                  }
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 0))
                  }
                />
              </div>

              <div>
                <Label htmlFor="reason">Motivo</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    operation === "add"
                      ? "Ej: Reposición de stock"
                      : "Ej: Ajuste de inventario"
                  }
                  required
                />
              </div>

              <div className="pt-2">
                {operation === "add" ? (
                  <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Nuevo stock: {selectedVariant.stock_quantity + quantity} unidades
                      </p>
                      <p>Estás agregando {quantity} unidades al inventario</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Nuevo stock:{" "}
                        {Math.max(0, selectedVariant.stock_quantity - quantity)} unidades
                      </p>
                      <p>Estás quitando {quantity} unidades del inventario</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason || quantity <= 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
