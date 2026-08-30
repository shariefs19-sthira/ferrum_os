'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const productLinks = [
  { name: 'LandIntel', href: '/landintel' },
  { name: 'BOQ Pro', href: '/boq-pro' },
  { name: 'DesignStudio', href: '/demo' },
  { name: 'Structura', href: '/structura' },
  { name: 'ProMarket', href: '/promarket' },
  { name: 'BuildOS', href: '/buildos' },
  { name: 'ProcureHub', href: '/procurehub' },
  { name: 'InvestFlow', href: '/investflow' },
  { name: 'CommunityBuild', href: '/communitybuild' }
];

const utilityLinks = [
  { name: 'Pricing', href: '/pricing' },
  { name: 'Resources', href: '/resources/blog' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'About', href: '/about' }
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      );

      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="relative block h-4 w-5" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-slate-700 transition ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`}
          />
          <span
            className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-slate-700 transition ${isOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`absolute left-0 top-3 h-0.5 w-5 rounded-full bg-slate-700 transition ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          id="mobile-menu-panel"
          role="dialog"
          aria-modal="false"
          className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="space-y-3">
            <Link href="/" onClick={closeMenu} className="block rounded-xl px-3 py-2 text-base font-medium text-slate-900 transition hover:bg-slate-100">
              Home
            </Link>

            <div className="border-t border-slate-200 pt-3">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Products</p>
              <div className="space-y-1">
                {productLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="space-y-1">
                {utilityLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="space-y-2">
                <Link href="/login" onClick={closeMenu} className="block rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Log in
                </Link>
                <Link href="/signup" onClick={closeMenu} className="block rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
