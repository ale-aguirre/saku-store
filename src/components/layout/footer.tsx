import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  company: [
    { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { name: 'Guía de Talles', href: '/guia-talles' },
    { name: 'Cuidado de Prendas', href: '/cuidado-prendas' },
    { name: 'Contacto', href: '/contacto' },
  ],
  support: [
    { name: 'Preguntas Frecuentes', href: '/faq' },
    { name: 'Cambios y Devoluciones', href: '/cambios-devoluciones' },
    { name: 'Envíos', href: '/envios' },
    { name: 'Métodos de Pago', href: '/metodos-pago' },
  ],
  legal: [
    { name: 'Términos y Condiciones', href: '/terminos' },
    { name: 'Política de Privacidad', href: '/privacidad' },
    { name: 'Política de Cookies', href: '/cookies' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/sakulenceria', icon: Instagram },
  { name: 'Facebook', href: 'https://facebook.com/sakulenceria', icon: Facebook },
]

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-8 sm:py-12 lg:py-16 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Sakú Lencería"
                width={120}
                height={40}
                className="h-6 sm:h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Lencería femenina de calidad premium. Diseños únicos que realzan tu belleza natural.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Soporte</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contacto</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">hola@sakulenceria.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+54 351 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Córdoba, Argentina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} Sakú Lencería. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}