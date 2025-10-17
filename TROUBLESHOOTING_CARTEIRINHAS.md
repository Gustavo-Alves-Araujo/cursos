# 🔍 TROUBLESHOOTING - Módulo de Carteirinhas

## Problema 1: Configurações não aparecem após salvar

### Sintomas
- Você salva as configurações
- Aparece mensagem de sucesso
- Quando recarrega a página, as configurações voltam aos valores padrão

### Solução
✅ **JÁ CORRIGIDO**: Adicionado `await loadData()` após salvar para recarregar do servidor

### Como testar
1. Configure a carteirinha (template, posições, etc)
2. Clique em "Salvar Configurações"
3. Aguarde a mensagem de sucesso
4. Recarregue a página (F5)
5. Verifique se as configurações persistiram

---

## Problema 2: Aluno não vê carteirinhas disponíveis

### Sintomas
- Admin configurou a carteirinha
- Aluno está matriculado no curso
- Aluno acessa `/carteirinhas` mas não aparece nada

### Possíveis Causas

#### Causa 1: Tabelas não foram criadas
Execute no SQL Editor do Supabase:
```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('card_settings', 'student_cards');
```

**Se não aparecer nada**, execute:
- `create-student-cards-tables.sql` (criar tabelas)
- `create-student-cards-buckets.sql` (criar buckets)

#### Causa 2: Carteirinhas não foram criadas automaticamente
Execute `debug-and-populate-cards.sql` para:
1. Ver quantas matrículas existem
2. Ver quantas carteirinhas existem
3. **Criar automaticamente carteirinhas para matrículas existentes**

```sql
-- Criar carteirinhas para matrículas que não têm
INSERT INTO student_cards (
  user_id,
  course_id,
  enrollment_date,
  available_date,
  is_generated
)
SELECT 
  ce.user_id,
  ce.course_id,
  ce.created_at,
  ce.created_at + INTERVAL '0 days',
  FALSE
FROM course_enrollments ce
WHERE NOT EXISTS (
  SELECT 1 FROM student_cards sc
  WHERE sc.user_id = ce.user_id
  AND sc.course_id = ce.course_id
);
```

#### Causa 3: RLS está bloqueando acesso
Execute:
```sql
-- Verificar políticas RLS
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'student_cards';

-- Se necessário, desabilitar RLS temporariamente
ALTER TABLE student_cards DISABLE ROW LEVEL SECURITY;
```

---

## Problema 3: Erro 403 ao fazer upload de template

### Sintomas
- Admin tenta fazer upload da imagem do template
- Recebe erro 403 Forbidden

### Solução
✅ **JÁ CORRIGIDO**: API `/api/card-template-upload` usa `service_role` para bypass RLS

### Verificar
- Certifique-se que `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
- Reinicie o servidor de desenvolvimento após adicionar a chave

---

## Problema 4: Erro 401 ao salvar configurações

### Sintomas
- Admin tenta salvar configurações
- Recebe erro 401 Unauthorized

### Solução
✅ **JÁ CORRIGIDO**: Frontend envia token de autenticação no header

### Como verificar
Abra o console do navegador e verifique se há logs:
```
POST card-settings: Usuário autenticado: <uuid> <email>
POST card-settings: Usuário é admin, prosseguindo...
```

---

## Checklist de Verificação Completa

### 1. Banco de Dados
- [ ] Tabela `card_settings` existe
- [ ] Tabela `student_cards` existe
- [ ] Trigger `create_card_on_enrollment` existe
- [ ] Buckets de storage existem

### 2. Configuração
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
- [ ] Servidor foi reiniciado após adicionar a chave

### 3. Dados
- [ ] Admin configurou pelo menos 1 carteirinha
- [ ] Existe pelo menos 1 matrícula (`course_enrollments`)
- [ ] Carteirinhas foram criadas na tabela `student_cards`

### 4. Teste Admin
- [ ] Admin consegue fazer upload de template
- [ ] Admin consegue salvar configurações
- [ ] Configurações persistem após recarregar

### 5. Teste Aluno
- [ ] Aluno vê carteirinhas disponíveis em `/carteirinhas`
- [ ] Aluno consegue fazer upload de foto
- [ ] Carteirinha é gerada com sucesso

---

## Scripts Úteis

### Ver todas as configurações salvas
```sql
SELECT 
  cs.*,
  c.title as course_title
FROM card_settings cs
JOIN courses c ON c.id = cs.course_id;
```

### Ver todas as carteirinhas
```sql
SELECT 
  sc.*,
  c.title as course_title,
  u.email as student_email,
  sc.available_date <= NOW() as is_available
FROM student_cards sc
JOIN courses c ON c.id = sc.course_id
JOIN auth.users u ON u.id = sc.user_id;
```

### Popular carteirinhas para matrículas existentes
Execute o arquivo: `debug-and-populate-cards.sql`

---

## Logs Importantes

### Console do Navegador (Admin)
```
Salvando configurações: { template_url: "...", ... }
POST card-settings: Usuário autenticado: <uuid>
POST card-settings: Usuário é admin, prosseguindo...
Configurações salvas: { id: "...", course_id: "...", ... }
```

### Console do Navegador (Aluno)
```
Carteirinhas carregadas: [{ course_id: "...", is_available: true, ... }]
```

### Logs do Servidor (Terminal)
```
POST card-settings: Authorization header: presente
POST card-settings: Usuário autenticado: <uuid> <email>
POST card-settings: Dados do usuário: { role: 'admin' }
POST card-settings: Atualizando registro existente
POST card-settings: Resultado: { id: "...", ... }
```

---

## Contato para Suporte

Se ainda tiver problemas:
1. Execute `debug-and-populate-cards.sql` e copie o resultado
2. Verifique os logs do console do navegador
3. Verifique os logs do terminal do servidor
4. Compartilhe essas informações para análise
