# 🌙 Relatório de Plantão — 08:00 às 13:00

Sistema para registro e consulta de relatórios de plantão. Dark mode, sem login, dados armazenados permanentemente via Supabase.

---

## 🚀 Deploy em 3 passos

### 1. Banco de dados — Supabase (gratuito)

1. Acesse **https://supabase.com** → crie conta → **New Project**
2. Escolha um nome (ex: `relatorio-plantao`) e crie o projeto
3. Vá em **SQL Editor → New query**
4. Cole o conteúdo do arquivo `supabase-setup.sql` e clique **Run ▶**
5. Vá em **Settings → API** e copie:
   - **Project URL** → `https://xyzxyz.supabase.co`
   - **anon public key** → começa com `eyJ...`

### 2. GitHub

```bash
git init && git add .
git commit -m "inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/relatorio-plantao.git
git push -u origin main
```

### 3. Vercel

1. Acesse **https://vercel.com** → **Add New Project** → importe o repositório
2. Em **Environment Variables** adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
3. **Deploy** 🚀 — seu sistema estará em `relatorio-plantao.vercel.app`

---

## 📋 Funcionalidades

### Tela 1 — Novo Relatório (`/novo-relatorio`)

Formulário guiado em **4 etapas**:

| Etapa | Campos |
|-------|--------|
| **1 · Identificação** | Data, horário fixo 08:00–13:00, nome do plantonista, status geral (Normal / Alerta / Crítico) |
| **2 · Ocorrências** | Adicione quantas quiser: título, horário, severidade (Baixa/Média/Alta), descrição |
| **3 · Observações** | Campo livre para passagem de plantão e recados |
| **4 · Revisão** | Resumo completo antes de salvar |

### Tela 2 — Consultar Relatórios (`/relatorios`)

- Cards de resumo: Total, Normal, Alerta, Crítico
- **Busca** por plantonista ou texto das observações
- **Filtros** por status (botões visuais), plantonista e período de datas
- **Ordenação** mais recente / mais antigo
- **Expand** cada linha para ver todos os detalhes
- **Imprimir relatório individual** — abre janela de impressão formatada
- **Exportar lista** — gera tabela impressa com todos os resultados filtrados

---

## 🆘 Problemas comuns

| Problema | Solução |
|----------|---------|
| Tela em branco | Verifique as env vars no Vercel (Settings → Environment Variables) |
| `permission denied` | Execute o `supabase-setup.sql` novamente no SQL Editor |
| Dados não aparecem | Verifique se a tabela `relatorios` existe em Supabase → Table Editor |
