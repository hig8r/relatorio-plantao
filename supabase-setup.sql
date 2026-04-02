-- ============================================================
-- RELATÓRIO DE PLANTÃO — Setup do Banco (Supabase SQL Editor)
-- Cole aqui e clique em Run ▶
-- ============================================================

CREATE TABLE IF NOT EXISTS public.relatorios (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  numero       SERIAL       UNIQUE NOT NULL,
  data         DATE         NOT NULL,
  hora_inicio  TEXT         NOT NULL DEFAULT '08:00',
  hora_fim     TEXT         NOT NULL DEFAULT '13:00',
  plantonista  TEXT         NOT NULL,
  status       TEXT         NOT NULL DEFAULT 'Normal'
                            CHECK (status IN ('Normal','Alerta','Crítico')),
  ocorrencias  JSONB        NOT NULL DEFAULT '[]',
  observacoes  TEXT         NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ  DEFAULT now() NOT NULL
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_relatorios_data        ON public.relatorios (data DESC);
CREATE INDEX IF NOT EXISTS idx_relatorios_plantonista ON public.relatorios (plantonista);
CREATE INDEX IF NOT EXISTS idx_relatorios_status      ON public.relatorios (status);

-- Segurança (acesso público sem login)
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura_publica"     ON public.relatorios FOR SELECT USING (true);
CREATE POLICY "insercao_publica"    ON public.relatorios FOR INSERT WITH CHECK (true);
CREATE POLICY "atualizacao_publica" ON public.relatorios FOR UPDATE USING (true);

-- Exemplos de dados para testar (pode apagar depois)
INSERT INTO public.relatorios (data, plantonista, status, ocorrencias, observacoes) VALUES
(
  CURRENT_DATE - 2,
  'Carlos Mendes',
  'Alerta',
  '[
    {"id":"oc1","horario":"09:15","titulo":"Sistema de câmera offline — Setor B","descricao":"Câmera do corredor B2 apresentou falha. Técnico notificado, retorno previsto para amanhã.","severidade":"Média"},
    {"id":"oc2","horario":"11:40","titulo":"Visitante sem identificação","descricao":"Indivíduo tentou acessar área restrita. Situação contornada e registro feito em livro físico.","severidade":"Alta"}
  ]',
  'Atenção: câmera B2 ainda offline. Técnico visitará amanhã às 08h. Solicitar que próximo plantonista acompanhe entrada dele.'
),
(
  CURRENT_DATE - 1,
  'Ana Paula Souza',
  'Normal',
  '[]',
  'Plantão tranquilo. Todos os sistemas operando normalmente. Nenhuma pendência para o próximo turno.'
),
(
  CURRENT_DATE,
  'Ricardo Lima',
  'Normal',
  '[{"id":"oc3","horario":"10:05","titulo":"Lâmpada queimada — Corredor 3","descricao":"","severidade":"Baixa"}]',
  'Lâmpada do corredor 3 queimada. Solicitada troca para facilities.'
);
