import { motion } from 'framer-motion'
import { ArrowUpRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSite } from '../lib/site'
import { BehanceIcon, InstagramIcon, WhatsAppIcon } from './BrandIcons'
import { Reveal, SplitWords } from './Reveal'
import { scrollToId } from '../lib/scroll'

const year = new Date().getFullYear()

export default function Contact() {
  const { site } = useSite()
  const { contact, profile, footer, content } = site
  const copy = content.contact
  const to = contact.emails.map((e) => e.trim()).filter(Boolean).join(',')
  const mailtoAll = `mailto:${to}?subject=${encodeURIComponent(
    "Let's build something remarkable",
  )}&body=${encodeURIComponent('Hi Nabeel,\n\nI would love to talk about a project.\n\n')}`
  const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
    'Hi Nabeel! I saw your portfolio and would love to talk.',
  )}`
  const instagramUrl = `https://www.instagram.com/${contact.instagram}/`
  const behanceUrl = `https://www.behance.net/${contact.behance}`
  const socials = [
    { label: 'WhatsApp', href: whatsappUrl, Icon: WhatsAppIcon },
    { label: 'Instagram', href: instagramUrl, Icon: InstagramIcon },
    { label: 'Behance', href: behanceUrl, Icon: BehanceIcon },
  ]
  return (
    <section id="contact" className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/15 blur-[120px]" />

      <div className="container-x relative flex flex-1 flex-col items-center justify-center py-24 text-center sm:py-32">
        <Reveal>
          <p className="eyebrow">{copy.eyebrow}</p>
        </Reveal>
        <h2 className="mt-5 font-display text-[clamp(4rem,14vw,12rem)] leading-[0.85]">
          <SplitWords text={copy.title} />
          <SplitWords text={copy.titleAccent} className="text-ember" delay={0.08} />
        </h2>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-bone/55 sm:text-base">{copy.lead}</p>
        </Reveal>

        <Reveal delay={0.18} className="mt-10">
          <motion.a
            href={mailtoAll}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-ember py-3 pl-8 pr-3 text-onaccent sm:py-4 sm:pl-10"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-bone transition-transform duration-500 ease-out group-hover:scale-x-100" />
            <span className="relative font-display text-2xl tracking-wide sm:text-3xl">{copy.ctaLabel}</span>
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-45 sm:h-12 sm:w-12">
              <ArrowUpRight size={20} />
            </span>
          </motion.a>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-6 flex flex-col items-center gap-1 text-sm text-bone/55 sm:flex-row sm:gap-3">
            {contact.emails.map((e, i) => (
              <span key={e} className="flex items-center gap-3">
                {i > 0 && <span className="hidden h-1 w-1 rounded-full bg-bone/30 sm:block" />}
                <a href={`mailto:${e}`} className="transition-colors hover:text-ember">
                  {e}
                </a>
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 flex items-center gap-4">
          {socials.map(({ label, href, Icon }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -6, rotate: i % 2 ? 8 : -8 }}
              className="grid h-14 w-14 place-items-center rounded-full border border-bone/15 text-bone transition-colors hover:border-ember hover:bg-ember hover:text-onaccent"
            >
              <Icon size={22} />
            </motion.a>
          ))}
        </div>
      </div>

      <footer className="container-x relative grid grid-cols-1 items-center gap-3 border-t border-bone/10 py-6 text-center text-[10px] uppercase tracking-[0.25em] text-bone/40 sm:grid-cols-3 sm:text-left">
        <span>© {year} {profile.name}</span>
        <span className="font-display text-xl tracking-[0.1em] text-bone sm:text-center">{footer.tagline}</span>
        <span className="flex items-center justify-center gap-5 sm:justify-end">
          {footer.showAdmin && (
            <Link
              to="/admin"
              aria-label={footer.adminLabel}
              title={footer.adminLabel}
              className="inline-flex items-center gap-2 transition-colors hover:text-ember"
            >
              <Lock size={13} />
              {footer.adminLabel}
            </Link>
          )}
          {footer.showBackToTop && (
            <button onClick={() => scrollToId('home', 1400)} className="uppercase transition-colors hover:text-ember">
              {footer.backToTopLabel}
            </button>
          )}
        </span>
      </footer>
    </section>
  )
}
