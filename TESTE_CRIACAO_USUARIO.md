# Teste da Funcionalidade de Criação de Usuários

## Problemas Identificados e Soluções

### 1. ✅ Senha Temporária Fixa
**Problema**: Senha temporária era gerada aleatoriamente.
**Solução**: Alterada para sempre ser "123123".

### 2. 🔄 Redirecionamento para Mudança de Senha
**Problema**: Usuários não eram redirecionados para página de mudança de senha no primeiro login.
**Solução**: Implementado sistema de verificação via middleware.

## Como Testar

### 1. Configurar Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estão configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 2. Testar Criação de Usuário
1. Acesse `/admin/students` como administrador
2. Clique em "Adicionar Aluno"
3. Preencha:
   - Nome: "Teste Usuário"
   - Email: "teste@exemplo.com"
   - Tipo: Aluno
4. Clique em "Criar Usuário"
5. Anote a senha temporária: **123123**

### 3. Testar Login e Redirecionamento
1. Faça logout do admin
2. Acesse `/login`
3. Use as credenciais:
   - Email: "teste@exemplo.com"
   - Senha: "123123"
4. **Resultado esperado**: Deve ser redirecionado para `/definir-senha`

### 4. Testar Mudança de Senha
1. Na página `/definir-senha`, defina uma nova senha
2. Confirme a senha
3. Clique em "Definir Senha"
4. **Resultado esperado**: Deve ser redirecionado para a página principal

## Debug e Logs

### Logs do Middleware
O middleware agora inclui logs para debug:
```
Middleware - needs_password_reset: true pathname: /
Middleware - Redirecionando para /definir-senha
```

### Logs do AuthContext
O AuthContext inclui logs para verificar metadados:
```
AuthContext - Carregando perfil do usuário: [user-id]
AuthContext - User metadata: { name: "Teste", needs_password_reset: true }
AuthContext - Needs password reset: true
```

### Logs da API
A API de criação inclui logs:
```
Usuário criado: [user-id] Metadata: { name: "Teste", needs_password_reset: true }
```

## Script de Teste Automatizado

Execute o script de teste:
```bash
node test-user-creation.js
```

Este script:
1. Cria um usuário de teste
2. Verifica se os metadados estão corretos
3. Testa o login com senha temporária
4. Remove o usuário de teste

## Possíveis Problemas e Soluções

### Problema: Usuário não é redirecionado para /definir-senha
**Causas possíveis**:
1. Variável `SUPABASE_SERVICE_ROLE_KEY` não configurada
2. Flag `needs_password_reset` não está sendo definida como `true`
3. Middleware não está sendo executado

**Soluções**:
1. Verificar variáveis de ambiente
2. Verificar logs do console
3. Testar com o script automatizado

### Problema: Erro ao criar usuário
**Causas possíveis**:
1. Email já existe
2. Variáveis de ambiente incorretas
3. Permissões do Supabase

**Soluções**:
1. Usar email único
2. Verificar configuração do Supabase
3. Verificar logs da API

### Problema: Página /definir-senha não funciona
**Causas possíveis**:
1. Erro na atualização da senha
2. Problema com metadados

**Soluções**:
1. Verificar logs do console
2. Testar manualmente a atualização de senha

## Verificação Final

Após implementar as correções, o fluxo deve funcionar assim:

1. **Admin cria usuário** → Senha temporária "123123" é definida
2. **Usuário faz login** → Middleware detecta `needs_password_reset: true`
3. **Redirecionamento automático** → Usuário vai para `/definir-senha`
4. **Usuário define nova senha** → Flag é removida dos metadados
5. **Redirecionamento final** → Usuário vai para página principal

## Próximos Passos

- [ ] Remover logs de debug após confirmação de funcionamento
- [ ] Implementar notificações por email
- [ ] Adicionar validações adicionais
- [ ] Implementar funcionalidade de edição de usuários
