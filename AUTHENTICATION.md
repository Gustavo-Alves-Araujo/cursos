# Sistema de Autenticação

Este projeto implementa um sistema completo de autenticação com diferentes tipos de usuários e redirecionamento automático.

## Funcionalidades Implementadas

### ✅ Tela de Login
- Formulário com campos de email e senha
- Validação de credenciais
- Feedback visual de erro
- Loading state durante autenticação

### ✅ Autenticação por Tipo de Usuário
- **Admin**: Acesso completo à área administrativa
- **Aluno**: Acesso à área do estudante

### ✅ Redirecionamento Automático
- Usuários não autenticados → `/login`
- Alunos → `/` (página principal)
- Admins → `/admin` (dashboard administrativo)

### ✅ Logout
- Botão de logout disponível em todas as páginas autenticadas
- Limpeza do estado e localStorage

## Usuários de Teste

### Admin
- **Email**: admin@example.com
- **Senha**: admin123
- **Acesso**: Dashboard administrativo com opções de gerenciar cursos

### Alunos
- **Email**: ana@example.com | **Senha**: ana123
- **Email**: bruno@example.com | **Senha**: bruno123
- **Acesso**: Área do aluno com cursos disponíveis

## Estrutura de Arquivos

```
src/
├── types/
│   └── auth.ts                 # Tipos TypeScript para autenticação
├── contexts/
│   └── AuthContext.tsx         # Contexto React para gerenciar estado de auth
├── components/
│   ├── LogoutButton.tsx       # Componente de logout
│   ├── ProtectedRoute.tsx     # Proteção de rotas por role
│   └── AuthRedirect.tsx       # Redirecionamento automático
├── app/
│   ├── login/
│   │   └── page.tsx           # Página de login
│   ├── page.tsx               # Página principal (alunos)
│   └── admin/
│       └── page.tsx           # Dashboard admin
└── mocks/
    └── data.ts               # Dados mock incluindo usuários
```

## Como Funciona

1. **Login**: Usuário acessa `/login` e insere credenciais
2. **Validação**: Sistema verifica email/senha contra dados mock
3. **Redirecionamento**: Baseado no role do usuário:
   - Admin → `/admin`
   - Aluno → `/`
4. **Proteção**: Rotas protegidas verificam autenticação e permissões
5. **Logout**: Remove dados do localStorage e redireciona para login

## Tecnologias Utilizadas

- **Next.js 15** com App Router
- **React Context** para gerenciamento de estado
- **TypeScript** para tipagem
- **Tailwind CSS** para estilização
- **Radix UI** para componentes
- **React Hook Form** para formulários

## Executar o Projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` e teste com os usuários fornecidos acima.
