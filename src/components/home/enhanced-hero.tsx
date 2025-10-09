'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'


interface HeroData {
  title: string
  subtitle: string
  image_url: string
  cta_primary_text: string
  cta_primary_url: string
  cta_secondary_text: string
  cta_secondary_url: string
}

const defaultHeroData: HeroData = {
  title: 'Elegancia que te define',
  subtitle: 'Descubre nuestra colección de lencería premium diseñada para realzar tu belleza natural y hacerte sentir única.',
  image_url: '/hero-1.webp',
  cta_primary_text: 'Ver Colección',
  cta_primary_url: '/productos',
  cta_secondary_text: 'Guía de Talles',
  cta_secondary_url: '/guia-talles'
}

export function EnhancedHero() {
  const [heroData, setHeroData] = useState<HeroData>(defaultHeroData)

  useEffect(() => {
    const loadHeroData = async () => {
      try {
        // Intentar cargar desde home_sections
        const { data: heroSection } = await supabase
          .from('home_sections')
          .select('*')
          .eq('section_type', 'hero')
          .eq('is_active', true)
          .single()

        if (heroSection) {
          setHeroData({
            title: heroSection.title || defaultHeroData.title,
            subtitle: heroSection.subtitle || defaultHeroData.subtitle,
            image_url: heroSection.image_url || defaultHeroData.image_url,
            cta_primary_text: heroSection.cta_primary_text || defaultHeroData.cta_primary_text,
            cta_primary_url: heroSection.cta_primary_url || defaultHeroData.cta_primary_url,
            cta_secondary_text: heroSection.cta_secondary_text || defaultHeroData.cta_secondary_text,
            cta_secondary_url: heroSection.cta_secondary_url || defaultHeroData.cta_secondary_url
          })
          return
        }

        // Fallback a copy_blocks
        const { data: copyBlocks } = await supabase
          .from('copy_blocks')
          .select('key, content')
          .in('key', [
            'hero_title',
            'hero_subtitle', 
            'hero_image_url',
            'hero_cta_primary',
            'hero_cta_secondary'
          ])

        if (copyBlocks && copyBlocks.length > 0) {
          const blocksMap = copyBlocks.reduce((acc, block) => {
            acc[block.key] = block.content
            return acc
          }, {} as Record<string, string>)

          setHeroData(prev => ({
            ...prev,
            title: blocksMap['hero_title'] || defaultHeroData.title,
            subtitle: blocksMap['hero_subtitle'] || defaultHeroData.subtitle,
            image_url: blocksMap['hero_image_url'] || defaultHeroData.image_url,
            cta_primary_text: blocksMap['hero_cta_primary'] || defaultHeroData.cta_primary_text,
            cta_secondary_text: blocksMap['hero_cta_secondary'] || defaultHeroData.cta_secondary_text
          }))
        }
      } catch (error) {
        console.error('Error loading hero data:', error)
      }
    }

    loadHeroData()
  }, [])

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Nueva Colección 2024
            </div>

            {/* Título principal */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-marcellus font-bold leading-tight">
                {heroData.title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                {heroData.subtitle}
              </p>
            </div>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base px-8">
                <Link href={heroData.cta_primary_url}>
                  {heroData.cta_primary_text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link href={heroData.cta_secondary_url}>
                  {heroData.cta_secondary_text}
                </Link>
              </Button>
            </div>

            {/* Stats destacadas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Envío gratis</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>30 días garantía</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Diseño exclusivo</span>
              </div>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="lg:col-span-3 relative order-first lg:order-last">
            <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto">
              {/* Elemento decorativo detrás */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-xl" />
              
              {/* Imagen principal */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
                <Image
                  src={heroData.image_url}
                  alt="Lencería Sakú - Colección Premium"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>

              {/* Badge flotante */}
              <div className="absolute -bottom-4 -left-4 bg-background border border-primary/20 rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+500</div>
                  <div className="text-xs text-muted-foreground">Clientas felices</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}