# 📄 Configuração de Upload de Documentos

## 🔧 Problema Resolvido

**Erro anterior em produção:**
```
Error: Request Entity Too Large
FUNCTION_PAYLOAD_TOO_LARGE
```

**Causa:** As serverless functions da Vercel têm limite de **4.5MB** para o payload da requisição.

**Solução:** Upload direto do cliente para o Supabase Storage, sem passar pela API Route (suporta até 50MB).

---

## ✅ Mudanças Implementadas

### 1. Upload Direto do Cliente ✨
- ❌ **Antes:** Cliente → API Route → Supabase (limite de 4.5MB)
- ✅ **Agora:** Cliente → Supabase direto (limite de 50MB configurável)

### 2. Validações Mantidas
- ✅ Tamanho máximo: 50MB
- ✅ Tipos permitidos: PDF, DOC, DOCX, TXT
- ✅ Autenticação obrigatória
- ✅ Nomes únicos de arquivo

---

## 🚀 Configuração Necessária no Supabase

> ⚠️ **ERRO RLS em produção?** Se você está vendo "new row violates row-level security policy", 
> siga o guia rápido: [`CORRIGIR-ERRO-RLS.md`](./CORRIGIR-ERRO-RLS.md)

### Passo 1: Criar o Bucket

1. Acesse o Supabase Dashboard
2. Vá em **Storage** (menu lateral)
3. Clique em **New bucket**
4. Configure:
   - **Name:** `course-documents`
   - **Public bucket:** ✅ Marque como público
   - Clique em **Create bucket**

### Passo 2: Configurar Políticas RLS

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `supabase-storage-policies.sql`
4. Execute a query (clique em **Run** ou pressione `Ctrl+Enter`)

**Ou configure manualmente:**

1. Vá em **Storage** → **Policies** (aba ao lado de Files)
2. Selecione o bucket `course-documents`
3. Clique em **New Policy**
4. Use estas configurações:

#### Política 1: Upload (INSERT)
```sql
Policy name: Admins podem fazer upload de documentos
Allowed operation: INSERT
Target roles: authenticated
USING expression: (deixe vazio)
WITH CHECK expression:
  bucket_id = 'course-documents' AND auth.uid() IS NOT NULL
```

#### Política 2: Leitura (SELECT)
```sql
Policy name: Documentos são públicos para leitura
Allowed operation: SELECT
Target roles: public
USING expression:
  bucket_id = 'course-documents'
WITH CHECK expression: (deixe vazio)
```

#### Política 3: Atualização (UPDATE)
```sql
Policy name: Admins podem atualizar documentos
Allowed operation: UPDATE
Target roles: authenticated
USING expression:
  bucket_id = 'course-documents' AND auth.uid() IS NOT NULL
WITH CHECK expression:
  bucket_id = 'course-documents' AND auth.uid() IS NOT NULL
```

#### Política 4: Deleção (DELETE)
```sql
Policy name: Admins podem deletar documentos
Allowed operation: DELETE
Target roles: authenticated
USING expression:
  bucket_id = 'course-documents' AND auth.uid() IS NOT NULL
WITH CHECK expression: (deixe vazio)
```

---

## 🧪 Como Testar

### 1. Teste Local (localhost)
```bash
npm run dev
```
- Acesse a página de criação de aula
- Selecione tipo "Documento"
- Faça upload de um arquivo PDF
- Deve funcionar normalmente

### 2. Teste em Produção (Vercel)
```bash
git add .
git commit -m "fix: upload direto para Supabase Storage"
git push
```
- Aguarde o deploy na Vercel
- Acesse o site em produção
- Teste o upload de documentos
- ✅ Agora deve funcionar mesmo com arquivos maiores!

---

## 📊 Limites

| Ambiente | Limite Anterior | Limite Novo |
|----------|----------------|-------------|
| Localhost | Ilimitado | 50MB |
| Produção | 4.5MB ❌ | 50MB ✅ |

---

## 🔍 Verificação de Problemas

### Se ainda der erro, verifique:

1. **Bucket existe?**
```sql
SELECT * FROM storage.buckets WHERE id = 'course-documents';
```

2. **Bucket é público?**
- Deve retornar `public: true`

3. **Políticas criadas?**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```
- Deve retornar 4 políticas para `course-documents`

4. **Console do navegador:**
- Abra DevTools (F12)
- Veja os logs no Console
- Procure por erros vermelhos

---

## 📝 Observações

- ✅ **Não precisa mais da API Route** `/api/document-upload` (mas mantive por compatibilidade)
- ✅ **Mais rápido:** Upload direto é mais eficiente
- ✅ **Mais seguro:** Validação no cliente e RLS no Supabase
- ✅ **Escalável:** Sem limites de serverless functions

---

## 🆘 Suporte

Se continuar com problemas:
1. Verifique os logs do console do navegador
2. Verifique as políticas RLS no Supabase
3. Confirme que o bucket `course-documents` existe e é público
4. Verifique se está autenticado como admin

---

## 🎯 Resultado Esperado

Após configurar o Supabase, você poderá fazer upload de documentos até **50MB** tanto em **localhost** quanto em **produção**! 🚀

