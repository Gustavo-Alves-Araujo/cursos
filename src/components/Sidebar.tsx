"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { ComponentType } from "react";
import { PersonIcon, IdCardIcon, RowsIcon } from "@radix-ui/react-icons";

type IconType = ComponentType<{ className?: string }>;

const items: { href: string; label: string; icon: IconType }[] = [
  { href: "/", label: "Trilhas", icon: RowsIcon },
  { href: "/certificados", label: "Certificados", icon: IdCardIcon },
  { href: "/minha-conta", label: "Minha Conta", icon: PersonIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/60 backdrop-blur transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-4 py-6">
          <div className="mb-6 text-xl font-semibold">Comunidade ndspro</div>
          <nav className="grid gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start rounded-2xl px-3 py-6 text-base",
                    active && "bg-white/10"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <span className="mr-3 inline-flex h-5 w-5 items-center justify-center"><Icon /></span>
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}


