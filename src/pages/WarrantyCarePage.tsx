import { Link } from 'react-router-dom';
import { EditorialDocLayout } from '../components/EditorialDocLayout';
import { VERELLIS_TOKENS } from '../styles/tokens';

const WARRANTY_TOC = [
  { id: 'warranty-coverage', label: '5-Year Warranty Coverage' },
  { id: 'exclusions', label: 'Coverage Exclusions' },
  { id: 'water-resistance', label: 'Water Resistance Care' },
  { id: 'cleaning', label: 'Cleaning & Surface Care' },
  { id: 'servicing', label: 'Servicing Every 5 Years' },
] as const;

export default function WarrantyCarePage() {
  return (
    <EditorialDocLayout
      kicker="Client Care"
      title="Warranty & Care"
      subtitle="Engineered for decades of mechanical service and supported by five years of direct Geneva atelier care."
      toc={WARRANTY_TOC}
      footerActions={
        <>
          <Link to="/contact" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
            Schedule Service Review
          </Link>
          <Link to="/collection" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
            Explore Collection
          </Link>
        </>
      }
    >
      <section id="warranty-coverage" className="scroll-mt-24 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          5-Year Warranty Coverage
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Every VERELLIS timepiece includes a transferable five-year international atelier warranty
          from the original delivery date. Coverage encompasses movement timing tolerances,
          automatic rotor winding assembly, applied dial indices, crown threading, and factory
          water-resistance gaskets against any defect in materials or workmanship.
        </p>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Warranty interventions include complimentary insured two-way courier collection to and from
          our Geneva workshop.
        </p>
      </section>

      <section id="exclusions" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          Coverage Exclusions
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Our warranty does not cover damage arising from heavy external impact, accidental drops,
          normal surface wear on brushed steel, gold plating, or DLC finishes, moisture intrusion
          caused by leaving the crown unscrewed, or opening and intervention performed outside an
          authorized VERELLIS atelier.
        </p>
      </section>

      <section id="water-resistance" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          Water Resistance Care
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Each VERELLIS case is tested to 100 metres (10 ATM), making it suitable for everyday wear,
          rain, and surface swimming. Before entering water, always verify that the knurled crown is
          screwed cleanly flush against the case flank.
        </p>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Never operate the crown while the watch is submerged or wet, and avoid extreme thermal
          shocks such as saunas or hot steam baths, which accelerate gasket fatigue.
        </p>
      </section>

      <section id="cleaning" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          Cleaning &amp; Surface Care
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          After exposure to saltwater, chlorine, or perspiration, rinse the sealed watch briefly in
          lukewarm fresh water and pat dry with a soft, lint-free microfiber cloth. To clean between
          integrated bracelet links, use mild liquid soap and an ultra-soft bristle brush.
        </p>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          Avoid chemical solvents, ultrasonic home baths, and abrasive polishing cloths—particularly
          on brushed 316L surfaces, 18k gold edges, and matte black DLC coatings.
        </p>
      </section>

      <section id="servicing" className="scroll-mt-24 border-t border-[#1A1A1A]/8 pt-10 space-y-3">
        <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
          Servicing Every 5 Years
        </h2>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          While modern synthetic oils remain stable across daily temperature swings, VERELLIS
          recommends a complete atelier overhaul every 5 years. A full service includes complete
          calibre disassembly, ultrasonic cleaning, fresh lubrication, mainspring replacement,
          gasket renewal, and 240-hour five-position timing certification.
        </p>
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#1A1A1A]/75">
          If you swim frequently, we suggest an intermediate complimentary pressure test every 24
          months at our Geneva bench.
        </p>
      </section>
    </EditorialDocLayout>
  );
}
