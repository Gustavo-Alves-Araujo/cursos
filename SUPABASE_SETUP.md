# Configuração do Supabase

Este guia irá ajudá-lo a configurar o Supabase para o site de cursos.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: site-de-cursos-axo
   - **Database Password**: (escolha uma senha forte)
   - **Region**: escolha a mais próxima do Brasil
6. Clique em "Create new project"

## 2. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public** key

3. Edite o arquivo `.env.local` no seu projeto:
```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 3. Configurar Banco de Dados

### Opção A: Começar do Zero (Recomendado)
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-cleanup.sql`
4. Clique em "Run" para limpar tudo
5. Crie uma nova query
6. Copie e cole o conteúdo do arquivo `supabase-clean-setup.sql`
7. Clique em "Run" para executar o script completo

### Opção B: Se já tem dados importantes
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-clean-setup.sql`
4. Clique em "Run" para executar o script

Este script irá:
- Criar todas as tabelas: `users`, `courses`, `modules`, `lessons`, `course_enrollments`, `course_progress`
- Configurar políticas de segurança (RLS) para todos os níveis
- Criar triggers para atualização automática de timestamps
- Criar função para criar perfil de usuário automaticamente
- Implementar sistema de liberação progressiva de módulos
- Configurar cálculo automático de progresso dos cursos

## 4. Configurar Autenticação

1. No painel do Supabase, vá em **Authentication** > **Settings**
2. Em **Site URL**, adicione: `http://localhost:3000`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/login`
   - `http://localhost:3000/register`

## 5. Criar Usuário Admin (Opcional)

1. Vá em **Authentication** > **Users**
2. Clique em "Add user"
3. Preencha:
   - **Email**: admin@example.com
   - **Password**: (escolha uma senha forte)
4. Clique em "Create user"
5. Copie o **User ID** gerado
6. Vá em **SQL Editor** e execute:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 6. Testar a Configuração

1. Execute o projeto:
```bash
npm run dev
```

2. Acesse `http://localhost:3000/register`
3. Crie uma conta de teste
4. Teste o login em `http://localhost:3000/login`

## 7. Estrutura do Banco

### Tabela `users`
- `id`: UUID (referência ao auth.users)
- `email`: Email do usuário
- `name`: Nome completo
- `role`: 'admin' ou 'student'
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tabela `courses` (para futuras implementações)
- `id`: UUID único
- `title`: Título do curso
- `description`: Descrição
- `instructor_id`: ID do instrutor
- `price`: Preço do curso
- `is_published`: Se o curso está publicado
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## 8. Políticas de Segurança

- **RLS habilitado** em todas as tabelas
- Usuários só podem ver/editar seus próprios dados
- Apenas admins podem gerenciar cursos
- Cursos publicados são visíveis para todos

## Próximos Passos

Após configurar o Supabase:
1. Teste o registro e login
2. Verifique se os roles estão funcionando
3. Implemente a criação de cursos
4. Configure upload de arquivos (se necessário)
