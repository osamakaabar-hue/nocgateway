import React, { createContext, useContext, useState, useEffect, useId, useCallback } from "react";

// Context to track rendered NOC logos across the active view hierarchy
export const NocBrandingContext = createContext<{
  registerLogo: (id: string) => () => void;
  renderedLogos: string[];
}>({
  registerLogo: () => () => {},
  renderedLogos: [],
});

export function NocBrandingProvider({ children }: { children: React.ReactNode }) {
  const [renderedLogos, setRenderedLogos] = useState<string[]>([]);

  const registerLogo = useCallback((id: string) => {
    setRenderedLogos((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    return () => {
      setRenderedLogos((prev) => prev.filter((item) => item !== id));
    };
  }, []);

  return (
    <NocBrandingContext.Provider value={{ registerLogo, renderedLogos }}>
      {children}
    </NocBrandingContext.Provider>
  );
}

interface NocLogoProps {
  className?: string;
  size?: number;
  ignoreDeduplication?: boolean;
}

export function NocLogo({ className = "w-10 h-10", size = 40, ignoreDeduplication = false }: NocLogoProps) {
  const context = useContext(NocBrandingContext);
  const id = useId();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (ignoreDeduplication) return;
    const unregister = context.registerLogo(id);
    setIsRegistered(true);
    return () => unregister();
  }, [id, context.registerLogo, ignoreDeduplication]);

  // If deduplication is active, we check if we are the FIRST logo registered in the context.
  // If we are not the first logo (i.e. another instance is already rendering the brand),
  // we do not render to avoid redundant duplicate branding on the same screen/view.
  const isDuplicate = !ignoreDeduplication && isRegistered && context.renderedLogos.length > 0 && context.renderedLogos[0] !== id;

  if (isDuplicate) {
    return null;
  }

  return (
    <div className={`${className} bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm border border-slate-200`}>
      <img
        src="https://noc.ly/en/wp-content/uploads/2023/08/Noc-logo.svg"
        alt="National Oil Corporation"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default NocLogo;
