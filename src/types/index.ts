export type StatusPlantao = 'Normal' | 'Alerta' | 'Crítico';
export type SeveridadeOcorrencia = 'Baixa' | 'Média' | 'Alta';

export interface Ocorrencia {
  id: string;
  horario: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeOcorrencia;
}

export interface Relatorio {
  id: string;
  numero: number;
  data: string;           // YYYY-MM-DD
  hora_inicio: string;    // always "08:00"
  hora_fim: string;       // always "13:00"
  plantonista: string;
  status: StatusPlantao;
  ocorrencias: Ocorrencia[];
  observacoes: string;
  created_at: string;
}
