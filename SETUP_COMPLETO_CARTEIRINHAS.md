# 🚀 SETUP COMPLETO - Módulo de Carteirinhas

## ⚠️ IMPORTANTE: Execute os scripts SQL primeiro!

As tabelas `card_settings` e `student_cards` precisam existir no banco de dados.

---

## 📝 PASSO 1: Executar Scripts SQL no Supabase

### 1.1 - Abra o Supabase Dashboard
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)

### 1.2 - Criar as Tabelas
1. Abra o arquivo: `create-student-cards-tables.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou aperte Ctrl+Enter)
5. Aguarde a mensagem de sucesso

### 1.3 - Criar os Buckets de Storage
1. Abra o arquivo: `create-student-cards-buckets.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**
5. Aguarde a mensagem de sucesso

### 1.4 - Verificar Criação
Execute este comando no SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('card_settings', 'student_cards');
```

**Deve retornar:**
```
table_name
--------------
card_settings
student_cards
```

Se não aparecer nada, **repita o passo 1.2**

---

## 📝 PASSO 2: Popular Carteirinhas para Matrículas Existentes

Se você já tem alunos matriculados em cursos, precisa criar as carteirinhas para eles:

### 2.1 - Executar Script de População
1. Abra o arquivo: `debug-and-populate-cards.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**

### 2.2 - Verificar Resultado
Você verá várias tabelas com informações:
- ✅ Tabelas existem
- ✅ Configurações salvas
- ✅ Matrículas existentes
- ✅ Carteirinhas criadas
- ✅ Estatísticas finais

**Resultado esperado na última tabela:**
```
tipo                              | quantidade
----------------------------------|----------
Total de cursos                   | X
Configurações de carteirinha      | 0 (ainda não configurou)
Matrículas                        | Y
Carteirinhas criadas              | Y (mesmo número de matrículas)
Carteirinhas disponíveis          | Y
Carteirinhas geradas              | 0 (alunos ainda não geraram)
```

---

## 📝 PASSO 3: Configurar Carteirinha (Admin)

### 3.1 - Acessar Configuração
1. Faça login como **admin**
2. Vá em **Cursos** no menu lateral
3. Clique no curso desejado
4. Clique no botão **"Configurar Carteirinha"**

### 3.2 - Fazer Upload do Template
1. Clique em **"Escolher arquivo"** na seção "Template da Carteirinha"
2. Selecione uma imagem PNG ou JPG (máx. 5MB)
3. Aguarde o upload (pode levar alguns segundos)
4. A imagem aparecerá no preview

### 3.3 - Configurar Posições
Ajuste as posições dos elementos:
- **Nome**: Posição X e Y, tamanho da fonte, cor
- **CPF**: Posição X e Y, tamanho da fonte, cor
- **Foto**: Posição X, Y, largura e altura

### 3.4 - Configurar Disponibilidade
- **Dias após matrícula**: 0 = disponível imediatamente

### 3.5 - Salvar
1. Clique em **"Salvar Configurações"**
2. Aguarde a mensagem de sucesso
3. **Recarregue a página** (F5) para confirmar que salvou

---

## 📝 PASSO 4: Testar como Aluno

### 4.1 - Acessar Carteirinhas
1. Faça login como **aluno** (ou abra em aba anônima)
2. Vá em **Carteirinhas** no menu lateral
3. **Abra o console do navegador** (F12)

### 4.2 - Verificar Logs
No console, você deve ver:
```
🔍 Carregando carteirinhas...
✅ Sessão ativa, fazendo request para /api/student-cards
📡 Response status: 200
📦 Carteirinhas recebidas: [...]
📊 Total de carteirinhas: X
```

### 4.3 - Verificar no Terminal do Servidor
No terminal onde o Next.js está rodando, você deve ver:
```
🔍 API /api/student-cards - GET iniciado
📝 Authorization header: presente
👤 Usuário autenticado: <uuid> <email>
🔎 Buscando carteirinhas para user_id: <uuid>
📦 Query executada. Erro: null
📊 Carteirinhas encontradas: X
✅ Retornando X carteirinhas com status
```

### 4.4 - Se NÃO aparecer nada
Verifique os erros no console e terminal. Possíveis causas:

**Console mostra "📦 Carteirinhas recebidas: []"**
- ✅ Tabelas existem
- ✅ API está funcionando
- ❌ Aluno não tem carteirinha criada
- **Solução**: Execute novamente o `debug-and-populate-cards.sql`

**Terminal mostra erro na query**
- ❌ Tabelas não existem
- **Solução**: Execute `create-student-cards-tables.sql`

---

## 📝 PASSO 5: Gerar Carteirinha (Aluno)

### 5.1 - Clicar em "Gerar Carteirinha"
Na página `/carteirinhas`, clique no botão do curso disponível

### 5.2 - Fazer Upload da Foto
1. Tire uma selfie ou escolha uma foto
2. Faça upload
3. Aguarde o processamento

### 5.3 - Visualizar Preview
A carteirinha será gerada automaticamente com:
- Template configurado pelo admin
- Seu nome
- Seu CPF
- Sua foto

### 5.4 - Baixar
Clique em **"Baixar Carteirinha"** para salvar o PNG

---

## 🔍 Troubleshooting

### Problema: Admin não consegue salvar configurações

**Sintomas**: Aparece erro ao clicar em "Salvar"

**Solução**:
1. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
2. Reinicie o servidor Next.js
3. Verifique os logs no console e terminal

---

### Problema: Aluno não vê carteirinhas

**Sintomas**: Página `/carteirinhas` aparece vazia

**Solução**:
1. Execute `debug-and-populate-cards.sql` no Supabase
2. Verifique os logs no console do navegador
3. Verifique se o aluno está matriculado em algum curso:

```sql
SELECT * FROM course_enrollments WHERE user_id = '<id_do_aluno>';
```

---

### Problema: Erro ao fazer upload de template

**Sintomas**: Erro 403 ou 500 ao fazer upload

**Solução**:
1. Verifique se o bucket existe:
```sql
SELECT * FROM storage.buckets WHERE name = 'student-cards-templates';
```

2. Se não existir, execute `create-student-cards-buckets.sql`

---

## ✅ Checklist Final

Antes de usar o módulo, confirme:

- [ ] Executou `create-student-cards-tables.sql` no Supabase
- [ ] Executou `create-student-cards-buckets.sql` no Supabase
- [ ] Executou `debug-and-populate-cards.sql` no Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
- [ ] Reiniciou o servidor Next.js
- [ ] Admin conseguiu configurar e salvar carteirinha
- [ ] Configurações persistem após recarregar a página
- [ ] Aluno vê carteirinhas disponíveis em `/carteirinhas`
- [ ] Logs aparecem no console e terminal

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:

1. **Execute** `debug-and-populate-cards.sql` e copie o resultado
2. **Abra** o console do navegador (F12) na página `/carteirinhas`
3. **Verifique** os logs no terminal do Next.js
4. **Compartilhe** essas informações para análise
