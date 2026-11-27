import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { EditorialDocLayout } from '../components/EditorialDocLayout';
import { FAQ_ITEMS } from '../data/siteContent';
import { VERELLIS_TOKENS } from '../styles/tokens';

const FAQ_CATEGORIES = [
  { id: 'sizing-fit', label: 'Sizing & Fit' },
  { id: 'orders-payment', label: 'Ordering & Payment' },
  { id: 'shipping-returns', label: 'Shipping & Returns' },
  { id: 'craft-authenticity', label: 'Craft & Authenticity' },
  { id: 'servicing-warranty', label: 'Servicing & Warranty' },
] as const;

export default function FaqPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(FAQ_ITEMS[0].question);

  return (
    <EditorialDocLayout
      kicker="Client Care"
      title="Frequently Asked Questions"
      subtitle="Clear guidance on bracelet sizing, timepiece authenticity, engraving, payments, shipping, and mechanical servicing."
      toc={FAQ_CATEGORIES}
      footerActions={
        <>
          <Link to="/contact" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
            Ask a Watch Specialist
          </Link>
          <Link to="/collection" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
            Explore Collection
          </Link>
        </>
      }
    >
      {FAQ_CATEGORIES.map((category, catIdx) => {
        const items = FAQ_ITEMS.filter((item) => item.categoryId === category.id);
        return (
          <section
            key={category.id}
            id={category.id}
            className={`scroll-mt-24 ${catIdx > 0 ? 'border-t border-[#1A1A1A]/10 pt-10' : ''}`}
          >
            <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium text-[#1A1A1A]">
              {category.label}
            </h2>

            <div className="mt-5 divide-y divide-[#1A1A1A]/10 border-y border-[#1A1A1A]/10">
              {items.map((item) => {
                const isOpen = openQuestion === item.question;
                return (
                  <div key={item.question} className="py-1.5">
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                      aria-expanded={isOpen}
                      className="flex min-h-[56px] w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C] cursor-pointer"
                    >
                      <span className="font-serif text-xl font-medium text-[#1A1A1A]">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#1A1A1A]/70 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-5 pr-8 text-sm font-light leading-[1.75] text-[#1A1A1A]/75">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </EditorialDocLayout>
  );
}
