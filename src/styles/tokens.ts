export const VERELLIS_TOKENS = {
  colors: {
    canvas: '#FFFFFF',
    surfaceSoft: '#FAF9F6',
    surfaceMuted: '#F5F4F0',
    charcoal: '#1A1A1A',
    gold: '#B8975A',
    goldAccessible: '#85662C',
    goldDark: '#85662C',
    borderSubtle: 'rgba(26, 26, 26, 0.08)',
    borderStrong: 'rgba(26, 26, 26, 0.16)',
  },
  fonts: {
    serif: '"Cormorant Garamond", Georgia, serif',
    sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  layout: {
    maxWidthPx: 1200,
    containerClass: 'mx-auto w-full max-w-[1200px] px-6 min-[900px]:px-16',
    sectionPaddingClass: 'py-[clamp(64px,9vw,108px)]',
    headerHeightPx: 64,
    mobileButtonMinHeightPx: 48,
  },
  surfaces: {
    glassCardClass: 'craft-glass-card rounded-2xl',
    primaryButtonClass:
      'inline-flex min-h-[48px] items-center justify-center rounded-sm bg-[#1A1A1A] px-7 py-3 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] whitespace-nowrap cursor-pointer',
    secondaryButtonClass:
      'inline-flex min-h-[48px] items-center justify-center rounded-sm border border-[#1A1A1A]/20 bg-white px-7 py-3 text-xs font-medium tracking-[0.14em] text-[#1A1A1A] transition-colors duration-200 hover:border-[#1A1A1A] hover:bg-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#85662C] whitespace-nowrap cursor-pointer',
  },
} as const;
