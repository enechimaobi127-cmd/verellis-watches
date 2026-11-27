import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import { useCart, type CartItem } from '../context/CartContext';
import { WATCH_EDITIONS } from '../watch/catalog';
import { EDITION_MEDIA } from '../data/siteContent';
import { VERELLIS_TOKENS } from '../styles/tokens';

interface OrderSnapshot {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  wristNote: string;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Switzerland');
  const [wristNote, setWristNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<OrderSnapshot | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!address.trim()) nextErrors.address = 'Please enter a street address.';
    if (!city.trim()) nextErrors.city = 'Please enter a city.';
    if (!postalCode.trim()) nextErrors.postalCode = 'Please enter a postal code.';
    if (!country.trim()) nextErrors.country = 'Please enter a country.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const seed = 4200 + items.reduce((acc, i) => acc + i.quantity * 37, 0) + fullName.trim().length * 13;
    const orderNumber = `VRL-2026-${seed}`;

    setConfirmedOrder({
      orderNumber,
      items: [...items],
      subtotal,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      wristNote: wristNote.trim(),
    });
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (confirmedOrder) {
    return (
      <main className="page-fade-enter bg-white pt-16">
        <section className={VERELLIS_TOKENS.layout.sectionPaddingClass}>
          <div className={VERELLIS_TOKENS.layout.containerClass}>
            <div
              data-testid="checkout-confirmation"
              className="mx-auto max-w-2xl rounded-2xl border border-[#1A1A1A]/10 bg-white p-8 sm:p-10 shadow-[0_18px_48px_-16px_rgba(26,26,26,0.08)]"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#B8975A]/40 bg-[#FAF9F6] text-[#85662C]">
                <Check className="h-5 w-5 stroke-[1.75]" aria-hidden="true" />
              </div>

              <p className="mt-5 text-xs font-medium tracking-[0.14em] text-[#85662C]">
                Order Confirmation
              </p>
              <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.12] text-[#1A1A1A]">
                Thank you, {confirmedOrder.fullName}.
              </h1>
              <p className="mt-3 text-sm font-light leading-[1.7] text-[#1A1A1A]/75">
                Your demo order reference{' '}
                <span
                  data-testid="checkout-order-number"
                  className="font-medium tabular-nums text-[#1A1A1A]"
                >
                  {confirmedOrder.orderNumber}
                </span>{' '}
                has been recorded. This was a demo checkout and no payment was taken or card data
                collected.
              </p>

              {/* Itemized Summary */}
              <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6">
                <h2 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                  Order Summary
                </h2>
                <ul className="mt-4 divide-y divide-[#1A1A1A]/8">
                  {confirmedOrder.items.map((item) => {
                    const spec =
                      WATCH_EDITIONS.find((e) => e.id === item.editionId) ?? WATCH_EDITIONS[0];
                    const media = EDITION_MEDIA[item.editionId];
                    return (
                      <li
                        key={item.editionId}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-serif text-lg font-medium text-[#1A1A1A]">
                            VERELLIS {spec.name}
                          </p>
                          <p className="text-xs font-light text-[#1A1A1A]/65 tabular-nums">
                            {media.referenceCode} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className="font-normal tabular-nums text-[#1A1A1A]">
                          {formatCurrency(spec.numericPrice * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-[#1A1A1A]/10 pt-4">
                  <span className="text-xs tracking-[0.08em] text-[#1A1A1A]/65">
                    Total (Insured Shipping Included)
                  </span>
                  <span className="font-serif text-2xl font-medium tabular-nums text-[#1A1A1A]">
                    {formatCurrency(confirmedOrder.subtotal)}
                  </span>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="mt-6 rounded-xl bg-[#FAF9F6] p-5 text-xs font-light leading-[1.7] text-[#1A1A1A]/75">
                <p className="font-medium text-[#1A1A1A]">Dispatch Destination</p>
                <p className="mt-1">{confirmedOrder.fullName}</p>
                <p>{confirmedOrder.address}</p>
                <p>
                  {confirmedOrder.city}, {confirmedOrder.postalCode} · {confirmedOrder.country}
                </p>
                <p className="mt-1">{confirmedOrder.email}</p>
                {confirmedOrder.wristNote && (
                  <p className="mt-1 text-[#85662C]">Sizing / Note: {confirmedOrder.wristNote}</p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/collection" className={VERELLIS_TOKENS.surfaces.primaryButtonClass}>
                  Explore Collection
                </Link>
                <Link to="/" className={VERELLIS_TOKENS.surfaces.secondaryButtonClass}>
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-fade-enter bg-white pt-16">
      <section className={VERELLIS_TOKENS.layout.sectionPaddingClass}>
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          {/* Demo Checkout Banner */}
          <div
            data-testid="demo-checkout-banner"
            role="note"
            className="mb-10 flex items-center gap-3 rounded-xl border border-[#B8975A]/35 bg-[#FAF9F6] px-5 py-4 text-sm text-[#1A1A1A]"
          >
            <Info className="h-4 w-4 shrink-0 text-[#85662C]" aria-hidden="true" />
            <p className="font-light">
              <span className="font-medium">Demo checkout, no payment is taken.</span> No card
              details are collected or stored.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="py-14 text-center">
              <h1 className="font-serif text-3xl font-medium text-[#1A1A1A]">
                Your bag is currently empty
              </h1>
              <p className="mt-3 text-sm font-light text-[#1A1A1A]/70">
                Add a VERELLIS timepiece to proceed through the demo checkout summary.
              </p>
              <Link
                to="/collection"
                className={`mt-6 ${VERELLIS_TOKENS.surfaces.primaryButtonClass}`}
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14 items-start">
              {/* Left: Contact & Shipping Address Form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="lg:col-span-7 space-y-8"
              >
                <div>
                  <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.1] text-[#1A1A1A]">
                    Checkout
                  </h1>
                  <p className="mt-2 text-sm font-light text-[#1A1A1A]/65">
                    Enter your contact and delivery details to generate your demo allocation confirmation.
                  </p>
                </div>

                {/* Contact Details */}
                <fieldset className="space-y-4 border-t border-[#1A1A1A]/10 pt-6">
                  <legend className="font-serif text-2xl font-medium text-[#1A1A1A]">
                    Contact Details
                  </legend>

                  <div>
                    <label
                      htmlFor="checkout-full-name"
                      className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                    >
                      Full Name
                    </label>
                    <input
                      id="checkout-full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Claire Moreau"
                      className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                    />
                    {errors.fullName && (
                      <p role="alert" className="mt-1 text-xs text-red-700">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="checkout-email"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                      >
                        Email Address
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="claire@domain.com"
                        className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1 text-xs text-red-700">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-phone"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                      >
                        Phone Number (Optional)
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+41 22 555 0194"
                        className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Shipping Address */}
                <fieldset className="space-y-4 border-t border-[#1A1A1A]/10 pt-6">
                  <legend className="font-serif text-2xl font-medium text-[#1A1A1A]">
                    Shipping Address
                  </legend>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                    >
                      Street Address
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rue du Rhône 42"
                      className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                    />
                    {errors.address && (
                      <p role="alert" className="mt-1 text-xs text-red-700">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                      >
                        City
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Geneva"
                        className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                      />
                      {errors.city && (
                        <p role="alert" className="mt-1 text-xs text-red-700">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-postal"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                      >
                        Postal Code
                      </label>
                      <input
                        id="checkout-postal"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="1204"
                        className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                      />
                      {errors.postalCode && (
                        <p role="alert" className="mt-1 text-xs text-red-700">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-country"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                      >
                        Country
                      </label>
                      <input
                        id="checkout-country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:border-[#B8975A] focus:outline-none"
                      />
                      {errors.country && (
                        <p role="alert" className="mt-1 text-xs text-red-700">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-wrist-note"
                      className="block text-xs tracking-[0.06em] text-[#1A1A1A]/65"
                    >
                      Complimentary Bracelet Sizing or Engraving Note (Optional)
                    </label>
                    <input
                      id="checkout-wrist-note"
                      type="text"
                      value={wristNote}
                      onChange={(e) => setWristNote(e.target.value)}
                      placeholder="17.5 cm wrist circumference"
                      className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                    />
                  </div>
                </fieldset>

                <button
                  type="submit"
                  data-testid="checkout-submit-btn"
                  className={`${VERELLIS_TOKENS.surfaces.primaryButtonClass} w-full`}
                >
                  Confirm Demo Order
                </button>
              </form>

              {/* Right: Bag Summary */}
              <aside className="lg:col-span-5 rounded-2xl border border-[#1A1A1A]/10 bg-[#FAF9F6] p-7">
                <h2 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  Order Summary
                </h2>
                <ul className="mt-5 divide-y divide-[#1A1A1A]/8">
                  {items.map((item) => {
                    const spec =
                      WATCH_EDITIONS.find((e) => e.id === item.editionId) ?? WATCH_EDITIONS[0];
                    const media = EDITION_MEDIA[item.editionId];
                    return (
                      <li key={item.editionId} className="flex items-center gap-4 py-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#1A1A1A]/8 bg-white">
                          <img
                            src={media.image}
                            alt={media.alt}
                            width={1200}
                            height={896}
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-lg font-medium text-[#1A1A1A]">
                            {spec.name}
                          </p>
                          <p className="text-xs font-light text-[#1A1A1A]/65 tabular-nums">
                            Qty {item.quantity} · {media.referenceCode}
                          </p>
                        </div>
                        <span className="text-sm font-normal tabular-nums text-[#1A1A1A]">
                          {formatCurrency(spec.numericPrice * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 space-y-2 border-t border-[#1A1A1A]/10 pt-4 text-sm">
                  <div className="flex justify-between text-[#1A1A1A]/70">
                    <span>Insured Courier Shipping</span>
                    <span>Complimentary</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-xs tracking-[0.08em] text-[#1A1A1A]/65">Total</span>
                    <span
                      data-testid="checkout-total"
                      className="font-serif text-2xl font-medium tabular-nums text-[#1A1A1A]"
                    >
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
