# Relatório de Plantão 🌙

Sistema para registrar e consultar os relatórios do plantão das 08h às 13h.

---

## Como colocar no ar

### 1. Banco de dados (Supabase)

1. Entre em **supabase.com** e crie uma conta gratuita
2. Clique em **New Project**, dê um nome e crie
3. No menu lateral clique em **SQL Editor**
4. Cole o conteúdo do arquivo `supabase-setup.sql` e clique em **Run**
5. Vá em **Settings → API → Legacy keys** e copie:
   - A **URL** do projeto
   - A chave **anon**

---

### 2. GitHub

1. Entre em **github.com** e crie um repositório novo
2. Clique em **"uploading an existing file"**
3. Arraste todos os arquivos da pasta do projeto
4. Clique em **Commit changes**

---

### 3. Vercel

1. Entre em **vercel.com** e importe o repositório do GitHub
2. Antes de clicar em Deploy, adicione duas variáveis de ambiente:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | a URL que você copiou do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave anon que você copiou |

3. Clique em **Deploy** 🚀

---

## O que o sistema faz

**Novo Relatório** — você preenche a data, seu nome, se o plantão foi Normal / Alerta / Crítico, registra as ocorrências do dia e deixa observações para o próximo plantonista.

**Consultar** — lista todos os relatórios salvos. Dá pra filtrar por data, por plantonista e por status. Também dá pra imprimir qualquer relatório.

---

## Algo deu errado?

- **Tela em branco** → as variáveis de ambiente não foram adicionadas no Vercel
- **Erro ao salvar** → rode o `supabase-setup.sql` novamente no Supabase
