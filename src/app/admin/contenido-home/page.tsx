'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Save, Eye, RefreshCw } from 'lucide-react'

interface HeroData {
  title: string
  subtitle: string
  cta_primary_text: string
  cta_primary_url: string
  cta_secondary_text: string
  cta_secondary_url: string
  is_active: boolean
}

interface CategorySectionData {
  title: string
  subtitle: string
  is_active: boolean
}

export default function ContenidoHomePage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [heroData, setHeroData] = useState<HeroData>({
    title: '',
    subtitle: '',
    cta_primary_text: '',
    cta_primary_url: '',
    cta_secondary_text: '',
    cta_secondary_url: '',
    is_active: true
  })
  const [copyBlocks, setCopyBlocks] = useState<Record<string, string>>({})
  const [categoryData, setCategoryData] = useState<CategorySectionData>({
    title: '',
    subtitle: '',
    is_active: true
  })

  // Cargar datos existentes
  useEffect(() => {
    loadHomeContent()
  }, [])

  const loadHomeContent = async () => {
    setLoading(true)
    try {
      // Cargar hero section
      const { data: heroSection } = await supabase
        .from('home_sections')
        .select('*')
        .eq('section_type', 'hero')
        .eq('is_active', true)
        .single()

      if (heroSection) {
        setHeroData({
          title: heroSection.title || '',
          subtitle: heroSection.subtitle || '',
          cta_primary_text: heroSection.cta_primary_text || '',
          cta_primary_url: heroSection.cta_primary_url || '',
          cta_secondary_text: heroSection.cta_secondary_text || '',
          cta_secondary_url: heroSection.cta_secondary_url || '',
          is_active: heroSection.is_active
        })
      }

      // Cargar category section
      const { data: categorySection } = await supabase
        .from('home_sections')
        .select('*')
        .eq('section_type', 'categories')
        .eq('is_active', true)
        .single()

      if (categorySection) {
        setCategoryData({
          title: categorySection.title || '',
          subtitle: categorySection.subtitle || '',
          is_active: categorySection.is_active
        })
      }

      // Cargar copy blocks como backup
      const { data: blocks } = await supabase
        .from('copy_blocks')
        .select('*')
        .in('key', [
          'hero_title',
          'hero_subtitle', 
          'hero_cta_primary',
          'hero_cta_secondary',
          'categories_section_title',
          'categories_section_subtitle'
        ])

      if (blocks) {
        const blocksMap = blocks.reduce((acc, block) => {
          acc[block.key] = block.content
          return acc
        }, {} as Record<string, string>)
        setCopyBlocks(blocksMap)
      }

    } catch (error) {
      console.error('Error loading home content:', error)
      toast.error('No se pudo cargar el contenido del home')
    } finally {
      setLoading(false)
    }
  }

  const saveHeroContent = async () => {
    setSaving(true)
    try {
      console.log('🚀 Iniciando guardado de contenido del hero')

      console.log('💾 Guardando en home_sections...')
      // Actualizar o crear hero section (sin imagen)
      const { error: heroError } = await supabase
        .from('home_sections')
        .upsert({
          section_type: 'hero',
          title: heroData.title,
          subtitle: heroData.subtitle,
          cta_primary_text: heroData.cta_primary_text,
          cta_primary_url: heroData.cta_primary_url,
          cta_secondary_text: heroData.cta_secondary_text,
          cta_secondary_url: heroData.cta_secondary_url,
          is_active: heroData.is_active,
          sort_order: 1
        }, {
          onConflict: 'section_type'
        })

      if (heroError) {
        console.error('❌ Error en home_sections:', heroError)
        throw heroError
      }
      console.log('✅ home_sections actualizado')

      console.log('💾 Actualizando copy_blocks...')
      // Actualizar copy_blocks como backup (sin imagen)
      const copyBlockUpdates = [
        { key: 'hero_title', content: heroData.title },
        { key: 'hero_subtitle', content: heroData.subtitle },
        { key: 'hero_cta_primary', content: heroData.cta_primary_text },
        { key: 'hero_cta_secondary', content: heroData.cta_secondary_text }
      ]

      for (const block of copyBlockUpdates) {
        const { error: blockError } = await supabase
          .from('copy_blocks')
          .upsert(block, { onConflict: 'key' })
        
        if (blockError) {
          console.error(`❌ Error actualizando copy_block ${block.key}:`, blockError)
          throw blockError
        }
      }
      console.log('✅ copy_blocks actualizados')

      console.log('🎉 Contenido del hero guardado exitosamente')
      toast.success('Contenido del hero actualizado correctamente')

    } catch (error) {
      console.error('❌ Error saving hero content:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      toast.error('No se pudo guardar el contenido del hero')
    } finally {
      setSaving(false)
    }
  }

  const saveCategoryContent = async () => {
    setSaving(true)
    try {
      // Actualizar o crear category section
      const { error: categoryError } = await supabase
        .from('home_sections')
        .upsert({
          section_type: 'categories',
          title: categoryData.title,
          subtitle: categoryData.subtitle,
          is_active: categoryData.is_active,
          sort_order: 2
        }, {
          onConflict: 'section_type'
        })

      if (categoryError) throw categoryError

      // Actualizar copy_blocks como backup
      const copyBlockUpdates = [
        { key: 'categories_section_title', content: categoryData.title },
        { key: 'categories_section_subtitle', content: categoryData.subtitle }
      ]

      for (const block of copyBlockUpdates) {
        await supabase
          .from('copy_blocks')
          .upsert(block, { onConflict: 'key' })
      }

      toast.success('Contenido de categorías actualizado correctamente')

    } catch (error) {
      console.error('Error saving category content:', error)
      toast.error('No se pudo guardar el contenido de categorías')
    } finally {
      setSaving(false)
    }
  }

  const saveCopyBlocks = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(copyBlocks).map(([key, content]) => ({
        key,
        content,
        description: getBlockDescription(key)
      }))

      for (const block of updates) {
        await supabase
          .from('copy_blocks')
          .upsert(block, { onConflict: 'key' })
      }

      toast.success('Textos actualizados correctamente')

    } catch (error) {
      console.error('Error saving copy blocks:', error)
      toast.error('No se pudieron guardar los textos')
    } finally {
      setSaving(false)
    }
  }

  const getBlockDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'hero_title': 'Título principal del hero en la página de inicio',
      'hero_subtitle': 'Subtítulo descriptivo del hero',
      'hero_cta_primary': 'Texto del botón principal del hero',
      'hero_cta_secondary': 'Texto del botón secundario del hero',
      'categories_section_title': 'Título de la sección de categorías',
      'categories_section_subtitle': 'Subtítulo de la sección de categorías'
    }
    return descriptions[key] || ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contenido del Home</h1>
          <p className="text-muted-foreground">
            Gestiona el contenido editable de la página de inicio
          </p>
        </div>
        <Button onClick={() => window.open('/', '_blank')} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Ver Home
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="textos">Textos Generales</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Principal</CardTitle>
              <CardDescription>
                Configura el contenido del hero que aparece en la página de inicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Título Principal</Label>
                  <Input
                    id="hero-title"
                    value={heroData.title}
                    onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Descubre tu estilo único"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Subtítulo</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={heroData.subtitle}
                    onChange={(e) => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Descripción que acompaña al título"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-primary-text">Botón Principal</Label>
                    <Input
                      id="cta-primary-text"
                      value={heroData.cta_primary_text}
                      onChange={(e) => setHeroData(prev => ({ ...prev, cta_primary_text: e.target.value }))}
                      placeholder="Ej: Explorar Colección"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-primary-url">URL Botón Principal</Label>
                    <Input
                      id="cta-primary-url"
                      value={heroData.cta_primary_url}
                      onChange={(e) => setHeroData(prev => ({ ...prev, cta_primary_url: e.target.value }))}
                      placeholder="/productos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-secondary-text">Botón Secundario</Label>
                    <Input
                      id="cta-secondary-text"
                      value={heroData.cta_secondary_text}
                      onChange={(e) => setHeroData(prev => ({ ...prev, cta_secondary_text: e.target.value }))}
                      placeholder="Ej: Ver Ofertas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-secondary-url">URL Botón Secundario</Label>
                    <Input
                      id="cta-secondary-url"
                      value={heroData.cta_secondary_url}
                      onChange={(e) => setHeroData(prev => ({ ...prev, cta_secondary_url: e.target.value }))}
                      placeholder="/productos?filter=ofertas"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hero-active"
                    checked={heroData.is_active}
                    onCheckedChange={(checked) => setHeroData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="hero-active">Sección activa</Label>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveHeroContent} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Hero
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sección de Categorías</CardTitle>
              <CardDescription>
                Gestiona el contenido de la sección de categorías en el home
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-title">Título de la sección</Label>
                    <Input
                      id="category-title"
                      value={categoryData.title}
                      onChange={(e) => setCategoryData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Nuestras Categorías"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category-subtitle">Subtítulo de la sección</Label>
                    <Textarea
                      id="category-subtitle"
                      value={categoryData.subtitle}
                      onChange={(e) => setCategoryData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Ej: Descubre nuestra colección de lencería..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="category-active"
                      checked={categoryData.is_active}
                      onCheckedChange={(checked) => setCategoryData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="category-active">Sección activa</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Vista previa</h4>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{categoryData.title || 'Título de la sección'}</h3>
                      <p className="text-sm text-muted-foreground">{categoryData.subtitle || 'Subtítulo de la sección'}</p>
                      <Badge variant={categoryData.is_active ? 'default' : 'secondary'}>
                        {categoryData.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={saveCategoryContent} 
                  disabled={saving}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Categorías
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="textos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Textos Generales</CardTitle>
              <CardDescription>
                Gestiona los textos que aparecen en diferentes secciones del home
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categories-title">Título Sección Categorías</Label>
                <Input
                  id="categories-title"
                  value={copyBlocks['categories_section_title'] || ''}
                  onChange={(e) => setCopyBlocks(prev => ({ 
                    ...prev, 
                    'categories_section_title': e.target.value 
                  }))}
                  placeholder="Ej: Explora nuestras categorías"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories-subtitle">Subtítulo Sección Categorías</Label>
                <Textarea
                  id="categories-subtitle"
                  value={copyBlocks['categories_section_subtitle'] || ''}
                  onChange={(e) => setCopyBlocks(prev => ({ 
                    ...prev, 
                    'categories_section_subtitle': e.target.value 
                  }))}
                  placeholder="Descripción de la sección de categorías"
                  rows={2}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveCopyBlocks} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Textos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}