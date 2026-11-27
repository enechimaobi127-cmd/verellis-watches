import type { SVGProps } from 'react';

export type BrandTone = 'charcoal' | 'white';
export type BrandSize = 'sm' | 'md' | 'lg';

interface MarkProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  tone?: BrandTone;
  sizePx?: number;
}

interface WordmarkProps {
  tone?: BrandTone;
  size?: BrandSize;
  className?: string;
}

interface FullLogoProps {
  tone?: BrandTone;
  size?: BrandSize;
  className?: string;
}

const TONE_HEX: Record<BrandTone, string> = {
  charcoal: '#1A1A1A',
  white: '#FFFFFF',
};

/**
 * Mark only: thin-line octagon (echoing the VERELLIS watch case)
 * containing a minimal geometric V and one hairline watch-hand detail.
 */
export function VerellisMark({
  tone = 'charcoal',
  sizePx = 28,
  className = '',
  ...rest
}: MarkProps) {
  const strokeColor = TONE_HEX[tone];

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      style={{ color: strokeColor }}
      {...rest}
    >
      {/* Thin-line octagonal case silhouette */}
      <polygon
        points="13.5,4 26.5,4 36,13.5 36,26.5 26.5,36 13.5,36 4,26.5 4,13.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="miter"
      />
      {/* Minimal geometric V */}
      <path
        d="M12.5 14 L20 27.5 L27.5 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hairline watch hand detail */}
      <line
        x1="18.5"
        y1="20.3"
        x2="26.3"
        y2="11.2"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="20" cy="18.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

const WORDMARK_SIZE_CLASSES: Record<BrandSize, string> = {
  sm: 'text-[clamp(0.95rem,1.8vw,1.15rem)] tracking-[0.24em]',
  md: 'text-xl sm:text-[1.35rem] tracking-[0.26em]',
  lg: 'text-3xl sm:text-4xl tracking-[0.3em]',
};

/**
 * Wordmark only: "VERELLIS" in widely tracked serif capitals.
 */
export function VerellisWordmark({
  tone = 'charcoal',
  size = 'md',
  className = '',
}: WordmarkProps) {
  return (
    <span
      className={`font-serif font-medium uppercase leading-none whitespace-nowrap select-none ${WORDMARK_SIZE_CLASSES[size]} ${className}`}
      style={{ color: TONE_HEX[tone] }}
    >
      VERELLIS
    </span>
  );
}

const FULL_LOGO_CONFIG: Record<BrandSize, { gapClass: string; markPxClass: string }> = {
  sm: { gapClass: 'gap-2.5', markPxClass: 'h-6 w-6 sm:h-[26px] sm:w-[26px]' },
  md: { gapClass: 'gap-3', markPxClass: 'h-7 w-7 sm:h-8 sm:w-8' },
  lg: { gapClass: 'gap-4', markPxClass: 'h-11 w-11 sm:h-12 sm:w-12' },
};

/**
 * Full logo: octagonal watch-hand mark paired with the VERELLIS wordmark.
 */
export function VerellisLogo({
  tone = 'charcoal',
  size = 'sm',
  className = '',
}: FullLogoProps) {
  const cfg = FULL_LOGO_CONFIG[size];

  return (
    <span className={`inline-flex items-center ${cfg.gapClass} ${className}`}>
      <VerellisMark tone={tone} className={cfg.markPxClass} />
      <VerellisWordmark tone={tone} size={size} />
    </span>
  );
}
