'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Percent
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimum_amount: number | null
  usage_limit: number | null
  used_count: number | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export default function CouponsPage() {
  const { user, loading: authLoading } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minimum_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  })

  useEffect(() => {
    if (user) {
      fetchCoupons()
    }
  }, [user])

  const fetchCoupons = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCoupons((data || []) as unknown as Coupon[])
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = createClient()
      
      const couponData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseInt(formData.value) * (formData.type === 'percentage' ? 1 : 100), // Store cents for fixed amounts
        minimum_amount: formData.minimum_amount ? parseInt(formData.minimum_amount) * 100 : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active
      }

      if (editingCoupon) {
        const { error } = await (supabase as any)
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id)

        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from('coupons')
          .insert(couponData)

        if (error) throw error
      }

      await fetchCoupons()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert('Error al guardar el cupón')
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.type === 'percentage' ? coupon.value.toString() : (coupon.value / 100).toString(),
      minimum_amount: coupon.minimum_amount ? (coupon.minimum_amount / 100).toString() : '',
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active ?? false
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Error al eliminar el cupón')
    }
  }

  const toggleStatus = async (coupon: Coupon) => {
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id)

      if (error) throw error

      await fetchCoupons()
    } catch (error) {
      console.error('Error updating coupon status:', error)
      alert('Error al actualizar el estado del cupón')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minimum_amount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    })
    setEditingCoupon(null)
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false
    return new Date(coupon.valid_until) < new Date()
  }

  const isMaxUsesReached = (coupon: Coupon) => {
    if (!coupon.usage_limit) return false
    return (coupon.used_count || 0) >= coupon.usage_limit
  }

  if (authLoading || loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Acceso restringido</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cupones de Descuento</h1>
          <p className="text-muted-foreground">Gestiona los cupones y promociones</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Código del Cupón</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="DESCUENTO10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Descuento</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="fixed">Monto Fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  Valor {formData.type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  step={formData.type === 'percentage' ? '1' : '1'}
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={formData.type === 'percentage' ? '10' : '500'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="minimum_amount">Monto Mínimo de Orden ($)</Label>
                <Input
                  id="minimum_amount"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_amount: e.target.value }))}
                  placeholder="1000"
                />
              </div>

              <div>
                <Label htmlFor="usage_limit">Máximo de Usos</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="valid_from">Válido Desde</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="valid_until">Válido Hasta</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Cupón activo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar cupones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validez</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {coupon.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {coupon.type === 'percentage' ? (
                        <><Percent className="h-3 w-3 mr-1" /> Porcentaje</>
                      ) : (
                        <>$ Fijo</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.type === 'percentage' 
                      ? `${coupon.value}%` 
                      : `$${(coupon.value / 100).toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.used_count || 0}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Desde: {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString('es-AR') : '-'}</div>
                      {coupon.valid_until && (
                        <div>Hasta: {new Date(coupon.valid_until).toLocaleDateString('es-AR')}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        className={
                          coupon.is_active && !isExpired(coupon) && !isMaxUsesReached(coupon)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {!coupon.is_active 
                          ? 'Inactivo'
                          : isExpired(coupon)
                          ? 'Expirado'
                          : isMaxUsesReached(coupon)
                          ? 'Agotado'
                          : 'Activo'
                        }
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(coupon)}
                      >
                        {coupon.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay cupones</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron cupones con ese término' : 'Crea tu primer cupón de descuento'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}