import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { WATCH_EDITIONS, type WatchEditionId, type WatchEditionSpec } from '../watch/catalog';
import { validateReservationInput } from '../watch/scrollState';

interface ReservationModalProps {
  open: boolean;
  initialEdition: WatchEditionSpec;
  onClose: () => void;
}

export function ReservationModal({ open, initialEdition, onClose }: ReservationModalProps) {
  const [editionId, setEditionId] = useState<WatchEditionId>(initialEdition.id);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEditionId(initialEdition.id);
      setErrors({});
      setConfirmedRef(null);
    }
  }, [open, initialEdition.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectedSpec = WATCH_EDITIONS.find((e) => e.id === editionId) ?? WATCH_EDITIONS[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateReservationInput({
      fullName,
      email,
      editionId,
      boutiqueNote: note,
    });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    const code = `VRL-${selectedSpec.id.slice(0, 3).toUpperCase()}-${String(
      1040 + fullName.trim().length * 7,
    )}`;
    setConfirmedRef(code);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/35 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-[#1A1A1A]/12 bg-white p-7 sm:p-8 shadow-[0_24px_60px_-16px_rgba(26,26,26,0.22)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reservation dialog"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A]/60 transition-colors hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {confirmedRef ? (
          <div className="py-2">
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
              Allocation Requested
            </p>
            <h2
              id="reservation-modal-title"
              className="mt-2 font-serif text-3xl font-medium text-[#1A1A1A]"
            >
              Reservation Registered
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[#1A1A1A]/75">
              Thank you, {fullName.trim()}. Your allocation request for the{' '}
              <span className="font-medium text-[#1A1A1A]">
                VERELLIS {selectedSpec.name} ({selectedSpec.price})
              </span>{' '}
              has been assigned reference{' '}
              <span className="font-medium tabular-nums text-[#1A1A1A]">{confirmedRef}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-sm bg-[#1A1A1A] px-6 py-3 text-xs font-medium tracking-[0.14em] text-white transition-colors hover:bg-[#85662C] cursor-pointer"
            >
              Return to Showcase
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-xs font-medium tracking-[0.14em] text-[#85662C]">
              Private Atelier Allocation
            </p>
            <h2
              id="reservation-modal-title"
              className="mt-1.5 font-serif text-3xl font-medium text-[#1A1A1A]"
            >
              Reserve Yours
            </h2>

            <div className="mt-5">
              <span className="block text-xs font-normal tracking-[0.06em] text-[#1A1A1A]/65">
                Timepiece Edition
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {WATCH_EDITIONS.map((item) => {
                  const active = item.id === editionId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEditionId(item.id)}
                      className={`min-h-[48px] rounded-md border px-3 py-2 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                          : 'border-[#1A1A1A]/12 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/35'
                      }`}
                    >
                      <span className="block font-serif text-base font-medium leading-tight">
                        {item.name}
                      </span>
                      <span
                        className={`block text-[11px] tabular-nums ${
                          active ? 'text-white/85' : 'text-[#1A1A1A]/65'
                        }`}
                      >
                        {item.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="reserve-full-name"
                className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
              >
                Full Name
              </label>
              <input
                id="reserve-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Claire Moreau"
                className="mt-1.5 w-full rounded-md border border-[#1A1A1A]/15 px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="reserve-email"
                className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
              >
                Email Address
              </label>
              <input
                id="reserve-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="claire@atelier.ch"
                className="mt-1.5 w-full rounded-md border border-[#1A1A1A]/15 px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="reserve-note"
                className="block text-xs tracking-[0.06em] text-[#1A1A1A]/70"
              >
                Engraving or Wrist Sizing Note (Optional)
              </label>
              <input
                id="reserve-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="17.5 cm wrist · Geneva pickup"
                className="mt-1.5 w-full rounded-md border border-[#1A1A1A]/15 px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/60 focus:border-[#85662C] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-sm bg-[#1A1A1A] px-6 py-3 text-xs font-medium tracking-[0.14em] text-white transition-colors hover:bg-[#85662C] cursor-pointer"
            >
              Confirm Allocation Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
