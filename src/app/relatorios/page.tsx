'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Relatorio, StatusPlantao } from '@/types';
import {
  Search, Filter, X, RefreshCw, FilePlus, Calendar,
  ChevronDown, ChevronUp, Printer, AlertTriangle, AlertOctagon,
  CheckCircle2, Clock, User, Loader2, ArrowUpDown,
  ClipboardList, FileText,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ── badge component ── */
function StatusBadge({ s }: { s: StatusPlantao }) {
  const map = {
    'Normal':  { bg: 'var(--green-bg)',  color: 'var(--green)',  bd: 'var(--green-bd)',  icon: <CheckCircle2 size={10}/> },
    'Alerta':  { bg: 'var(--yellow-bg)', color: 'var(--yellow)', bd: 'var(--yellow-bd)', icon: <AlertTriangle size={10}/> },
    'Crítico': { bg: 'var(--red-bg)',    color: 'var(--red)',    bd: 'var(--red-bd)',    icon: <AlertOctagon size={10}/> },
  };
  const { bg, color, bd, icon } = map[s];
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit"
      style={{ background: bg, color, border: `1px solid ${bd}` }}>
      {icon} {s}
    </span>
  );
}

/* ── print-friendly single report ── */
function PrintView({ r }: { r: Relatorio }) {
  return (
    <div className="print-only" style={{ display: 'none', fontFamily: 'Arial, sans-serif', color: '#000', padding: 0 }}>
      <style>{`
        @media print {
          .print-only { display: block !important; }
          .screen-only { display: none !important; }
        }
      `}</style>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Relatório de Plantão #{String(r.numero).padStart(4,'0')}</h1>
      <hr style={{ marginBottom: 12 }}/>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <tbody>
          <tr><td style={{ fontWeight: 'bold', paddingRight: 16, paddingBottom: 6 }}>Data:</td><td>{r.data.split('-').reverse().join('/')}</td></tr>
          <tr><td style={{ fontWeight: 'bold', paddingRight: 16, paddingBottom: 6 }}>Horário:</td><td>08:00 – 13:00</td></tr>
          <tr><td style={{ fontWeight: 'bold', paddingRight: 16, paddingBottom: 6 }}>Plantonista:</td><td>{r.plantonista}</td></tr>
          <tr><td style={{ fontWeight: 'bold', paddingRight: 16 }}>Status:</td><td>{r.status}</td></tr>
        </tbody>
      </table>
      <h2 style={{ fontSize: 14, marginBottom: 8 }}>Ocorrências ({r.ocorrencias.length})</h2>
      {r.ocorrencias.length === 0
        ? <p>Nenhuma ocorrência registrada neste plantão.</p>
        : r.ocorrencias.map(oc => (
          <div key={oc.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '3px solid #333' }}>
            <p style={{ fontWeight: 'bold', marginBottom: 2 }}>{oc.titulo} <span style={{ fontWeight: 'normal' }}>({oc.severidade}) — {oc.horario}</span></p>
            {oc.descricao && <p style={{ margin: 0, color: '#444' }}>{oc.descricao}</p>}
          </div>
        ))
      }
      {r.observacoes && <>
        <h2 style={{ fontSize: 14, marginTop: 16, marginBottom: 8 }}>Observações Gerais</h2>
        <p style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{r.observacoes}</p>
      </>}
    </div>
  );
}

