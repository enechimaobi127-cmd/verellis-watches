import { Link } from 'react-router-dom';
import { EditorialDocLayout } from '../components/EditorialDocLayout';
import { VERELLIS_TOKENS } from '../styles/tokens';

const SHIPPING_TOC = [
  { id: 'free-insured-shipping', label: 'Free Insured Shipping' },
  { id: 'delivery-times', label: 'Delivery Times' },
  { id: 'unworn-returns', label: '30-Day Returns' },
  { id: 'how-to-return', label: 'How to Start a Return' },
] as const;

export default function ShippingReturnsPage() {
  return (
    <EditorialDocLayout
      kicker="Client Care"
      title="Shipping & Returns"
      subtitle="Transparent, fully insured armored logistics from our Geneva workbench to collectors worldwide."
      toc={SHIPPING_TOC}
      footerActions={
        <>
          <Link to="/faq" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
            Read Shipping FAQ
          </Link>
          <Link to="/contact" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
            Contact Concierge
          </Link>
        </>
      }
    >
      <section id="free-insured-shipping" className="scroll-mt-24 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          Free Insured Shipping
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Every VERELLIS allocation ships complimentary via dedicated insured express courier. Full
          replacement insurance protects each parcel from the moment it leaves our Geneva safe until
          direct adult-signature handoff at your chosen delivery address.
        </p>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Discreet outer packaging conceals brand markings during transit, with tracking telemetry
          shared directly through your concierge link upon dispatch.
        </p>
      </section>

      <section id="delivery-times" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-4">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          Delivery Times
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Prior to shipping, each timepiece undergoes final wrist sizing, ultrasonic bracelet
          cleaning, and five-position timing verification.
        </p>
        <dl className="divide-y divide-[#1A1A1A]/8 border-y border-[#1A1A1A]/8 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-3.5">
            <dt className="font-medium text-[#1A1A1A]">Argent &amp; Noir (Steel / DLC)</dt>
            <dd className="font-light text-[#1A1A1A]/75">Dispatched within 5 business days · 2–4 days transit</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-3.5">
            <dt className="font-medium text-[#1A1A1A]">Aurum (18k Gold)</dt>
            <dd className="font-light text-[#1A1A1A]/75">Hand-regulated to order in 2 to 3 weeks · 2–4 days transit</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-3.5">
            <dt className="font-medium text-[#1A1A1A]">Bespoke Caseback Engraving</dt>
            <dd className="font-light text-[#1A1A1A]/75">Add 2 additional bench days prior to courier handoff</dd>
          </div>
        </dl>
      </section>

      <section id="unworn-returns" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          30-Day Returns on Unworn Watches
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          We invite you to evaluate your VERELLIS watch unhurriedly indoors for up to 30 calendar
          days following delivery. If you decide not to keep your timepiece, return it in unworn
          condition with protective clasp film, serial hangtags, presentation box, and removed links
          intact for a complete refund with zero restocking fee.
        </p>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Watches showing bracelet wear marks or custom-engraved casebacks may incur restoration
          assessment fees before refund approval.
        </p>
      </section>

      <section id="how-to-return" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-4">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          How to Start a Return
        </h2>
        <ol className="space-y-3 text-sm sm:text-base font-light leading-[1.75] text-[#1A1A1A]/75 list-decimal pl-5">
          <li>
            Contact our concierge desk at{' '}
            <span className="font-normal text-[#1A1A1A]">concierge@verellis-horology.example</span>{' '}
            or via the private appointment page with your order reference within 30 days of
            receipt.
          </li>
          <li>
            Receive a pre-paid insured courier waybill and tamper-evident transit pouch by email
            within one business day.
          </li>
          <li>
            Repackage the unworn watch inside its full presentation set and schedule courier pickup
            from your home or workplace.
          </li>
          <li>
            Once inspected by our Geneva watchmakers (within 3 business days of arrival), your full
            refund is issued to the original payment method.
          </li>
        </ol>
      </section>
    </EditorialDocLayout>
  );
}
