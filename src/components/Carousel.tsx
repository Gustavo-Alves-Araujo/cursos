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
    const amount = Math.floor(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className="scrollbar-none flex snap-x gap-4 overflow-x-auto scroll-smooth"
        tabIndex={0}
      >
        {Children.map(children, (child) => (
          <div className="min-w-[280px] flex-[0_0_auto] snap-start sm:min-w-[320px] md:min-w-[340px] lg:min-w-[360px]">
            {child}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-y-1/2 items-center gap-2 md:flex">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Anterior"
          className="pointer-events-auto rounded-xl"
          disabled={!canScroll.left}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeftIcon />
        </Button>
      </div>
      <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 items-center md:flex">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Próximo"
          className="pointer-events-auto rounded-xl"
          disabled={!canScroll.right}
          onClick={() => scrollBy(1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}


