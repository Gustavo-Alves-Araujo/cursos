# 🚨 SOLUÇÃO DEFINITIVA - Erro RLS

## O Problema

O erro persiste porque o Supabase Storage está bloqueando uploads devido às políticas RLS (Row Level Security).

## ✅ 3 Soluções (em ordem de prioridade)

---

### 🎯 SOLUÇÃO 1: Script de Emergência (RECOMENDADO)

Execute o arquivo `supabase-solucao-emergencia.sql` no Supabase SQL Editor:

1. Acesse: **Supabase Dashboard** → **SQL Editor**
2. Copie TODO o conteúdo de `supabase-solucao-emergencia.sql`
3. Cole e clique em **RUN**

**O que faz:**
- ✅ Remove políticas antigas que podem estar conflitando
- ✅ Cria políticas SUPER PERMISSIVAS (menos restritivas)
- ✅ Garante que o bucket está público
- ✅ Deve funcionar IMEDIATAMENTE

---

### 🔍 SOLUÇÃO 2: Diagnóstico Primeiro

Se a Solução 1 não funcionar, execute o diagnóstico:

1. Execute o arquivo `supabase-diagnostico.sql` no SQL Editor
2. **Me envie os resultados** (copie e cole aqui)
3. Vou identificar o problema exato

---

### 💡 SOLUÇÃO 3: Código com Fallback (JÁ IMPLEMENTADO)

Atualizei o código para ter uma **estratégia híbrida**:

1. **Tenta upload direto** (funciona se RLS estiver OK)
2. **Se falhar por RLS** e arquivo < 4MB: usa API como fallback
3. **Se arquivo > 4MB**: mostra mensagem pedindo para configurar RLS

**Vantagens:**
- ✅ Funciona com arquivos pequenos mesmo sem RLS
- ✅ Funciona com arquivos grandes se RLS estiver OK
- ⚠️ Arquivos grandes (> 4MB) precisam do RLS configurado

---

## 🚀 Teste Rápido

### Depois de executar a Solução 1:

1. **Faça o deploy:**
```bash
git add .
git commit -m "fix: adicionar fallback para upload de documentos"
git push
```

2. **Limpe o cache do navegador:**
   - Pressione `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)

3. **Faça logout e login novamente no site**

4. **Teste o upload:**
   - Arquivo pequeno (< 1MB) primeiro
   - Depois arquivo maior (até 50MB)

---

## 📊 Comparação das Soluções

| Solução | Tempo | Dificuldade | Arquivos Grandes |
|---------|-------|-------------|------------------|
| 1. Script Emergência | 2 min | Fácil | ✅ Sim (50MB) |
| 2. Diagnóstico | 5 min | Média | Depende |
| 3. Código Fallback | 0 min | N/A | ⚠️ Apenas < 4MB |

---

## ⚠️ OPÇÃO NUCLEAR (Última Alternativa)

Se NADA funcionar, há uma opção no `supabase-solucao-emergencia.sql` comentada:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**⚠️ CUIDADO:**
- Remove TODA a segurança do Storage
- Qualquer pessoa pode fazer upload/deletar arquivos
- Use APENAS temporariamente para testar
- Lembre de reativar depois!

---

## 📝 Checklist

Execute em ordem:

- [ ] 1. Execute `supabase-solucao-emergencia.sql`
- [ ] 2. Verifique no Supabase se o bucket `course-documents` existe
- [ ] 3. Verifique se o bucket está marcado como **público** (checkbox)
- [ ] 4. Faça deploy do código atualizado
- [ ] 5. Limpe cache do navegador
- [ ] 6. Faça logout/login
- [ ] 7. Teste com arquivo pequeno primeiro
- [ ] 8. Teste com arquivo grande (até 50MB)

---

## 🆘 Se continuar com erro

Execute `supabase-diagnostico.sql` e me envie:
1. Os resultados completos do diagnóstico
2. Screenshot do erro no navegador
3. Console do navegador (F12 → Console)

Vou identificar o problema exato! 🔍

