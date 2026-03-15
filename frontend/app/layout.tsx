'use client';

import React, { useState } from 'react';
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Headphones,
  ShieldCheck,
  LogOut,
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Estado que controla se a sidebar está recolhida ou não
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Meu Perfil', path: '/perfil', icon: User },
    { name: 'Central de Chamados', path: '/chamados', icon: Headphones },
    { name: 'Admin', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <html lang="pt-br">
      <body className="bg-slate-50 text-slate-900 m-0 p-0 antialiased overflow-x-hidden">
        <div className="flex min-h-screen">

          {/* SIDEBAR DINÂMICA (Transição de w-64 para w-20) */}
          <aside
            className={`${isCollapsed ? 'w-20' : 'w-64'
              } bg-white border-r border-slate-200 flex flex-col fixed h-screen z-50 transition-all duration-300 ease-in-out`}
          >

            {/* BOTÃO DE RECOLHER (Fica flutuando na borda direita da sidebar) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3.5 top-8 bg-white border border-slate-200 text-slate-400 hover:text-[#E60014] hover:border-[#E60014] rounded-full p-1.5 z-50 shadow-sm transition-colors"
            >
              {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
            </button>

            {/* Logo Area */}
            <div className={`p-6 bg-[#E60014] flex items-center shadow-md h-20 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-center gap-3'}`}>
              <Truck className="text-white shrink-0" size={24} />
              {!isCollapsed && (
                <span className="text-white font-bold tracking-tighter text-xl uppercase whitespace-nowrap overflow-hidden">
                  PROJETO LOG
                </span>
              )}
            </div>

            {/* Navegação */}
            <nav className="flex-1 mt-6 px-3 space-y-2 overflow-x-hidden">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    title={isCollapsed ? item.name : ''} // Mostra o nome ao passar o mouse quando recolhido
                    className={`flex items-center py-3 rounded-xl font-semibold transition-all duration-200 ${isCollapsed ? 'justify-center' : 'gap-3 px-4'
                      } ${isActive ? 'bg-red-50 text-[#E60014]' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-100">
              <button
                title={isCollapsed ? 'Sair' : ''}
                className={`w-full flex items-center py-3 rounded-xl border border-slate-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm ${isCollapsed ? 'justify-center' : 'justify-center gap-2 px-4'
                  }`}
              >
                <LogOut size={18} className="shrink-0" />
                {!isCollapsed && <span>SAIR</span>}
              </button>
            </div>
          </aside>

          {/* CONTEÚDO PRINCIPAL (A margem acompanha a sidebar) */}
          <div
            className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'
              }`}
          >
            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-40">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-none">JP</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Administrador</span>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-[#E60014] p-0.5 overflow-hidden">
                  <img src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png" className="rounded-full" alt="Avatar" />
                </div>
              </div>
            </header>

            <main className="p-8 w-full max-w-[1600px] mx-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}