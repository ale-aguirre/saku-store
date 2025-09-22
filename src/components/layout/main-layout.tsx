import { Header } from './header'
import { Footer } from './footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-safe-x sm:px-safe-component lg:px-safe-section max-w-safe">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}