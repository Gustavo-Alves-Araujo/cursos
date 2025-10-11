# Configurar SUPABASE_SERVICE_ROLE_KEY

## Problema
A API de configuração da loja está retornando erro 401 (Unauthorized) porque precisa da chave de service role do Supabase.

## Solução

### 1. Obter a Service Role Key
1. Acesse o painel do Supabase
2. Vá em **Settings** > **API**
3. Copie a **service_role** key (não a anon key)

### 2. Configurar no .env.local
Adicione a seguinte linha no arquivo `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 3. Configurar no Vercel (se estiver em produção)
1. Acesse o dashboard do Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: sua service role key
   - **Environment**: Production, Preview, Development

### 4. Reiniciar o servidor
Após adicionar a variável, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## ⚠️ Importante
- A service role key tem privilégios administrativos
- NUNCA commite essa chave no Git
- Use apenas em ambiente de desenvolvimento local ou em variáveis de ambiente seguras

## Testando
Após configurar, teste:
1. Acesse `/admin/loja` como admin
2. Digite uma URL de loja
3. Clique em "Salvar Configuração"
4. Deve salvar sem erro 401