/* ── expandable row ── */
function RelatorioRow({ r, onPrint }: { r: Relatorio; onPrint: (r: Relatorio) => void }) {
  const [open, setOpen] = useState(false);
  const ocAlta = r.ocorrencias.filter(o => o.severidade === 'Alta').length;

  return (
    <>
      <div
        className="grid gap-2 px-4 py-3.5 cursor-pointer transition-colors"
        style={{ gridTemplateColumns: '72px 1fr 110px 32px' }}
        onClick={() => setOpen(v => !v)}
        onMouseOver={e => { if (!open) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseOut={e => { if (!open) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        {/* # */}
        <div className="flex items-center">
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
            #{String(r.numero).padStart(4,'0')}
          </span>
        </div>

        {/* Date + plantonista */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {format(parseISO(r.data + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
            {ocAlta > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-bd)' }}>
                {ocAlta} alta{ocAlta > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              <User size={9}/> {r.plantonista}
            </span>
            <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--muted2)' }}>
              <Clock size={9}/> 08:00–13:00
            </span>
            {r.ocorrencias.length > 0 && (
              <span className="text-[11px]" style={{ color: 'var(--muted2)' }}>
                {r.ocorrencias.length} ocorrência{r.ocorrencias.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center"><StatusBadge s={r.status}/></div>

        {/* Chevron */}
        <div className="flex items-center justify-center" style={{ color: 'var(--muted2)' }}>
          {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {open && (
        <div className="px-4 pb-5 fade-in"
          style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>

          {/* Ocorrências */}
          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted2)' }}>
              Ocorrências ({r.ocorrencias.length})
            </p>
            {r.ocorrencias.length === 0 ? (
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--green)' }}>
                <CheckCircle2 size={14}/> Nenhuma ocorrência registrada
              </p>
            ) : (
              <div className="space-y-2">
                {r.ocorrencias.map(oc => (
                  <div key={oc.id} className="rounded-xl p-3.5"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${oc.severidade === 'Alta' ? 'var(--red)' : oc.severidade === 'Média' ? 'var(--yellow)' : 'var(--green)'}`,
                    }}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{oc.titulo}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: oc.severidade === 'Alta' ? 'var(--red-bg)' : oc.severidade === 'Média' ? 'var(--yellow-bg)' : 'var(--green-bg)',
                          color: oc.severidade === 'Alta' ? 'var(--red)' : oc.severidade === 'Média' ? 'var(--yellow)' : 'var(--green)',
                        }}>
                        {oc.severidade}
                      </span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                        <Clock size={9}/> {oc.horario}
                      </span>
                    </div>
                    {oc.descricao && (
                      <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text2)' }}>{oc.descricao}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          {r.observacoes && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted2)' }}>
                Observações Gerais
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>
                {r.observacoes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => onPrint(r)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ border: '1px solid var(--border2)', color: 'var(--text2)', background: 'transparent' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
              <Printer size={12}/> Imprimir este relatório
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════ MAIN PAGE ════════════ */
export default function RelatoriosPage() {
  const router = useRouter();
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const printRef = useRef<Relatorio | null>(null);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPlantao | ''>('');
  const [filtroPlantonista, setFiltroPlantonista] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const activeCount = [filtroStatus, filtroPlantonista, dataInicio, dataFim, busca].filter(Boolean).length;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('relatorios').select('*', { count: 'exact' });
      if (filtroStatus)       q = q.eq('status', filtroStatus);
      if (filtroPlantonista)  q = q.ilike('plantonista', `%${filtroPlantonista}%`);
      if (busca)              q = q.or(`plantonista.ilike.%${busca}%,observacoes.ilike.%${busca}%`);
      if (dataInicio)         q = q.gte('data', dataInicio);
      if (dataFim)            q = q.lte('data', dataFim);
      q = q.order('data', { ascending: sortDir === 'asc' }).order('numero', { ascending: sortDir === 'asc' });
      const { data, error, count } = await q;
      if (error) throw error;
      setRelatorios((data || []) as Relatorio[]);
      setTotal(count || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filtroStatus, filtroPlantonista, busca, dataInicio, dataFim, sortDir]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function clearFilters() {
    setBusca(''); setFiltroStatus(''); setFiltroPlantonista('');
    setDataInicio(''); setDataFim('');
  }

  /* Print single report */
  function handlePrint(r: Relatorio) {
    printRef.current = r;
    // Build printable HTML
    const ocHtml = r.ocorrencias.length === 0
      ? '<p>Nenhuma ocorrência registrada neste plantão.</p>'
      : r.ocorrencias.map(oc => `
        <div style="margin-bottom:12px;padding-left:12px;border-left:3px solid #333">
          <p style="font-weight:bold;margin:0 0 2px">${oc.titulo} <span style="font-weight:normal">(${oc.severidade}) — ${oc.horario}</span></p>
          ${oc.descricao ? `<p style="margin:0;color:#444">${oc.descricao}</p>` : ''}
        </div>`).join('');

    const obsHtml = r.observacoes
      ? `<h2 style="font-size:14px;margin:20px 0 8px">Observações Gerais</h2><p style="white-space:pre-wrap;color:#333">${r.observacoes}</p>`
      : '';

    const html = `<!DOCTYPE html><html><head><title>Relatório #${String(r.numero).padStart(4,'0')}</title>
    <style>body{font-family:Arial,sans-serif;color:#000;padding:24px;max-width:700px;margin:0 auto}
    h1{font-size:18px;margin-bottom:4px}h2{font-size:14px}
    table td{padding-bottom:6px}@page{margin:1.5cm}</style></head><body>
    <h1>Relatório de Plantão #${String(r.numero).padStart(4,'0')}</h1>
    <hr style="margin-bottom:16px"/>
    <table><tbody>
      <tr><td style="font-weight:bold;padding-right:16px">Data:</td><td>${r.data.split('-').reverse().join('/')}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px">Horário:</td><td>08:00 – 13:00</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px">Plantonista:</td><td>${r.plantonista}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px">Status:</td><td>${r.status}</td></tr>
    </tbody></table>
    <h2 style="margin-top:20px;margin-bottom:8px">Ocorrências (${r.ocorrencias.length})</h2>
    ${ocHtml}${obsHtml}
    <hr style="margin-top:32px"/>
    <p style="font-size:11px;color:#777">Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  /* Print full list */
  function handlePrintList() {
    const rows = relatorios.map(r => `
      <tr>
        <td>#${String(r.numero).padStart(4,'0')}</td>
        <td>${r.data.split('-').reverse().join('/')}</td>
        <td>${r.plantonista}</td>
        <td>${r.status}</td>
        <td>${r.ocorrencias.length}</td>
        <td>${r.ocorrencias.filter(o=>o.severidade==='Alta').length > 0 ? '⚠ '+r.ocorrencias.filter(o=>o.severidade==='Alta').length+' alta' : '—'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><title>Lista de Relatórios de Plantão</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}h1{font-size:18px;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}
    th{background:#f5f5f5;font-weight:bold}
    @page{margin:1.5cm}</style></head><body>
    <h1>Relatórios de Plantão — 08:00 a 13:00</h1>
    <p style="color:#666;font-size:12px">Exportado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · ${total} registro${total!==1?'s':''}</p>
    <table><thead><tr><th>#</th><th>Data</th><th>Plantonista</th><th>Status</th><th>Ocorrências</th><th>Alta</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  /* Stats */
  const stats = {
    normal:  relatorios.filter(r => r.status === 'Normal').length,
    alerta:  relatorios.filter(r => r.status === 'Alerta').length,
    critico: relatorios.filter(r => r.status === 'Crítico').length,
    ocTotal: relatorios.reduce((a, r) => a + r.ocorrencias.length, 0),
  };

  /* ── render ── */
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Header/>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 screen-only">

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Relatórios de Plantão</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              {loading ? 'Carregando...' : `${total} relatório${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => router.push('/novo-relatorio')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white no-print"
            style={{ background: 'var(--accent)' }}>
            <FilePlus size={15}/> <span className="hidden sm:inline">Novo Relatório</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',       val: total,        color: 'var(--accent3)', icon: <ClipboardList size={14}/> },
            { label: 'Normal',      val: stats.normal,  color: 'var(--green)',   icon: <CheckCircle2 size={14}/> },
            { label: 'Alerta',      val: stats.alerta,  color: 'var(--yellow)',  icon: <AlertTriangle size={14}/> },
            { label: 'Crítico',     val: stats.critico, color: 'var(--red)',     icon: <AlertOctagon size={14}/> },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1.5" style={{ color: s.color }}>
                {s.icon}
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</span>
              </div>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* search */}
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted2)' }}/>
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por plantonista ou observações..."
                className="pl-9 pr-4 py-2.5 text-sm rounded-xl"
                style={{ background: 'var(--surface)', border: '1.5px solid var(--border2)' }}/>
              {busca && <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted2)' }}><X size={13}/></button>}
            </div>

            {/* filter toggle */}
            <button onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all"
              style={{
                background: activeCount > 0 ? 'rgba(99,102,241,0.1)' : 'var(--surface)',
                borderColor: activeCount > 0 ? 'rgba(99,102,241,0.4)' : 'var(--border2)',
                color: activeCount > 0 ? 'var(--accent3)' : 'var(--muted)',
              }}>
              <Filter size={14}/>
              <span className="hidden sm:inline text-sm">Filtros</span>
              {activeCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--accent)', color: '#fff' }}>{activeCount}</span>
              )}
            </button>

            {/* sort */}
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              title={sortDir === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm"
              style={{ background: 'var(--surface)', borderColor: 'var(--border2)', color: 'var(--muted)' }}>
              <ArrowUpDown size={14}/>
              <span className="hidden sm:inline text-xs">{sortDir === 'desc' ? 'Recentes' : 'Antigos'}</span>
            </button>

            {/* refresh */}
            <button onClick={fetchData}
              className="px-3 py-2.5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border2)', color: 'var(--muted)' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="rounded-2xl p-4 space-y-4 fade-in"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status filter - visual */}
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text2)' }}>Status</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(['', 'Normal', 'Alerta', 'Crítico'] as const).map(s => (
                      <button key={s} onClick={() => setFiltroStatus(s as StatusPlantao | '')}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background: filtroStatus === s
                            ? (s === 'Normal' ? 'var(--green-bg)' : s === 'Alerta' ? 'var(--yellow-bg)' : s === 'Crítico' ? 'var(--red-bg)' : 'rgba(99,102,241,0.15)')
                            : 'var(--surface3)',
                          color: filtroStatus === s
                            ? (s === 'Normal' ? 'var(--green)' : s === 'Alerta' ? 'var(--yellow)' : s === 'Crítico' ? 'var(--red)' : 'var(--accent3)')
                            : 'var(--muted)',
                          border: `1px solid ${filtroStatus === s
                            ? (s === 'Normal' ? 'var(--green-bd)' : s === 'Alerta' ? 'var(--yellow-bd)' : s === 'Crítico' ? 'var(--red-bd)' : 'rgba(99,102,241,0.3)')
                            : 'var(--border)'}`,
                        }}>
                        {s || 'Todos'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plantonista */}
                <div>
                  <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text2)' }}>
                    <User size={11}/> Plantonista
                  </label>
                  <input value={filtroPlantonista} onChange={e => setFiltroPlantonista(e.target.value)}
                    placeholder="Nome do plantonista..."
                    className="px-3 py-2 text-sm rounded-xl"
                    style={{ background: 'var(--surface2)', border: '1.5px solid var(--border2)' }}/>
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text2)' }}>
                    <Calendar size={11}/> De
                  </label>
                  <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl"
                    style={{ background: 'var(--surface2)', border: '1.5px solid var(--border2)' }}/>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text2)' }}>
                    <Calendar size={11}/> Até
                  </label>
                  <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl"
                    style={{ background: 'var(--surface2)', border: '1.5px solid var(--border2)' }}/>
                </div>
              </div>

              {activeCount > 0 && (
                <button onClick={clearFilters}
                  className="text-xs flex items-center gap-1.5 transition-colors"
                  style={{ color: 'var(--muted)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}>
                  <X size={11}/> Limpar todos os filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {/* Table header */}
          <div className="grid gap-2 px-4 py-3"
            style={{ gridTemplateColumns: '72px 1fr 110px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted2)' }}>#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted2)' }}>Data / Plantonista</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted2)' }}>Status</span>
            <span/>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3" style={{ color: 'var(--muted)' }}>
              <Loader2 size={20} className="animate-spin"/>
              <span className="text-sm">Carregando relatórios...</span>
            </div>
          ) : relatorios.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center px-4">
              <FileText size={32} style={{ color: 'var(--muted2)' }}/>
              <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Nenhum relatório encontrado</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {activeCount > 0 ? 'Tente ajustar os filtros.' : 'Registre o primeiro relatório de plantão!'}
              </p>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="text-xs underline" style={{ color: 'var(--accent2)' }}>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {relatorios.map(r => <RelatorioRow key={r.id} r={r} onPrint={handlePrint}/>)}
            </div>
          )}

          {/* Footer */}
          {relatorios.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
              <span className="text-xs" style={{ color: 'var(--muted2)' }}>
                {relatorios.length} de {total} relatórios
              </span>
              <button onClick={handlePrintList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all no-print"
                style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
                <Printer size={12}/> Exportar lista
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
