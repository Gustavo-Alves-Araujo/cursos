"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const announcements = [
  { id: 1, title: "Bem-vindo!", desc: "Novas trilhas disponíveis esta semana." },
  { id: 2, title: "Atualização", desc: "Plataforma com melhorias de performance." },
  { id: 3, title: "Promoção", desc: "Cursos com 20% OFF por tempo limitado." },
];

export function TopBanner() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => setIndex((i) => (i + 1) % announcements.length), 5000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const prev = () => setIndex((i) => (i - 1 + announcements.length) % announcements.length);
  const next = () => setIndex((i) => (i + 1) % announcements.length);

  return (
    <section aria-label="Avisos importantes" className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Anterior" onClick={prev} className="rounded-xl">
          <ChevronLeftIcon />
        </Button>
        <div className="w-full px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={announcements[index].id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-lg font-semibold">{announcements[index].title}</div>
              <p className="text-sm text-zinc-300">{announcements[index].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <Button variant="ghost" size="icon" aria-label="Próximo" onClick={next} className="rounded-xl">
          <ChevronRightIcon />
        </Button>
      </div>
    </section>
  );
}


