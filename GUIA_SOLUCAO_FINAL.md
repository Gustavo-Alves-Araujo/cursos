# 🚀 Guia Final - Solução do Erro de RLS em Certificados

## 🎯 **Resumo do Problema**
Erro: `Bad Request` com `new row violates row-level security policy` ao tentar emitir certificados.

## 🔧 **Solução Completa**

### **Passo 1: Execute o Diagnóstico**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: diagnose-certificate-issue.sql
```

### **Passo 2: Corrigir Políticas RLS das Tabelas**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-certificate-upload-rls.sql
```

### **Passo 3: Corrigir Políticas de Storage**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-storage-policies-certificates.sql
```

### **Passo 4: Verificar Bucket de Storage**
1. **Acesse** o painel do Supabase
2. **Vá em** Storage
3. **Verifique** se existe o bucket `certificates`
4. **Se não existir**, crie com:
   - **Nome**: `certificates`
   - **Público**: ✅ Sim
   - **Limite**: 10MB
   - **Tipos**: `image/png, image/jpeg, application/pdf`

## 📋 **Scripts Criados**

1. **`diagnose-certificate-issue.sql`** - Diagnóstico completo
2. **`fix-certificate-upload-rls.sql`** - Correção RLS das tabelas
3. **`fix-storage-policies-certificates.sql`** - Correção RLS do storage
4. **`temporarily-disable-rls-certificates.sql`** - Teste de emergência

## 🔍 **Verificações Pós-Execução**

### **1. Verificar Políticas RLS**
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('certificate_templates', 'certificates');
```

### **2. Verificar Políticas de Storage**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%certificates%';
```

### **3. Verificar Bucket**
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'certificates';
```

## 🧪 **Teste de Funcionamento**

### **1. Abra o Console do Navegador (F12)**
### **2. Tente Emitir um Certificado**
### **3. Observe os Logs:**

**✅ Sucesso Esperado:**
```
🔍 Buscando template para curso: [ID]
📊 Resultado da busca: { data: {...}, error: null }
✅ Template encontrado: {...}
📁 Nome original: [Nome]
📁 Nome limpo: [nome_limpo]
📁 Nome do arquivo: certificates/[nome]_[timestamp].png
📤 Iniciando upload para: certificates/[nome]_[timestamp].png
✅ Upload realizado com sucesso
```

**❌ Se Ainda Der Erro:**
```
❌ Erro no upload: [detalhes do erro]
```

## 🚨 **Se Ainda Não Funcionar**

### **Teste de Emergência (Desabilitar RLS temporariamente)**
```sql
-- ⚠️ APENAS PARA TESTE
ALTER TABLE certificate_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;

-- Teste a emissão
-- Se funcionar, o problema é RLS
-- Reabilite com os scripts de correção
```

## 📊 **Logs de Debug Adicionados**

O código foi atualizado para mostrar logs mais detalhados:
- ✅ Upload iniciado
- ✅ Upload realizado com sucesso
- ❌ Detalhes completos do erro (se houver)

## ✅ **Checklist Final**

- [ ] Script de diagnóstico executado
- [ ] Script de correção RLS das tabelas executado
- [ ] Script de correção RLS do storage executado
- [ ] Bucket `certificates` existe e está público
- [ ] Teste de emissão realizado
- [ ] Logs mostram sucesso
- [ ] RLS reabilitado (se foi desabilitado para teste)

## 🎉 **Resultado Esperado**

Após aplicar todas as correções, o sistema deve:
1. ✅ Encontrar o template do curso
2. ✅ Gerar a imagem do certificado
3. ✅ Fazer upload para o Supabase Storage
4. ✅ Salvar o registro no banco de dados
5. ✅ Exibir o certificado para o usuário

## 📞 **Próximos Passos**

1. **Execute** todos os scripts na ordem
2. **Verifique** se o bucket existe
3. **Teste** a emissão de certificado
4. **Se funcionar**, o problema está resolvido
5. **Se não funcionar**, execute o teste de emergência

## 🔧 **Arquivos Modificados**

- `src/lib/certificateService.ts` - Adicionados logs de debug
- Criados 4 scripts SQL para correção
- Criado guia de solução completo
