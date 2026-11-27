import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ROUTE_META } from './data/siteContent';

// Lazy-load every route so Three.js & GSAP load ONLY on / and /watch/*
const HomePage = lazy(() => import('./pages/HomePage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const WatchDetailPage = lazy(() => import('./pages/WatchDetailPage'));
const CraftPage = lazy(() => import('./pages/CraftPage'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));
const WarrantyCarePage = lazy(() => import('./pages/WarrantyCarePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function setHeadMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function RouteScrollAndMetaSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const meta = ROUTE_META[pathname] ?? ROUTE_META['404'];
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://verellis-horology.example';
    const rawBase = import.meta.env.BASE_URL || '/';
    const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
    const routeSuffix = pathname === '/' ? '' : pathname.replace(/^\//, '');
    const pageUrl = `${origin}${normalizedBase}${routeSuffix}`;
    const ogImageUrl = `${origin}${normalizedBase}og-image.png`;
    const isProductPage = pathname.startsWith('/watch/');

    document.title = meta.title;
    setHeadMeta('name', 'description', meta.description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', pageUrl);
    }

    setHeadMeta('property', 'og:type', isProductPage ? 'product' : 'website');
    setHeadMeta('property', 'og:title', meta.title);
    setHeadMeta('property', 'og:description', meta.description);
    setHeadMeta('property', 'og:url', pageUrl);
    setHeadMeta('property', 'og:image', ogImageUrl);

    setHeadMeta('name', 'twitter:card', 'summary_large_image');
    setHeadMeta('name', 'twitter:title', meta.title);
    setHeadMeta('name', 'twitter:description', meta.description);
    setHeadMeta('name', 'twitter:url', pageUrl);
    setHeadMeta('name', 'twitter:image', ogImageUrl);
  }, [pathname]);

  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[120dvh] items-start justify-center bg-white pt-44">
      <div className="flex flex-col items-center gap-3">
        <span className="font-serif text-2xl font-medium tracking-[0.24em] text-[#1A1A1A]">
          VERELLIS
        </span>
        <div className="h-px w-24 bg-[#85662C]/60" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CartProvider>
        <RouteScrollAndMetaSync />
        <div className="flex min-h-screen flex-col bg-white text-[#1A1A1A]">
          <Navbar />

          <div className="flex-1">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/watch/argent" element={<WatchDetailPage forcedEditionId="argent" />} />
                <Route path="/watch/aurum" element={<WatchDetailPage forcedEditionId="aurum" />} />
                <Route path="/watch/noir" element={<WatchDetailPage forcedEditionId="noir" />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/craft" element={<CraftPage />} />
                <Route path="/story" element={<StoryPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
                <Route path="/warranty-care" element={<WarrantyCarePage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>

          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
