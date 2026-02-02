import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 md:mb-8 text-center">À propos de Tonomi</h1>
          <div className="max-w-3xl mx-auto text-center text-lg text-muted-foreground leading-relaxed">
            <p className="mb-4">
              Bienvenue chez Tonomi, votre destination unique pour une mode de qualité qui reflète votre style et rend chaque jour agréable.
              Nous croyons que la mode doit être accessible, tendance et durable.
            </p>
            <p className="mb-4">
              Notre mission est de vous offrir une sélection rigoureuse de vêtements, chaussures et accessoires qui vous permettent
              d'exprimer votre individualité avec confiance. Nous nous engageons à la satisfaction de nos clients et à fournir
              une expérience d'achat exceptionnelle, en mettant l'accent sur la qualité, le design et un service client irréprochable.
            </p>
            <p>
              Chez Tonomi, chaque pièce est choisie avec soin pour vous assurer style et confort. Explorez nos collections et découvrez votre prochaine pièce préférée.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}