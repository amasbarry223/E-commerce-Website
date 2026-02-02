import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Mail, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 md:mb-8 text-center">Nous contacter</h1>
          <div className="max-w-3xl mx-auto text-center text-lg text-muted-foreground leading-relaxed">
            <p className="mb-6">
              Nous sommes toujours ravis d'avoir de vos nouvelles ! Si vous avez des questions, des commentaires ou si vous avez besoin d'aide, n'hésitez pas à nous contacter.
              Notre équipe est là pour vous assister.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-4 text-foreground">
                <Mail className="w-6 h-6" />
                <p className="text-xl font-semibold">support@tonomi.com</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-foreground">
                <Phone className="w-6 h-6" />
                <p className="text-xl font-semibold">+223 76 12 34 56</p>
              </div>
              <p className="text-base text-muted-foreground">
                (Du lundi au vendredi, de 9h à 17h GMT)
              </p>
            </div>

            <p className="text-base text-muted-foreground">
              Nous nous efforçons de répondre à toutes les demandes dans les 24 heures ouvrables. Votre satisfaction est notre priorité.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}