import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 md:mb-8 text-center">Conditions d'utilisation</h1>
          <div className="max-w-4xl mx-auto text-muted-foreground leading-relaxed space-y-6">
            <p className="text-lg">
              Bienvenue sur Tonomi. En accédant à notre site web et en utilisant nos services, vous acceptez d'être lié par les présentes conditions d'utilisation. Veuillez les lire attentivement.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Acceptation des conditions</h2>
              <p className="mb-3">
                En accédant et en utilisant ce site web (le "Service"), vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas toutes les conditions de cet accord, vous ne pouvez pas accéder au Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Modifications des conditions</h2>
              <p className="mb-3">
                Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer ces Conditions à tout moment. Si une révision est importante, nous essaierons de fournir un préavis d'au moins 30 jours avant l'entrée en vigueur des nouvelles conditions. Ce qui constitue un changement important sera déterminé à notre seule discrétion.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Votre compte</h2>
              <p className="mb-3">
                Lorsque vous créez un compte chez nous, vous garantissez que les informations que vous nous fournissez sont exactes, complètes et à jour à tout moment. Des informations inexactes, incomplètes ou obsolètes peuvent entraîner la résiliation immédiate de votre compte sur le Service. Vous êtes responsable du maintien de la confidentialité de votre compte et de votre mot de passe, y compris, mais sans s'y limiter, la restriction de l'accès à votre ordinateur et/ou à votre compte.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">4. Propriété intellectuelle</h2>
              <p className="mb-3">
                Le Service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive de Tonomi et de ses concédants de licence. Le Service est protégé par le droit d'auteur, les marques de commerce et d'autres lois, tant au Mali qu'à l'étranger. Nos marques de commerce et habillages commerciaux ne peuvent être utilisés en relation avec un produit ou un service sans le consentement écrit préalable de Tonomi.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}