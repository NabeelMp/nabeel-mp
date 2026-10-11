import { motion } from 'framer-motion'
import { ArrowUpRight, Mail } from 'lucide-react'
import { behanceUrl, contact, instagramUrl, mailtoAll, profile, whatsappUrl } from '../lib/data'
import { BehanceIcon, InstagramIcon, WhatsAppIcon } from './BrandIcons'
import { Reveal, SplitWords } from './Reveal'
import { scrollToId } from '../lib/scroll'

const socials = [
  { label: 'WhatsApp', handle: contact.whatsappDisplay, href: whatsappUrl, Icon: WhatsAppIcon },
  { label: 'Instagram', handle: `@${contact.instagram}`, href: instagramUrl, Icon: InstagramIcon },
  { label: 'Behance', handle: contact.behance, href: behanceUrl, Icon: BehanceIcon },
]

export default function Contact() {
  return (
    <section id="contact" className="grain relative overflow-hidden bg-ink pt-24 sm:pt-32">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[50vh] w-[90vw] -translate-x-1/2 rounded-full bg-ember/20 blur-[140px]" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow">Connect · 05</p>
        </Reveal>
        <h2 className="mt-4 font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.85]">
          <SplitWords text="Let's build" />
          <br />
          <SplitWords text="something" delay={0.08} />
          <br />
          <SplitWords text="remarkable." className="text-ember" delay={0.16} />
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <Reveal>
            <motion.a
              href={mailtoAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-ember p-6 text-ink sm:p-8"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-bone transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className="relative">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em]">
                  <Mail size={14} /> Mail me
                </span>
                <span className="mt-2 block font-display text-4xl leading-none sm:text-6xl">Start your story</span>
                <span className="mt-3 block break-all text-[12px] font-medium opacity-70 sm:text-sm">{contact.emails.join('  ·  ')}</span>
              </span>
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-45 sm:h-20 sm:w-20">
                <ArrowUpRight size={28} />
              </span>
            </motion.a>
          </Reveal>

          <div className="grid gap-3">
            {socials.map(({ label, handle, href, Icon }, i) => (
              <Reveal key={label} delay={0.1 + i * 0.08}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-bone/10 bg-coal/80 px-5 py-4 transition-colors hover:border-ember hover:bg-ember/10"
                >
                  <span className="flex items-center gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-bone text-ink transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block text-[10px] uppercase tracking-[0.3em] text-bone/45">{label}</span>
                      <span className="block text-sm font-semibold">{handle}</span>
                    </span>
                  </span>
                  <ArrowUpRight size={18} className="text-bone/40 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ember" />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <footer className="container-x relative mt-24 flex flex-col items-center justify-between gap-4 border-t border-bone/10 py-8 text-[11px] uppercase tracking-[0.25em] text-bone/45 sm:flex-row">
        <span>© {new Date().getFullYear()} {profile.name} — All rights reserved</span>
        <span className="font-display text-2xl tracking-normal text-bone">NABEEL.</span>
        <button onClick={() => scrollToId('home', 1400)} className="hover:text-ember">
          Back to top ↑
        </button>
      </footer>
    </section>
  )
}
