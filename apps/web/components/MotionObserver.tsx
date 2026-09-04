"use client"

import { useEffect } from 'react'

export default function MotionObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          ;(entry.target as HTMLElement).dataset.revealState = 'visible'
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    targets.forEach((target, index) => {
      target.dataset.revealState = 'pending'
      target.style.setProperty('--reveal-order', String(index % 3))
      observer.observe(target)
    })

    return () => observer.disconnect()
  }, [])

  return null
}
