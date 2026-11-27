import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WATCH_EDITIONS } from '../watch/catalog';
import { EDITION_MEDIA } from '../data/siteContent';

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, isOpen, closeCart, updateQuantity, removeItem } =
    useCart();

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      data-testid="cart-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-[#1A1A1A]/35"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <aside className="flex h-full w-full sm:max-w-[440px] flex-col bg-white shadow-[-16px_0_48px_-12px_rgba(26,26,26,0.2)]">
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#1A1A1A]/8 px-6">
          <div className="flex items-baseline gap-2.5">
            <h2
              id="cart-drawer-title"
              className="font-serif text-2xl font-medium text-[#1A1A1A]"
            >
              Atelier Bag
            </h2>
            <span className="text-xs font-normal tabular-nums text-[#1A1A1A]/65">
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close shopping bag"
            data-testid="cart-drawer-close"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-[#1A1A1A]/75 transition-colors hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C] cursor-pointer"
          >
            <X className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1A1A1A]/10 text-[#1A1A1A]/65">
                <ShoppingBag className="h-6 w-6 stroke-[1.4]" aria-hidden="true" />
              </div>
              <p className="mt-5 font-serif text-2xl font-medium text-[#1A1A1A]">
                Your bag is empty
              </p>
              <p className="mt-2 max-w-xs text-sm font-light text-[#1A1A1A]/70">
                Select one of the three octagonal editions to prepare an atelier allocation.
              </p>
              <Link
                to="/collection"
                onClick={closeCart}
                className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-sm bg-[#1A1A1A] px-7 text-xs font-medium tracking-[0.14em] text-white transition-colors hover:bg-[#85662C]"
              >
                Explore the Collection
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-[#1A1A1A]/8">
              {items.map((item) => {
                const spec =
                  WATCH_EDITIONS.find((e) => e.id === item.editionId) ?? WATCH_EDITIONS[0];
                const media = EDITION_MEDIA[item.editionId];
                return (
                  <li
                    key={item.editionId}
                    data-testid={`cart-item-${item.editionId}`}
                    className="flex gap-4 py-5 first:pt-0"
                  >
                    <Link
                      to={`/watch/${item.editionId}`}
                      onClick={closeCart}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[#1A1A1A]/8 bg-[#FAF9F6]"
                    >
                      <img
                        src={media.image}
                        alt={media.alt}
                        width={1200}
                        height={896}
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/watch/${item.editionId}`}
                            onClick={closeCart}
                            className="font-serif text-lg font-medium text-[#1A1A1A] hover:text-[#85662C] transition-colors"
                          >
                            {spec.name}
                          </Link>
                          <p className="text-xs font-light text-[#1A1A1A]/65 truncate">
                            {media.referenceCode} · {media.diameter}
                          </p>
                          {item.note && (
                            <p className="mt-1 text-xs text-[#85662C] truncate">
                              Note: {item.note}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-normal tabular-nums text-[#1A1A1A] whitespace-nowrap">
                          {formatCurrency(spec.numericPrice * item.quantity)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-sm border border-[#1A1A1A]/15">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.editionId, -1)}
                            aria-label={`Decrease ${spec.name} quantity`}
                            data-testid={`cart-qty-dec-${item.editionId}`}
                            className="inline-flex h-10 w-10 items-center justify-center text-[#1A1A1A]/75 hover:bg-[#FAF9F6] hover:text-[#1A1A1A] cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span
                            data-testid={`cart-qty-val-${item.editionId}`}
                            className="min-w-[2rem] text-center text-xs font-medium tabular-nums text-[#1A1A1A]"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.editionId, 1)}
                            aria-label={`Increase ${spec.name} quantity`}
                            data-testid={`cart-qty-inc-${item.editionId}`}
                            className="inline-flex h-10 w-10 items-center justify-center text-[#1A1A1A]/75 hover:bg-[#FAF9F6] hover:text-[#1A1A1A] cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.editionId)}
                          aria-label={`Remove ${spec.name} from bag`}
                          data-testid={`cart-remove-${item.editionId}`}
                          className="inline-flex min-h-[40px] items-center gap-1.5 px-2 text-xs text-[#1A1A1A]/65 transition-colors hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#1A1A1A]/8 bg-[#FAF9F6] px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs tracking-[0.08em] text-[#1A1A1A]/70">Subtotal</span>
              <span
                data-testid="cart-subtotal"
                className="font-serif text-2xl font-medium tabular-nums text-[#1A1A1A]"
              >
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="mt-1.5 text-xs font-light text-[#1A1A1A]/65">
              Complimentary insured shipping and 5-year atelier warranty included.
            </p>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              data-testid="cart-checkout-btn"
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-sm bg-[#1A1A1A] px-6 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#85662C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85662C] cursor-pointer"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
