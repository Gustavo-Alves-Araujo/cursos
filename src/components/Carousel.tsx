"use client";

import { Children, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  ariaLabel: string;
};

export function Carousel({ children, ariaLabel }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });
  const itemsCount = useMemo(() => Children.count(children), [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCanScroll({ left: el.scrollLeft > 0, right: el.scrollLeft + el.clientWidth < el.scrollWidth });
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [itemsCount]);

  const scrollBy = (dir: number) => {
    const el = containerRef.current;
    if (!el) return;
    // Em mobile, scroll por um card inteiro (192px + gap), em desktop por 90% da tela
    const isMobile = window.innerWidth < 640;
    const cardWidth = 192 + 8; // 192px + 8px gap
    const amount = isMobile ? cardWidth * dir : Math.floor(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className="scrollbar-none flex snap-x gap-2 overflow-x-auto scroll-smooth"
        tabIndex={0}
      >
        {Children.map(children, (child) => (
          <div className="min-w-[192px] flex-[0_0_auto] snap-start sm:min-w-[192px] md:min-w-[192px] lg:min-w-[192px]">
            {child}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 items-center gap-2 flex z-10">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Anterior"
          className="pointer-events-auto rounded-xl bg-blue-600 hover:bg-blue-700 border-blue-500 text-white shadow-xl w-8 h-8 sm:w-10 sm:h-10"
          disabled={!canScroll.left}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
      <div className="pointer-events-none absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 items-center flex z-10">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Próximo"
          className="pointer-events-auto rounded-xl bg-blue-600 hover:bg-blue-700 border-blue-500 text-white shadow-xl w-8 h-8 sm:w-10 sm:h-10"
          disabled={!canScroll.right}
          onClick={() => scrollBy(1)}
        >
          <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}


