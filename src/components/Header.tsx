'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus, ClipboardList, Shield } from 'lucide-react';

export default function Header() {
  const path = usePathname();
  const isNovo = path === '/novo-relatorio';
  const isLista = path === '/relatorios' || path.startsWith('/relatorios/');

  return (
    <header className="no-print sticky top-0 z-50"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
            <Shield size={15} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Plantão</p>
            <p className="text-[10px]" style={{ color: 'var(--muted)' }}>TIME DE SUPORTE T.I</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link href="/novo-relatorio"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: isNovo ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isNovo ? 'var(--accent3)' : 'var(--muted)',
            }}>
            <FilePlus size={15} />
            <span className="hidden sm:inline font-medium">Novo Relatório</span>
          </Link>
          <Link href="/relatorios"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: isLista ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isLista ? 'var(--accent3)' : 'var(--muted)',
            }}>
            <ClipboardList size={15} />
            <span className="hidden sm:inline font-medium">Consultar</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
