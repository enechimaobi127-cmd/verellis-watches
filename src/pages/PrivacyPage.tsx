import { Link } from 'react-router-dom';
import { EditorialDocLayout } from '../components/EditorialDocLayout';
import { VERELLIS_TOKENS } from '../styles/tokens';

const PRIVACY_TOC = [
  { id: 'information-collected', label: '01. Information Collected' },
  { id: 'local-storage', label: '02. Browser Storage' },
  { id: 'concierge-records', label: '03. Concierge Inquiries' },
  { id: 'your-rights', label: '04. Client Rights' },
] as const;

export default function PrivacyPage() {
  return (
    <EditorialDocLayout
      kicker="Legal"
      title="Privacy Policy"
      subtitle="Updated 2026 · VERELLIS Geneva"
      metaNote="Template text, review with legal counsel before use"
      toc={PRIVACY_TOC}
      footerActions={
        <>
          <Link to="/terms" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
            View Terms of Use
          </Link>
          <Link to="/contact" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
            Contact Concierge
          </Link>
        </>
      }
    >
      <section id="information-collected" className="scroll-mt-24 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          01. Information Collected
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          When you interact with forms on this showcase—such as requesting a private concierge
          appointment, entering shipping details in the demo checkout, or signing up for quarterly
          atelier notes—only the fields you explicitly enter (name, email, phone, and address) are
          processed inside your active browser session.
        </p>
      </section>

      <section id="local-storage" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          02. Browser Storage
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          We store your shopping bag items locally in browser storage so selected editions remain
          available as you browse pages. No third-party advertising trackers, behavioral profiling
          pixels, or cross-site analytics beacons are loaded on this website.
        </p>
      </section>

      <section id="concierge-records" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          03. Concierge Inquiries &amp; Ownership
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          In a production salon environment, client contact details, watch serial numbers, and
          engraving notes are retained solely to coordinate private viewings, insured courier
          dispatch, and lifetime mechanical servicing records.
        </p>
      </section>

      <section id="your-rights" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          04. Client Rights
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          You may clear locally stored bag preferences at any time by emptying your bag or clearing
          site data in your browser. For formal privacy inquiries, contact{' '}
          <span className="font-normal text-[#1A1A1A]">concierge@verellis-horology.example</span>.
        </p>
      </section>
    </EditorialDocLayout>
  );
}
