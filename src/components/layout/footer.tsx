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
      <div className="container py-safe-section px-safe-x max-w-safe mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="Sakú Lencería"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Lencería femenina de calidad premium. Diseños únicos que realzan tu belleza natural.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hola@sakulenceria.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+54 351 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Córdoba, Argentina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-4">
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sakú Lencería. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}