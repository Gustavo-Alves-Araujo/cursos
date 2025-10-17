"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, CreditCard } from "lucide-react";
import type { ComponentType } from "react";
import { PersonIcon, IdCardIcon, RowsIcon, PlusIcon } from "@radix-ui/react-icons";

type IconType = ComponentType<{ className?: string }>;

const items: { href: string; label: string; icon: IconType }[] = [
  { href: "/", label: "Cursos e materiais", icon: RowsIcon },
  { href: "/loja", label: "Loja", icon: PlusIcon },
  { href: "/carteirinhas", label: "Carteirinhas", icon: CreditCard },
  { href: "/certificados", label: "Certificados", icon: IdCardIcon },
  { href: "/minha-conta", label: "Minha Conta", icon: PersonIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  // Ocultar o menu hamburger quando estiver na página de visualização de aula
  const isLessonViewPage = pathname?.includes('/courses/') && pathname !== '/courses';

  // Carregar URL da loja configurada
  useEffect(() => {
    const loadStoreUrl = async () => {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          setStoreUrl(data.store_url);
        }
      } catch (error) {
        console.error('Erro ao carregar URL da loja:', error);
      }
    };

    loadStoreUrl();
  }, []);

  const handleStoreClick = (e: React.MouseEvent) => {
    if (storeUrl) {
      e.preventDefault();
      window.open(storeUrl, '_blank');
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Oculto na página de visualização de aula */}
      {!isLessonViewPage && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

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
          <Link href="/" className="block mb-6 text-xl font-semibold text-white hover:text-blue-200 transition-colors duration-200">
            Infinitto
          </Link>
          <nav className="grid gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              const isStoreItem = item.href === "/loja";
              
              return isStoreItem && storeUrl ? (
                <button
                  key={item.href}
                  onClick={(e) => {
                    handleStoreClick(e);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-start rounded-2xl px-3 py-6 text-base w-full",
                    active ? "bg-white/10" : "hover:bg-white/5",
                    "transition-colors"
                  )}
                >
                  <span className="mr-3 inline-flex h-5 w-5 items-center justify-center"><Icon /></span>
                  {item.label}
                </button>
              ) : (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start rounded-2xl px-3 py-6 text-base",
                    active && "bg-white/10"
                  )}
                  onClick={() => {
                    setIsOpen(false);
                  }}
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


