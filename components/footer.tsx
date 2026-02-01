import Image from "next/image";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = {
  shop: [
    { name: "Tous les produits", href: "/shop" },
    { name: "Vestes", href: "/shop?category=JACKETS" },
    { name: "T-Shirts", href: "/shop?category=T-SHIRT" },
    { name: "Chaussures", href: "/shop?category=SHOES" },
    { name: "Nouveautés", href: "/shop?filter=new" },
  ],
  company: [
    { name: "À propos", href: "#" },
    { name: "Carrières", href: "#" },
    { name: "Presse", href: "#" },
    { name: "Blog", href: "#" },
  ],
  support: [
    { name: "Nous contacter", href: "#" },
    { name: "FAQ", href: "#" },
    { name: "Livraison", href: "#" },
    { name: "Retours", href: "#" },
    { name: "Guide des tailles", href: "#" },
  ],
  legal: [
    { name: "Politique de confidentialité", href: "#" },
    { name: "Conditions d'utilisation", href: "#" },
    { name: "Politique des cookies", href: "#" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="Tonomi Logo"
                width={196}
                height={56}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-background/70 text-sm mb-6 max-w-xs">
              Découvrez une mode de qualité qui reflète votre style et rend chaque jour agréable.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3">S'abonner à notre newsletter</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Entrez votre email"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 rounded-full"
                />
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6">
                  S'abonner
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Boutique</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/70">
              &copy; {new Date().getFullYear()} Tonomi. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/70">Nous acceptons :</span>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-background/10 rounded text-xs font-medium">Visa</div>
                <div className="px-2 py-1 bg-background/10 rounded text-xs font-medium">Mastercard</div>
                <div className="px-2 py-1 bg-background/10 rounded text-xs font-medium">PayPal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
