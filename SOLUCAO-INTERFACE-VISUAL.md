# 🎯 SOLUÇÃO PELA INTERFACE VISUAL DO SUPABASE

## ❌ Erro: "must be owner of table objects"

**Causa:** Você não pode desativar RLS via SQL sem ser owner da tabela.

**Solução:** Use a interface visual do Supabase Dashboard!

---

## ✅ SOLUÇÃO - Passo a Passo com Interface Visual

### 1️⃣ Acesse o Storage no Supabase

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"Storage"** (ícone de pasta)

---

### 2️⃣ Configure o Bucket

1. Você verá o bucket **"course-documents"** (já existe, como na sua screenshot)
2. Clique no ícone de **três pontinhos** ao lado do bucket
3. Selecione **"Edit bucket"** ou **"Configurações"**
4. **Marque a opção "Public bucket"** (deve estar marcada)
5. Clique em **"Save"**

---

### 3️⃣ Editar Políticas - MÉTODO FÁCIL

Veja que você já tem várias políticas criadas (como na screenshot). Vamos **editar a política de INSERT** para ser mais permissiva:

1. Ainda na página do Storage, clique na aba **"Policies"** (ao lado de "Files")
2. Encontre a política **"Permitir upload para autenticados"** ou similar
3. Clique no ícone de **três pontinhos** ao lado dela
4. Selecione **"Edit policy"**
5. Na seção **"Policy definition"**:
   - **Policy command:** INSERT
   - **Target roles:** public (ou authenticated)
   - **WITH CHECK expression:** Deixe apenas:
     ```sql
     bucket_id = 'course-documents'
     ```
6. Clique em **"Save policy"**

---

### 4️⃣ OU: Criar Nova Política Super Permissiva

Se preferir criar do zero:

1. Na aba **"Policies"** do bucket, clique em **"New Policy"**
2. Escolha **"Create a policy from scratch"**
3. Configure:
   - **Policy name:** `Upload sem restricoes`
   - **Allowed operation:** INSERT
   - **Target roles:** Selecione **authenticated**
   - **Policy definition → WITH CHECK:** 
     ```sql
     bucket_id = 'course-documents'
     ```
4. Clique em **"Review"**
5. Clique em **"Save policy"**

---

### 5️⃣ Teste o Upload

1. Volte ao seu site
2. Limpe o cache: `Ctrl + Shift + R`
3. Faça logout e login novamente
4. Tente fazer upload de um documento

✅ **DEVE FUNCIONAR!**

---

## 🔧 SOLUÇÃO ALTERNATIVA - Via SQL (Simplificada)

Se quiser tentar via SQL, use APENAS este comando para criar uma política permissiva:

```sql
-- Criar política permissiva para INSERT
CREATE POLICY "Upload livre para autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-documents');

-- Criar política permissiva para SELECT
CREATE POLICY "Leitura livre"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-documents');
```

**IMPORTANTE:** Não tente desativar RLS via SQL, isso requer privilégios especiais!

---

## 📊 Checklist

- [ x] Bucket `course-documents` existe
- [ x] Bucket está marcado como **Public**
- [ ] Existe política de INSERT para `authenticated`
- [ ] Existe política de SELECT para `public`
- [ ] WITH CHECK apenas verifica: `bucket_id = 'course-documents'`
- [ ] Testou o upload após limpar cache

---

## 🎯 O Que Você Deve Ver

Na interface do Supabase Storage → Policies, você deve ter algo como:

| Policy Name | Command | Applied To | Definition |
|-------------|---------|------------|------------|
| Permitir upload... | INSERT | authenticated/public | bucket_id = 'course-documents' |
| Permitir leitura... | SELECT | public | bucket_id = 'course-documents' |

---

## 🆘 Se Ainda Não Funcionar

1. **Delete TODAS as políticas antigas** (pelo dashboard)
2. **Crie apenas 2 novas:**
   - Uma para INSERT (authenticated)
   - Uma para SELECT (public)
3. **Ambas com apenas:** `bucket_id = 'course-documents'`

---

**Use a interface visual do Supabase! É mais fácil e não requer permissões especiais.** 🚀

