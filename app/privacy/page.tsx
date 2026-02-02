import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 md:mb-8 text-center">Politique de confidentialité</h1>
          <div className="max-w-4xl mx-auto text-muted-foreground leading-relaxed space-y-6">
            <p className="text-lg">
              Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre Service.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Informations que nous collectons</h2>
              <p className="mb-3">
                Nous collectons plusieurs types d'informations à différentes fins afin de fournir et d'améliorer notre Service. Cela inclut les informations que vous nous fournissez directement (nom, adresse e-mail, adresse de livraison, détails de paiement lors d'un achat ou de la création d'un compte) et les données collectées automatiquement (adresse IP, type de navigateur, pages visitées, etc.).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Utilisation de vos informations</h2>
              <p className="mb-3">
                Tonomi utilise les données collectées à diverses fins : pour fournir et maintenir notre Service, pour vous informer des changements apportés à notre Service, pour vous permettre de participer aux fonctionnalités interactives de notre Service lorsque vous le souhaitez, pour fournir un support client, pour collecter des analyses ou des informations précieuses afin que nous puissions améliorer notre Service, pour surveiller l'utilisation de notre Service, pour détecter, prévenir et résoudre les problèmes techniques, et pour vous fournir des nouvelles, des offres spéciales et des informations générales sur d'autres biens, services et événements que nous proposons et qui sont similaires à ceux que vous avez déjà achetés ou sur lesquels vous avez demandé des renseignements, sauf si vous avez choisi de ne pas recevoir de telles informations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Partage et divulgation des informations</h2>
              <p className="mb-3">
                Nous ne vendons, n'échangeons ni ne louons vos informations d'identification personnelle à des tiers. Nous pouvons partager des informations génériques agrégées non liées à des informations d'identification personnelle concernant les visiteurs et les utilisateurs avec nos partenaires commerciaux, nos affiliés de confiance et nos annonceurs aux fins décrites ci-dessus. Nous pouvons utiliser des fournisseurs de services tiers pour nous aider à exploiter notre entreprise et le Service ou administrer des activités en notre nom, comme l'envoi de newsletters ou d'enquêtes. Nous pouvons partager vos informations avec ces tiers à ces fins limitées, à condition que vous nous ayez donné votre permission.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}