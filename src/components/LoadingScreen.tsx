import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  visible: boolean;
}

export function LoadingScreen({ visible }: LoadingScreenProps) {
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setRendered(false);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!rendered) return null;

  return (
    <div
      aria-hidden={!visible}
      data-testid="loading-curtain"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-250 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <span className="font-serif text-3xl sm:text-4xl font-medium tracking-[0.28em] text-[#1A1A1A]">
        VERELLIS
      </span>
      <div className="mt-5 h-px w-36 overflow-hidden bg-[#1A1A1A]/10">
        <div className="h-full w-full origin-left bg-[#85662C] transition-transform duration-300 ease-out" />
      </div>
      <p className="mt-3 text-xs tracking-[0.16em] text-[#1A1A1A]/65">
        Assembling calibre
      </p>
    </div>
  );
}
