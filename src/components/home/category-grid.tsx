'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Category } from '@/types/catalog'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CategoryGridProps {
  categories: Category[]
}

interface CategorySectionData {
  title: string
  subtitle: string
}

// Mapeo de imágenes por categoría
const getCategoryImage = (slug: string) => {
  const imageMap: Record<string, string> = {
    'conjuntos': '/categories/conjuntos.svg',
    'brasiers': '/categories/corpinos.svg', // brasiers usa la imagen de corpinos
    'corpinos': '/categories/corpinos.svg',
    'bombachas': '/categories/bombachas.svg',
    'sets': '/categories/sets.svg', // nueva categoría Sets
    'pijamas': '/categories/default.svg', // temporal hasta crear imagen específica
    'accesorios': '/categories/default.svg', // temporal hasta crear imagen específica
  }
  return imageMap[slug] || '/categories/default.svg'
}



export function CategoryGrid({ categories }: CategoryGridProps) {
  const [sectionData, setSectionData] = useState<CategorySectionData>({
    title: 'Explora nuestras categorías',
    subtitle: 'Encuentra la lencería perfecta para cada ocasión y estilo'
  })

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const supabase = createClient()
        
        // Intentar obtener datos de home_sections primero
        const { data: homeSection } = await supabase
          .from('home_sections')
          .select('title, subtitle')
          .eq('section_type', 'categories')
          .eq('is_active', true)
          .single()

        if (homeSection) {
          setSectionData({
            title: homeSection.title || 'Explora nuestras categorías',
            subtitle: homeSection.subtitle || 'Encuentra la lencería perfecta para cada ocasión y estilo'
          })
        } else {
          // Fallback a copy_blocks
          const { data: copyBlocks } = await supabase
            .from('copy_blocks')
            .select('key, content')
            .in('key', ['categories_section_title', 'categories_section_subtitle'])

          if (copyBlocks && copyBlocks.length > 0) {
            const titleBlock = copyBlocks.find(block => block.key === 'categories_section_title')
            const subtitleBlock = copyBlocks.find(block => block.key === 'categories_section_subtitle')
            
            setSectionData({
              title: titleBlock?.content || 'Explora nuestras categorías',
              subtitle: subtitleBlock?.content || 'Encuentra la lencería perfecta para cada ocasión y estilo'
            })
          }
        }
      } catch (error) {
        console.error('Error loading category section data:', error)
        // Mantener valores por defecto en caso de error
      }
    }

    loadCategoryData()
  }, [])

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-marcellus font-bold mb-4">
            {sectionData.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Grid de categorías - Layout vertical */}
        <div className="space-y-8">
           {categories.map((category) => {
             const imageUrl = getCategoryImage(category.slug)
            
            return (
              <Link
                key={category.id}
                href={`/productos?categoria=${category.slug}`}
                className="group relative overflow-hidden rounded-3xl aspect-[16/6] sm:aspect-[20/6] lg:aspect-[24/6] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 hover:shadow-2xl transition-all duration-500 block"
              >
                {/* Imagen de fondo */}
                <div className="absolute inset-0">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent group-hover:from-black/70 group-hover:via-black/40 transition-all duration-500" />
                </div>



                {/* Contenido centrado */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-md">
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-marcellus font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-lg sm:text-xl text-white/90 mb-6 leading-relaxed">
                        {category.description}
                      </p>
                    )}
                    <div className="inline-flex items-center text-lg font-medium group-hover:text-primary transition-colors duration-300 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                      Ver productos
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>


              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}