import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Instagram, Mail } from 'lucide-react';
import { VerellisLogo } from './BrandLogo';

export function Footer() {
  const { pathname } = useLocation();
  const isStoryPage = pathname === '/story';
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative z-10 border-t border-[#1A1A1A]/8 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 min-[900px]:px-16 pt-[clamp(56px,8vw,92px)] pb-10">
        <div className="grid grid-cols-1 gap-10 min-[900px]:grid-cols-12 min-[900px]:gap-8">
          {/* Brand Column */}
          <div className="min-[900px]:col-span-4 flex flex-col items-start">
            <Link
              to="/"
              aria-label="VERELLIS Home"
              className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8975A]"
            >
              <VerellisLogo size="md" />
            </Link>
            <p className="mt-3 max-w-xs text-sm font-light leading-[1.65] text-[#1A1A1A]/70">
              Architectural Swiss-inspired timepieces, assembled slowly by hand in Geneva.
            </p>

            {/* Social Placeholder Links */}
            <div className="mt-6 flex items-center gap-3" aria-label="Social Media">
              <a
                href="#instagram-placeholder"
                onClick={(e) => e.preventDefault()}
                aria-label="VERELLIS on Instagram (placeholder)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#1A1A1A]/12 text-[#1A1A1A]/65 transition-colors hover:border-[#B8975A] hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
              >
                <Instagram className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
              </a>
              <a
                href="#journal-placeholder"
                onClick={(e) => e.preventDefault()}
                aria-label="VERELLIS Global Journal (placeholder)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#1A1A1A]/12 text-[#1A1A1A]/65 transition-colors hover:border-[#B8975A] hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
              >
                <Globe className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
              </a>
              <Link
                to="/contact"
                aria-label="Contact VERELLIS Atelier"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#1A1A1A]/12 text-[#1A1A1A]/65 transition-colors hover:border-[#B8975A] hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
              >
                <Mail className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Link Columns */}
          <div className="min-[900px]:col-span-5 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                Collection
              </h3>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm font-light text-[#1A1A1A]/70">
                <li>
                  <Link
                    to="/watch/argent"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Argent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/watch/aurum"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Aurum
                  </Link>
                </li>
                <li>
                  <Link
                    to="/watch/noir"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Noir
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                Maison
              </h3>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm font-light text-[#1A1A1A]/70">
                <li>
                  <Link
                    to="/craft"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Craft
                  </Link>
                </li>
                <li>
                  <Link
                    to="/story"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Story
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                Client Care
              </h3>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm font-light text-[#1A1A1A]/70">
                <li>
                  <Link
                    to="/shipping-returns"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link
                    to="/warranty-care"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    Warranty & Care
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="inline-flex min-h-[38px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="min-[900px]:col-span-3">
            <h3 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
              Atelier Dispatch
            </h3>
            <p className="mt-4 text-sm font-light leading-[1.6] text-[#1A1A1A]/70">
              Quarterly notes on new calibre releases and salon viewings.
            </p>

            {subscribed ? (
              <div
                data-testid="newsletter-thanks"
                role="status"
                className="mt-4 rounded-lg border border-[#B8975A]/35 bg-[#FAF9F6] px-4 py-3 text-sm font-light text-[#1A1A1A]"
              >
                <p className="font-medium text-[#1A1A1A]">Thank you</p>
                <p className="mt-0.5 text-xs text-[#1A1A1A]/70">
                  Your address has been noted for our next quarterly dispatch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="mt-4 flex flex-col gap-2.5">
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@domain.com"
                  className="min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                />
                {error && (
                  <p role="alert" className="text-xs text-red-700">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-sm bg-[#1A1A1A] px-5 py-2.5 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C] whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#1A1A1A]/8 pt-6 text-xs text-[#1A1A1A]/70 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <p className="tabular-nums">© 2026 VERELLIS</p>
            {isStoryPage && (
              <span
                data-testid="footer-concept-brand"
                className="text-[#1A1A1A]/65 before:mr-3 before:content-['·']"
              >
                Concept brand
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="inline-flex min-h-[44px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="inline-flex min-h-[44px] items-center hover:text-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
