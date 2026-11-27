import type { ReactNode } from 'react';
import { VERELLIS_TOKENS } from '../styles/tokens';

export interface DocTocItem {
  id: string;
  label: string;
}

interface EditorialDocLayoutProps {
  kicker: string;
  title: string;
  subtitle?: string;
  metaNote?: string;
  toc: readonly DocTocItem[];
  children: ReactNode;
  footerActions?: ReactNode;
}

export function EditorialDocLayout({
  kicker,
  title,
  subtitle,
  metaNote,
  toc,
  children,
  footerActions,
}: EditorialDocLayoutProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="page-fade-enter bg-white pt-16">
      <section className={VERELLIS_TOKENS.layout.sectionPaddingClass}>
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <header className="max-w-3xl border-b border-[#1A1A1A]/10 pb-10">
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">{kicker}</p>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,4.4vw,3.4rem)] font-medium leading-[1.08] tracking-tight text-[#1A1A1A]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-base font-light leading-[1.7] text-[#1A1A1A]/75">
                {subtitle}
              </p>
            )}
            {metaNote && (
              <p
                data-testid="doc-meta-note"
                className="mt-4 inline-block rounded-sm border border-[#B8975A]/30 bg-[#FAF9F6] px-3 py-1.5 text-xs font-normal tracking-[0.04em] text-[#1A1A1A]/75"
              >
                {metaNote}
              </p>
            )}
          </header>

          {/* Mobile Quick Contents */}
          <nav
            aria-label="Page contents"
            className="mt-8 rounded-xl border border-[#1A1A1A]/10 bg-[#FAF9F6] p-4 min-[900px]:hidden"
          >
            <p className="text-[11px] font-medium tracking-[0.12em] text-[#1A1A1A]/65">
              On this page
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className="inline-flex min-h-[36px] items-center text-xs font-normal text-[#1A1A1A]/80 underline-offset-4 hover:text-[#85662C] hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop 2-Column Editorial Grid */}
          <div className="mt-12 grid grid-cols-1 gap-12 min-[900px]:grid-cols-12 min-[900px]:gap-14 items-start">
            {/* Left Sticky Table of Contents */}
            <aside className="hidden min-[900px]:block min-[900px]:col-span-4 lg:col-span-3 sticky top-24">
              <nav aria-label="Table of contents" className="border-l border-[#1A1A1A]/12 pl-5">
                <p className="text-[11px] font-medium tracking-[0.14em] text-[#85662C]">
                  Contents
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.id);
                        }}
                        className="block py-1 text-sm font-light text-[#1A1A1A]/70 transition-colors hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8975A]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Right Main Reading Column */}
            <div className="min-[900px]:col-span-8 lg:col-span-9 min-w-0">
              <div className="max-w-3xl space-y-12">{children}</div>

              {footerActions && (
                <div className="mt-14 max-w-3xl border-t border-[#1A1A1A]/10 pt-8 flex flex-wrap gap-4">
                  {footerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
