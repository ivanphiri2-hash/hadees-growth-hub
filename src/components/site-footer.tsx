import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { COMPANY_NAME, WHATSAPP_NUMBER, waLink } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-[color:var(--navy-deep)] text-slate-300">
      <div className="container-x py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl gradient-royal text-white font-bold">
              H
            </span>
            <span className="text-white font-semibold tracking-tight">
              HADEES TRADING
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
            Empowering South African entrepreneurs and businesses through
            professional services, digital innovation, and education.
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            <li><Link to="/knowledge-hub" className="hover:text-white transition">Knowledge Hub</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold">Services</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/business-services" className="hover:text-white transition">Business Services</Link></li>
            <li><Link to="/digital-solutions" className="hover:text-white transition">Digital Solutions</Link></li>
            <li><Link to="/academy" className="hover:text-white transition">Hadees Trading Academy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 mt-0.5 text-[color:var(--gold)]" />
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {WHATSAPP_NUMBER}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-[color:var(--gold)]" />
              <span>info@hadeestrading.co.za</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-[color:var(--gold)]" />
              <span>South Africa</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <p>Registered in South Africa</p>
        </div>
      </div>
    </footer>
  );
}
