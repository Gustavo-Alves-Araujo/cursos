# 🔧 FIX: Erro 403 no Upload de Template

## ❌ Problema
Erro 403 ao fazer upload de imagem na configuração de carteirinha.

## ✅ Solução Aplicada

### 1. Correção na API
- ✅ Adicionado logs de debug
- ✅ Usando `service_role` para consultar usuário (bypass RLS)
- ✅ Validação melhorada de permissões

### 2. Verificar Configuração

#### Passo 1: Confirme a Service Role Key

No arquivo `.env.local`, adicione:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter:**
1. Acesse seu projeto no Supabase
2. Settings → API
3. Copie a **service_role** key (secret)
4. Cole no `.env.local`

⚠️ **ATENÇÃO:** Esta é uma chave secreta! NÃO commite no git!

#### Passo 2: Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Reinicie
npm run dev
```

#### Passo 3: Verifique os Logs

Após tentar fazer upload novamente, verifique no console:

```
Usuário autenticado: [user-id] [email]
User metadata: { ... }
Dados do usuário: { role: 'admin' } null
Usuário é admin, prosseguindo com upload
```

Se aparecer **"Usuário não é admin"**, o problema está no role do usuário.

---

## 🐛 Troubleshooting

### Erro: "Usuário não é admin"

**Causa:** O usuário logado não tem `role: 'admin'` na tabela `users`.

**Solução:** Execute no SQL Editor do Supabase:

```sql
-- Verificar role do usuário atual
SELECT id, email, role FROM users WHERE email = 'seu-email@exemplo.com';

-- Se não for admin, atualizar:
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';

-- Verificar novamente:
SELECT id, email, role FROM users WHERE email = 'seu-email@exemplo.com';
```

---

### Erro: "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Causa:** A variável de ambiente não está configurada.

**Solução:**

1. Copie a service_role key do Supabase
2. Cole no `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui
```
3. Reinicie o servidor

---

### Erro: "Erro ao verificar permissões do usuário"

**Causa:** Tabela `users` não existe ou não tem a coluna `role`.

**Solução:** Execute no SQL Editor:

```sql
-- Verificar se a tabela existe
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users';

-- Verificar colunas
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users';

-- Se não tiver a coluna role, adicionar:
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- Atualizar um usuário para admin:
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

---

### Erro persiste após correções

**Debug avançado:**

1. Abra o DevTools (F12)
2. Vá em Network
3. Tente fazer upload
4. Clique na requisição `card-template-upload`
5. Veja a resposta

**Verifique também:**
- ✅ Você está logado como admin?
- ✅ O token de autenticação está sendo enviado?
- ✅ A service_role key está correta?

---

## 📝 Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
- [ ] Servidor reiniciado
- [ ] Usuário tem `role = 'admin'` na tabela `users`
- [ ] Tabela `users` existe
- [ ] Buckets criados (executou `create-student-cards-buckets.sql`)
- [ ] Logado como admin

---

## ✅ Teste

Após aplicar as correções:

1. Faça login como admin
2. Vá em `/admin/courses/[id]/card`
3. Clique em "Selecionar Imagem"
4. Escolha uma imagem PNG ou JPG
5. Aguarde o upload

**Resultado esperado:**
```
✓ Template carregado
```

---

**Correção aplicada em:** 16 de Outubro de 2025  
**Status:** ✅ Pronto para testar
