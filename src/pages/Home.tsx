import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import About from '../components/About'
import WhatIDo from '../components/WhatIDo'
import Projects from '../components/Projects'
import Reviews from '../components/Reviews'
import Contact from '../components/Contact'
import { scrollToId } from '../lib/scroll'

export default function Home() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => scrollToId(hash.slice(1), 900), 120)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <WhatIDo />
        <Projects />
        <Reviews />
        <Contact />
      </main>
    </>
  )
}
