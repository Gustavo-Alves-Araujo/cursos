# Funcionalidade de Criação de Usuários pelo Admin

## Visão Geral

Foi implementada a funcionalidade para que administradores possam criar novos usuários (alunos ou outros admins) diretamente pela interface administrativa.

## Arquivos Criados/Modificados

### 1. API Route
- **Arquivo**: `src/app/api/admin/create-user/route.ts`
- **Função**: Endpoint para criação de usuários via admin
- **Método**: POST
- **Parâmetros**: `{ name, email, role }`

### 2. Hook Personalizado
- **Arquivo**: `src/hooks/useCreateUser.ts`
- **Função**: Hook para gerenciar a criação de usuários
- **Retorna**: `{ createUser, isLoading }`

### 3. Componente de Formulário
- **Arquivo**: `src/components/admin/CreateStudentForm.tsx`
- **Função**: Formulário modal para criação de usuários
- **Recursos**:
  - Validação de campos obrigatórios
  - Seleção de tipo de usuário (aluno/admin)
  - Exibição de senha temporária
  - Funcionalidade de copiar senha

### 4. Página de Admin Atualizada
- **Arquivo**: `src/app/admin/students/page.tsx`
- **Modificações**:
  - Adicionado botão "Adicionar Aluno" no header
  - Integrado componente CreateStudentForm
  - Atualização automática da lista após criação

## Configuração Necessária

### Variáveis de Ambiente

Para que a funcionalidade funcione corretamente, você precisa configurar as seguintes variáveis de ambiente:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_service_role_do_supabase
```

### Como Obter as Chaves do Supabase

1. Acesse o painel do Supabase
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: A `SUPABASE_SERVICE_ROLE_KEY` é uma chave sensível que deve ser mantida em segredo e nunca exposta no frontend.

## Como Usar

1. Acesse `/admin/students` como administrador
2. Clique no botão "Adicionar Aluno" no header
3. Preencha o formulário:
   - **Nome**: Nome completo do usuário
   - **Email**: Email único do usuário
   - **Tipo**: Aluno ou Administrador
4. Clique em "Criar Usuário"
5. Anote a senha temporária gerada
6. Compartilhe as credenciais com o usuário

## Funcionalidades

### Criação de Usuário
- Gera senha aleatória automaticamente
- Confirma email automaticamente
- Cria perfil na tabela `users`
- Define role apropriado

### Segurança
- Validação de email único
- Senha temporária que deve ser alterada no primeiro login
- Uso de Service Role Key para operações administrativas

### Interface
- Modal responsivo e intuitivo
- Feedback visual de sucesso/erro
- Funcionalidade de copiar senha
- Atualização automática da lista de usuários

## Fluxo de Trabalho

1. **Admin cria usuário** → Sistema gera credenciais temporárias
2. **Admin compartilha credenciais** → Usuário recebe email e senha
3. **Usuário faz primeiro login** → Sistema solicita alteração de senha
4. **Usuário define nova senha** → Acesso liberado ao sistema

## Troubleshooting

### Erro: "Usuário com este email já existe"
- Verifique se o email não está sendo usado por outro usuário
- Use um email diferente

### Erro: "Erro ao criar usuário"
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se a `SUPABASE_SERVICE_ROLE_KEY` está correta
- Verifique os logs do console para mais detalhes

### Usuário não aparece na lista
- Aguarde alguns segundos e recarregue a página
- Verifique se o usuário foi criado na tabela `users` do Supabase

## Próximos Passos

- [ ] Implementar notificações por email para novos usuários
- [ ] Adicionar validação de formato de email
- [ ] Implementar funcionalidade de edição de usuários
- [ ] Adicionar logs de auditoria para criação de usuários
