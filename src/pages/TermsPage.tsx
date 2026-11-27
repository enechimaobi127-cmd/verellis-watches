import { Link } from 'react-router-dom';
import { EditorialDocLayout } from '../components/EditorialDocLayout';
import { VERELLIS_TOKENS } from '../styles/tokens';

const TERMS_TOC = [
  { id: 'demo-nature', label: '01. Demo Showcase Scope' },
  { id: 'allocations', label: '02. Allocations & Pricing' },
  { id: 'bespoke-engraving', label: '03. Sizing & Engraving' },
  { id: 'warranty-governing', label: '04. Warranty & Law' },
] as const;

export default function TermsPage() {
  return (
    <EditorialDocLayout
      kicker="Legal"
      title="Terms of Use"
      subtitle="Effective 2026 · VERELLIS Geneva"
      metaNote="Template text, review with legal counsel before use"
      toc={TERMS_TOC}
      footerActions={
        <>
          <Link to="/privacy" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
            View Privacy Policy
          </Link>
          <Link to="/collection" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
            Explore Collection
          </Link>
        </>
      }
    >
      <section id="demo-nature" className="scroll-mt-24 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          01. Demo Showcase Scope
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          This web experience demonstrates VERELLIS timepieces, pricing illustrations, and demo
          checkout workflows. No financial transactions, card authorizations, or binding shipment
          contracts are concluded through this interactive preview.
        </p>
      </section>

      <section id="allocations" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          02. Allocations &amp; Pricing
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          VERELLIS timepieces are assembled in numbered small runs. Displayed prices (Argent at
          $4,800, Aurum at $7,200, Noir at $5,400) include complimentary insured global courier
          shipping and presentation packaging, excluding local import duties where applicable.
        </p>
      </section>

      <section id="bespoke-engraving" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          03. Complimentary Sizing &amp; Engraving
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Complimentary bracelet link adjustment preserves full 30-day return eligibility provided
          the timepiece remains unworn and all removed links accompany the return. Custom-engraved
          casebacks may be subject to caseback restoration fees upon return.
        </p>
      </section>

      <section id="warranty-governing" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          04. Warranty &amp; Governing Law
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          The five-year VERELLIS mechanical warranty applies strictly to timepieces maintained in
          accordance with our Warranty &amp; Care guidelines. Placeholder terms are framed under
          Swiss civil commercial principles for demonstration purposes.
        </p>
      </section>
    </EditorialDocLayout>
  );
}
