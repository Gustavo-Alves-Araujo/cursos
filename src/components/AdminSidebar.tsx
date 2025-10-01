"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, Home, Users, BookOpen, Settings, Award } from "lucide-react";

type IconType = React.ComponentType<{ className?: string }>;

const adminItems: { href: string; label: string; icon: IconType }[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/students", label: "Gestão de Alunos", icon: Users },
  { href: "/admin/courses", label: "Gestão de Cursos", icon: BookOpen },
  { href: "/admin/certificates", label: "Certificados", icon: Award },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl p-2 text-white hover:bg-white/25 transition-all duration-200"
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
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/20 bg-black/70 backdrop-blur transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-4 py-6">
          <div className="mb-6">
            <div className="text-xl font-bold text-white mb-1">Admin Panel</div>
            <div className="text-sm text-blue-300">Painel Administrativo</div>
          </div>
          <nav className="grid gap-2">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    active 
                      ? "bg-blue-600/20 text-blue-200 border border-blue-500/30" 
                      : "text-blue-300 hover:bg-white/10 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <Icon className="mr-3 h-4 w-4" />
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
