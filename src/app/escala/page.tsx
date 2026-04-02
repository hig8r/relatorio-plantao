'use client';
import { useState } from 'react';
import Header from '@/components/Header';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const PLANTAO_ORDEM = ['Higor','Danilo','Adriano','Carlos'];
const COR: Record<string, string> = { Higor:'higor', Adriano:'adriano', Carlos:'carlos', Danilo:'danilo' };

const ALL_MONTHS = Array.from({ length: 9 }, (_, i) => ({ year: 2026, month: i + 3 }));

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function fmt(d: Date) { return d.getDate().toString().padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'); }

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day===0 ? -6 : 1-day));
  return d;
}

function getSaturdays(year: number, month: number) {
  const sats: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth()===month) { if (d.getDay()===6) sats.push(new Date(d)); d.setDate(d.getDate()+1); }
  return sats;
}

function getPlantaoSabado(date: Date) {
  const sats = getSaturdays(date.getFullYear(), date.getMonth());
  const idx = sats.findIndex(s => s.toDateString()===date.toDateString());
  if (idx===-1) return null;
  return PLANTAO_ORDEM[idx % 4];
}

const REF_MONDAY = new Date(2025, 0, 6);
function getWeekNum(monday: Date) {
  return Math.floor((monday.getTime() - REF_MONDAY.getTime()) / (7*24*60*60*1000));
}

function getHomeOffice(weekNum: number) {
  return weekNum % 2 === 0
    ? { q1:'Carlos', q2:'Higor', s1:'Danilo', s2:'Adriano' }
    : { q1:'Danilo', q2:'Adriano', s1:'Carlos', s2:'Higor' };
}

function getWeeksForMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month+1, 0);
  const weeks = [];
  let mon = getMonday(firstDay);
  while (mon <= lastDay) {
    const quarta = addDays(mon, 2);
    const sexta  = addDays(mon, 4);
    const sabado = addDays(mon, 5);
    if (quarta.getMonth()===month || sexta.getMonth()===month) {
      weeks.push({ mon: new Date(mon), quarta, sexta, sabado });
    }
    mon = addDays(mon, 7);
  }
  return weeks;
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  'home-higor':    { bg: '#E6F1FB', color: '#185FA5' },
  'home-adriano':  { bg: '#EAF3DE', color: '#3B6D11' },
  'home-carlos':   { bg: '#FAEEDA', color: '#854F0B' },
  'home-danilo':   { bg: '#FBEAF0', color: '#993556' },
  'plantao-higor':   { bg: '#EEEDFE', color: '#3C3489' },
  'plantao-danilo':  { bg: '#FBEAF0', color: '#993556' },
  'plantao-adriano': { bg: '#EAF3DE', color: '#3B6D11' },
  'plantao-carlos':  { bg: '#FAECE7', color: '#993C1D' },
  'presencial':    { bg: '#F1EFE8', color: '#5F5E5A' },
};

function Tag({ type, text }: { type: string; text: string }) {
  const c = TAG_COLORS[type] || TAG_COLORS['presencial'];
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full w-fit block"
      style={{ background: c.bg, color: c.color }}>
      {text}
    </span>
  );
}

function DayCol({ label, date, tags, note }: { label: string; date: Date; tags: { type: string; text: string }[]; note?: string }) {
  return (
    <div className="flex-1 p-3 border-r last:border-r-0" style={{ borderColor: 'var(--border)' }}>
      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text)' }}>{fmt(date)}</p>
      <div className="flex flex-col gap-1">
        {tags.map((t, i) => <Tag key={i} type={t.type} text={t.text} />)}
      </div>
      {note && <p className="text-[10px] mt-1.5 italic" style={{ color: 'var(--muted2)' }}>{note}</p>}
    </div>
  );
}

