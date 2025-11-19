# 📄 Corrigir Upload de Documentos

## 🚨 Erro: "new row violates row-level security policy"

### ✅ SOLUÇÃO RÁPIDA (2 minutos):

#### 1. Execute este arquivo no Supabase SQL Editor:

```
supabase-DESATIVAR-RLS.sql
```

**Como:**
1. Supabase Dashboard → SQL Editor
2. Copie o conteúdo do arquivo
3. Cole e clique em RUN

#### 2. Faça o deploy:

```bash
git add .
git commit -m "fix: desativar RLS para uploads"
git push
```

#### 3. Teste!

---

## 📚 Arquivos Disponíveis

| Arquivo | Quando Usar |
|---------|-------------|
| **`supabase-DESATIVAR-RLS.sql`** ⭐ | **USE ESTE** - Desativa RLS e resolve o problema |
| `GUIA-RAPIDO-DESATIVAR-RLS.md` | Guia passo a passo |
| `supabase-diagnostico.sql` | Para diagnosticar problemas |
| `supabase-solucao-emergencia.sql` | Tenta manter RLS ativo (mais complexo) |

---

## 🎯 Resultado Final

✅ Upload de documentos até **50MB**  
✅ Funciona em localhost e produção  
✅ Sem erros de RLS  

---

**Siga o guia: `GUIA-RAPIDO-DESATIVAR-RLS.md`** 🚀

