import { Link } from 'react-router-dom';
import { VERELLIS_TOKENS } from '../styles/tokens';

export default function NotFoundPage() {
  return (
    <main className="page-fade-enter flex min-h-[78vh] items-center bg-white pt-16">
      <div className={`${VERELLIS_TOKENS.layout.containerClass} py-24 text-center`}>
        {/* Small Floating Octagonal Watch Icon */}
        <div
          data-testid="notfound-watch-icon"
          aria-hidden="true"
          className="craft-float-a mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1A1A1A]/10 bg-[#FAF9F6] shadow-[0_12px_28px_-14px_rgba(26,26,26,0.12)]"
        >
          <svg viewBox="0 0 48 48" fill="none" className="h-9 w-9 text-[#1A1A1A]">
            <rect x="18" y="4" width="12" height="5" stroke="#1A1A1A" strokeWidth="1.2" />
            <rect x="18" y="39" width="12" height="5" stroke="#1A1A1A" strokeWidth="1.2" />
            <polygon
              points="18,9 30,9 38,17 38,31 30,39 18,39 10,31 10,17"
              stroke="#1A1A1A"
              strokeWidth="1.4"
              fill="#FFFFFF"
            />
            <circle cx="24" cy="24" r="9.5" stroke="#B8975A" strokeWidth="1.1" />
            <line
              x1="24"
              y1="24"
              x2="24"
              y2="17"
              stroke="#1A1A1A"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1="24"
              y1="24"
              x2="29"
              y2="26.5"
              stroke="#1A1A1A"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="24" r="1.4" fill="#B8975A" />
          </svg>
        </div>

        <p className="text-xs font-medium tracking-[0.2em] text-[#85662C] tabular-nums">404</p>
        <h1 className="mt-3 font-serif text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.1] text-[#1A1A1A]">
          A moment untracked.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base font-light leading-[1.7] text-[#1A1A1A]/75">
          The page you are looking for has moved or no longer resides in our atelier archive.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
            Return Home
          </Link>
          <Link to="/collection" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
            Explore Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
