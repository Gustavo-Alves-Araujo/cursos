# ⚠️ VERIFICAR VARIÁVEIS NA VERCEL (CRÍTICO!)

## 🔑 Antes de Testar

O bypass funciona usando `SUPABASE_SERVICE_ROLE_KEY` na API.  
**SEM ESSA VARIÁVEL, NÃO VAI FUNCIONAR!**

---

## ✅ Passo a Passo

### 1. Acesse a Vercel

1. https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** (barra superior)
4. No menu lateral, clique em **Environment Variables**

---

### 2. Verifique se Existem

Você PRECISA ter estas 3 variáveis:

| Nome | Exemplo | Encontrar |
|------|---------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` ⚠️ | `eyJhbGc...` | Supabase → Settings → API → **service_role** |

---

### 3. Se FALTA `SUPABASE_SERVICE_ROLE_KEY`:

#### A. Pegar a Chave no Supabase:

1. Supabase Dashboard → Seu Projeto
2. **Settings** (engrenagem no menu lateral)
3. **API** (no submenu)
4. Role até **Project API keys**
5. Copie a chave **`service_role`** (secret) ⚠️

**⚠️ ATENÇÃO:**
- NÃO é a `anon` (pública)
- NÃO é a `public`
- É a **`service_role`** (última da lista, tem aviso de perigo)

#### B. Adicionar na Vercel:

1. Volte para Vercel → Environment Variables
2. Clique em **Add New**
3. Preencha:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Cole a chave que copiou
   - **Environments:** Marque **Production**, **Preview** e **Development**
4. Clique em **Save**

---

### 4. Redeploy

**IMPORTANTE:** Adicionar variável não aplica automaticamente!

1. Vá em **Deployments** (barra superior)
2. Clique nos **três pontinhos** do último deployment
3. Clique em **Redeploy**
4. Aguarde 2-3 minutos

---

### 5. Teste

1. Acesse o site
2. Limpe cache: `Ctrl + Shift + R`
3. Faça logout e login
4. Teste o upload

✅ **AGORA VAI FUNCIONAR!**

---

## 🔍 Como Verificar se Está OK

### Opção 1: Vercel Dashboard

- Vá em **Settings** → **Environment Variables**
- Deve aparecer `SUPABASE_SERVICE_ROLE_KEY` na lista
- Se aparecer, está OK ✅

### Opção 2: Logs (se der erro)

1. **Deployments** → Clique no deployment atual
2. **Functions** → Clique em qualquer execução
3. Procure no log:
   - ✅ BOM: `service_role key configurada`
   - ❌ RUIM: `SUPABASE_SERVICE_ROLE_KEY is undefined`

---

## ⚠️ Segurança

**service_role key é SECRETA!**

- ✅ Use apenas no backend (API Routes)
- ❌ NUNCA exponha no frontend
- ❌ NUNCA commite no git
- ✅ Apenas em variáveis de ambiente da Vercel

---

## 🎯 Checklist Final

- [ ] Tenho `SUPABASE_SERVICE_ROLE_KEY` na Vercel
- [ ] Tenho `NEXT_PUBLIC_SUPABASE_URL` na Vercel
- [ ] Tenho `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel
- [ ] Fiz redeploy após adicionar variáveis
- [ ] Aguardei 2-3 minutos após redeploy
- [ ] Limpei cache do navegador
- [ ] Testei o upload

Se todos marcados: **VAI FUNCIONAR!** 🚀

