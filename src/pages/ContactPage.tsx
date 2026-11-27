import { useState, type FormEvent } from 'react';
import { WATCH_EDITIONS } from '../watch/catalog';
import { VERELLIS_TOKENS } from '../styles/tokens';

type PreferredWatchOption = 'argent' | 'aurum' | 'noir' | 'not-sure';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredWatch, setPreferredWatch] = useState<PreferredWatchOption>('argent');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) nextErrors.name = 'Please enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!message.trim()) {
      nextErrors.message = 'Please share a brief note or question for our concierge.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const code = `APT-${String(2040 + name.trim().length * 11)}`;
    setSubmittedRef(code);
  };

  const selectedWatchLabel =
    preferredWatch === 'not-sure'
      ? 'Not sure yet'
      : (WATCH_EDITIONS.find((w) => w.id === preferredWatch)?.name ?? 'Argent');

  return (
    <main className="page-fade-enter bg-white pt-16">
      <section className={VERELLIS_TOKENS.layout.sectionPaddingClass}>
        <div className={VERELLIS_TOKENS.layout.containerClass}>
          <div className="grid grid-cols-1 gap-12 min-[900px]:grid-cols-12 min-[900px]:gap-14">
            {/* Left Intro & Boutique Concierge Details */}
            <div className="min-[900px]:col-span-5">
              <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
                Private Concierge
              </p>
              <h1 className="mt-3 font-serif text-[clamp(2.2rem,4.2vw,3.25rem)] font-medium leading-[1.1] tracking-tight text-[#1A1A1A] text-balance">
                Speak with a watch specialist.
              </h1>
              <p className="mt-4 text-base font-light leading-[1.7] text-[#1A1A1A]/75">
                Arrange an unhurried private viewing at our sample Geneva boutique or connect via
                live video with an atelier watchmaker to compare finishes, plan bracelet sizing, or
                discuss bespoke caseback engraving.
              </p>

              <div className="mt-10 space-y-6 border-t border-[#1A1A1A]/10 pt-6 text-sm">
                <div>
                  <h2 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                    Sample Boutique Address
                  </h2>
                  <p className="mt-1.5 font-light leading-[1.65] text-[#1A1A1A]/70">
                    VERELLIS Salon · Rue du Rhône 42, 1204 Genève, Switzerland
                  </p>
                </div>

                <div>
                  <h2 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                    Concierge Hours
                  </h2>
                  <p className="mt-1.5 font-light tabular-nums text-[#1A1A1A]/70">
                    Monday – Saturday · 10:00 – 18:30 CET
                  </p>
                  <p className="mt-1 text-xs font-light text-[#1A1A1A]/65">
                    Sunday appointments available upon private request
                  </p>
                </div>

                <div>
                  <h2 className="text-xs font-medium tracking-[0.12em] text-[#1A1A1A]">
                    Direct Desk
                  </h2>
                  <p className="mt-1.5 font-light text-[#1A1A1A]/75">
                    concierge@verellis-horology.example
                  </p>
                  <p className="mt-1 font-light tabular-nums text-[#1A1A1A]/70">
                    +41 22 555 0194
                  </p>
                </div>
              </div>
            </div>

            {/* Right Concierge Form */}
            <div className="min-[900px]:col-span-7">
              <div className="craft-glass-card rounded-2xl p-7 sm:p-10">
                {submittedRef ? (
                  <div data-testid="contact-confirmation" className="py-4">
                    <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
                      Concierge Request Noted
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-medium text-[#1A1A1A]">
                      Thank you, {name.trim()}
                    </h2>
                    <p className="mt-3 text-sm font-light leading-[1.7] text-[#1A1A1A]/75">
                      Your inquiry regarding{' '}
                      <span className="font-medium text-[#1A1A1A]">{selectedWatchLabel}</span>
                      {preferredDate ? (
                        <>
                          {' '}
                          for <span className="font-medium text-[#1A1A1A]">{preferredDate}</span>
                        </>
                      ) : null}{' '}
                      has been recorded under reference{' '}
                      <span className="font-medium tabular-nums text-[#1A1A1A]">
                        {submittedRef}
                      </span>
                      . This preview form runs locally and does not send external emails.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedRef(null);
                        setName('');
                        setEmail('');
                        setPhone('');
                        setPreferredWatch('argent');
                        setPreferredDate('');
                        setMessage('');
                      }}
                      className={`mt-6 ${VERELLIS_TOKENS.surfaces.secondaryButtonClass}`}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                    <h2 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                      Private Concierge Inquiry
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
                        >
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                          }}
                          placeholder="Claire Moreau"
                          className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                        />
                        {errors.name && (
                          <p role="alert" className="mt-1 text-xs text-red-700">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
                        >
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                          }}
                          placeholder="claire@domain.com"
                          className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                        />
                        {errors.email && (
                          <p role="alert" className="mt-1 text-xs text-red-700">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
                        >
                          Phone (Optional)
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+41 22 555 0194"
                          className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-date"
                          className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
                        >
                          Preferred Date
                        </label>
                        <input
                          id="contact-date"
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:border-[#85662C] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-edition"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
                      >
                        Preferred Watch
                      </label>
                      <select
                        id="contact-edition"
                        value={preferredWatch}
                        onChange={(e) =>
                          setPreferredWatch(e.target.value as PreferredWatchOption)
                        }
                        className="mt-1.5 min-h-[48px] w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:border-[#85662C] focus:outline-none"
                      >
                        {WATCH_EDITIONS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.price})
                          </option>
                        ))}
                        <option value="not-sure">Not sure — advise me</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                        }}
                        placeholder="Share viewing format preferences, wrist circumference, or engraving questions."
                        className="mt-1.5 w-full rounded-sm border border-[#1A1A1A]/16 bg-white px-3.5 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
                      />
                      {errors.message && (
                        <p role="alert" className="mt-1 text-xs text-red-700">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      data-testid="contact-submit-btn"
                      className={`${VERELLIS_TOKENS.surfaces.primaryButtonClass} w-full`}
                    >
                      Request Concierge Appointment
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
