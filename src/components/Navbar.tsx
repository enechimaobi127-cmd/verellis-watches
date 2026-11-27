import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { VerellisLogo } from './BrandLogo';

const PRIMARY_NAV_LINKS = [
  { label: 'Collection', to: '/collection' },
  { label: 'Craft', to: '/craft' },
  { label: 'Story', to: '/story' },
  { label: 'Contact', to: '/contact' },
] as const;

export function Navbar() {
  const { pathname } = useLocation();
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-16 transition-[background-color,border-color,backdrop-filter] duration-200 ${
          scrolled
            ? 'border-b border-[#1A1A1A]/[0.08] bg-white/80 backdrop-blur-md'
            : 'border-b border-transparent bg-white/95'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-6 min-[900px]:px-16">
          {/* Zone 1: Brand Logo */}
          <Link
            to="/"
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            aria-label="VERELLIS Home"
            className="inline-flex items-center whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8975A]"
          >
            <VerellisLogo size="sm" />
          </Link>

          {/* Zone 2: Desktop Primary Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden min-[900px]:flex items-center gap-8 text-[13px] font-normal tracking-[0.06em] text-[#1A1A1A]/75"
          >
            {PRIMARY_NAV_LINKS.map((item) => {
              const isActive =
                pathname === item.to ||
                (item.to === '/collection' && pathname.startsWith('/watch/'));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-200 hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8975A] ${
                    isActive ? 'text-[#1A1A1A] font-medium' : ''
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 left-0 right-0 h-px bg-[#B8975A] transition-transform duration-200 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Cart Trigger & Mobile Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openCart}
              data-testid="navbar-cart-button"
              className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-sm px-2.5 text-[#1A1A1A] transition-colors duration-200 hover:text-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="h-[18px] w-[18px] stroke-[1.5]" aria-hidden="true" />
              <span
                data-testid="navbar-cart-count"
                className="text-xs font-medium tabular-nums tracking-[0.04em]"
              >
                {itemCount}
              </span>
              <span className="sr-only">
                {itemCount === 1 ? 'item in shopping bag' : 'items in shopping bag'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              data-testid="mobile-menu-open"
              className="inline-flex min-[900px]:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-[#1A1A1A] transition-colors duration-200 hover:text-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] cursor-pointer"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          data-testid="mobile-menu-overlay"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-white px-6 py-4 min-[900px]:hidden"
        >
          <div className="flex h-12 items-center justify-between">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="VERELLIS Home"
              className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8975A]"
            >
              <VerellisLogo size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              data-testid="mobile-menu-close"
              className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-sm text-[#1A1A1A] transition-colors hover:text-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] cursor-pointer"
            >
              <X className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile Primary Links" className="my-auto flex flex-col gap-2 py-8">
            {[{ label: 'Home', to: '/' }, ...PRIMARY_NAV_LINKS].map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-[56px] items-center justify-between border-b border-[#1A1A1A]/[0.06] font-serif text-3xl font-normal tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] ${
                    active ? 'text-[#85662C]' : 'text-[#1A1A1A] hover:text-[#85662C]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-sans tracking-[0.12em] text-[#1A1A1A]/65">
                    {active ? 'Current' : 'View'}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#1A1A1A]/8 pt-5 pb-4 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCart();
              }}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-sm bg-[#1A1A1A] px-6 text-xs font-medium tracking-[0.14em] text-white transition-colors hover:bg-[#85662C] cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
              <span>Shopping Bag ({itemCount})</span>
            </button>
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#1A1A1A]/70">
              <Link to="/shipping-returns" onClick={() => setMobileMenuOpen(false)}>
                Shipping & Returns
              </Link>
              <Link to="/warranty-care" onClick={() => setMobileMenuOpen(false)}>
                Warranty & Care
              </Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