export default function EscalaPage() {
  const [idx, setIdx] = useState(0);
  const { year, month } = ALL_MONTHS[idx];
  const weeks = getWeeksForMonth(year, month);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Title + nav */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Escala de Home Office</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Quartas e sextas — plantão sábados</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIdx(i => i-1)} disabled={idx===0}
              className="px-3 py-1.5 rounded-xl text-sm border transition-all disabled:opacity-30"
              style={{ background: 'var(--surface)', borderColor: 'var(--border2)', color: 'var(--text)' }}>
              ← Anterior
            </button>
            <button onClick={() => setIdx(i => i+1)} disabled={idx===ALL_MONTHS.length-1}
              className="px-3 py-1.5 rounded-xl text-sm border transition-all disabled:opacity-30"
              style={{ background: 'var(--surface)', borderColor: 'var(--border2)', color: 'var(--text)' }}>
              Próximo →
            </button>
          </div>
        </div>

        {/* Month label */}
        <div className="text-lg font-semibold" style={{ color: 'var(--accent3)' }}>
          {MONTHS[month]} {year}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'home-higor',   label: 'Home Higor' },
            { type: 'home-adriano', label: 'Home Adriano' },
            { type: 'home-carlos',  label: 'Home Carlos' },
            { type: 'home-danilo',  label: 'Home Danilo' },
            { type: 'presencial',   label: 'Presencial' },
          ].map(l => (
            <div key={l.type} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: TAG_COLORS[l.type].bg, border: `1px solid ${TAG_COLORS[l.type].color}` }}/>
              {l.label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="space-y-3">
          {weeks.map(({ mon, quarta, sexta, sabado }, wi) => {
            const weekNum = getWeekNum(mon);
            const ho = getHomeOffice(weekNum);
            const plantaoSab = getPlantaoSabado(sabado);

            const presencialSexta = plantaoSab && (plantaoSab===ho.s1 || plantaoSab===ho.s2) ? plantaoSab : null;

            const quartaTags = [
              { type: `home-${COR[ho.q1]}`, text: '🏠 '+ho.q1 },
              { type: `home-${COR[ho.q2]}`, text: '🏠 '+ho.q2 },
            ];

            const sextaTags = [];
            if (ho.s1 !== presencialSexta) sextaTags.push({ type:`home-${COR[ho.s1]}`, text:'🏠 '+ho.s1 });
            if (ho.s2 !== presencialSexta) sextaTags.push({ type:`home-${COR[ho.s2]}`, text:'🏠 '+ho.s2 });
            if (presencialSexta) sextaTags.push({ type:'presencial', text:'🏢 '+presencialSexta });

            const sabTags = plantaoSab
              ? [{ type:`plantao-${COR[plantaoSab]}`, text:'⚙ Plantão: '+plantaoSab }]
              : [{ type:'presencial', text:'Sem plantão' }];

            return (
              <div key={wi} className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                    Semana {fmt(mon)} – {fmt(addDays(mon,4))}
                  </span>
                  {plantaoSab && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ background: '#EEEDFE', color: '#3C3489' }}>
                      Plantão sáb: {plantaoSab}
                    </span>
                  )}
                </div>
                <div className="flex divide-x" style={{ borderColor: 'var(--border)' }}>
                  <DayCol label="Quarta" date={quarta} tags={quartaTags} />
                  <DayCol label="Sexta" date={sexta} tags={sextaTags}
                    note={presencialSexta ? presencialSexta+' → presencial (plantão sáb.)' : undefined} />
                  <DayCol label="Sábado" date={sabado} tags={sabTags} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          {ALL_MONTHS.map(({ month: m }, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="w-9 h-9 rounded-full text-[11px] font-medium transition-all border"
              style={{
                background: i===idx ? 'var(--accent)' : 'var(--surface)',
                color: i===idx ? '#fff' : 'var(--muted)',
                borderColor: i===idx ? 'var(--accent)' : 'var(--border2)',
              }}>
              {MONTHS[m].slice(0,3)}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
