# 🚨 PROBLEMA IDENTIFICADO - FALTA POLÍTICA DE INSERT!

## ❌ O Que Está Errado

Olhando suas políticas no Supabase, você tem:
- ✅ SELECT (leitura)
- ✅ DELETE (deleção)
- ✅ UPDATE (atualização)
- ❌ **INSERT (UPLOAD) - FALTA!**

**É POR ISSO QUE NÃO FUNCIONA!** O upload precisa de uma política com comando **INSERT**.

---

## ✅ SOLUÇÃO EM 1 MINUTO

### OPÇÃO 1: SQL (MAIS RÁPIDO) ⭐

1. Vá no **SQL Editor** do Supabase
2. Copie e cole isto:

```sql
CREATE POLICY "Permitir upload para autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-documents'
);
```

3. Clique em **RUN**
4. ✅ PRONTO!

---

### OPÇÃO 2: Interface Visual

1. Na página do Storage → Policies (onde você está)
2. Clique em **"New policy"** (canto superior direito)
3. Clique em **"Create a policy from scratch"**
4. Preencha:

```
Policy name: Permitir upload para autenticados
Allowed operation: INSERT (⚠️ IMPORTANTE!)
Target roles: authenticated
WITH CHECK expression: bucket_id = 'course-documents'
```

5. Clique em **"Review"** → **"Save policy"**

---

## 🎯 Como Saber se Funcionou

Depois de criar a política, você deve ver na lista:

| NAME | COMMAND | APPLIED TO |
|------|---------|------------|
| Permitir upload para autenticados | **INSERT** | authenticated |

---

## 🔥 Se NÃO Funcionar com `authenticated`

Tente com `public` (menos restritivo):

```sql
CREATE POLICY "Permitir upload publico"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'course-documents'
);
```

---

## 📝 Resumo

**VOCÊ PRECISA DE:**
1. Uma política com comando **INSERT**
2. Target role: **authenticated** (ou public)
3. WITH CHECK: `bucket_id = 'course-documents'`

**SEM A POLÍTICA DE INSERT, O UPLOAD NUNCA VAI FUNCIONAR!**

---

Crie essa política e teste! 🚀

