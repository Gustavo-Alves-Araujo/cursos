# 🔧 Solução para Erro da Coluna "size"

## 🚨 **Problema Identificado**
Erro: `column "size" does not exist` - A tabela `storage.objects` não possui a coluna `size`.

## 🎯 **Causa**
O Supabase Storage não usa uma coluna `size` na tabela `storage.objects`. O tamanho do arquivo é gerenciado internamente pelo sistema.

## 🔧 **Solução Implementada**

### **Scripts Corrigidos:**
- ✅ `fix-storage-policies-simple.sql` - Versão simplificada sem coluna `size`
- ✅ `check-storage-structure.sql` - Verifica estrutura real da tabela
- ✅ `fix-storage-metadata-policies.sql` - Corrigido para remover referência à coluna `size`

## 📋 **Passos para Resolver**

### **Passo 1: Verificar Estrutura Real**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: check-storage-structure.sql
```

### **Passo 2: Aplicar Políticas Corrigidas**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-storage-policies-simple.sql
```

### **Passo 3: Verificar/Criar Bucket**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: create-certificates-bucket.sql
```

## 🔍 **Estrutura Real da Tabela storage.objects**

A tabela `storage.objects` possui estas colunas principais:
- `id` - ID único do objeto
- `bucket_id` - ID do bucket
- `name` - Nome do arquivo
- `content_type` - Tipo MIME do arquivo
- `owner` - ID do usuário proprietário
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**❌ NÃO possui:**
- `size` - Tamanho é gerenciado internamente
- `metadata` - Metadados são armazenados em JSONB

## 🧪 **Teste de Funcionamento**

### **1. Execute o Script de Verificação**
```sql
-- Verificar estrutura real
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;
```

### **2. Execute o Script de Correção**
```sql
-- Aplicar políticas corretas
-- Arquivo: fix-storage-policies-simple.sql
```

### **3. Teste o Upload**
- ✅ Deve funcionar sem erro de coluna `size`
- ✅ Políticas RLS devem permitir upload
- ✅ Certificado deve ser salvo corretamente

## ✅ **Verificações Importantes**

### **1. Verificar Bucket**
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'certificates';
```

### **2. Verificar Políticas**
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%certificate%';
```

### **3. Verificar Arquivos (sem coluna size)**
```sql
SELECT name, bucket_id, content_type, created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 5;
```

## 🎉 **Resultado Esperado**

Após aplicar as correções:
1. ✅ Scripts executam sem erro de coluna `size`
2. ✅ Políticas de storage são criadas corretamente
3. ✅ Upload de certificados funciona
4. ✅ Erro de RLS é resolvido

## 📞 **Próximos Passos**

1. **Execute** `check-storage-structure.sql` para verificar estrutura
2. **Execute** `fix-storage-policies-simple.sql` para corrigir políticas
3. **Execute** `create-certificates-bucket.sql` se necessário
4. **Teste** a emissão de certificado

## 🔧 **Arquivos Criados/Corrigidos**

- ✅ `check-storage-structure.sql` - Verifica estrutura real
- ✅ `fix-storage-policies-simple.sql` - Políticas sem coluna size
- ✅ `fix-storage-metadata-policies.sql` - Corrigido
- ✅ `SOLUCAO_COLUNA_SIZE.md` - Este guia

## 🚨 **Se Ainda Der Erro**

Execute o teste de emergência:
```sql
-- ⚠️ APENAS PARA TESTE
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Teste o upload
-- Se funcionar, o problema é RLS
-- Reabilite com os scripts de correção
```
