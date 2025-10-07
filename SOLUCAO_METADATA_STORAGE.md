# 🔧 Solução para Problema de Metadata no Storage

## 🎯 **Problema Identificado**
Erro: `new row violates row-level security policy` - O Supabase Storage está tentando inserir um registro na tabela `storage.objects` sem os campos obrigatórios `content_type` e `size`.

## 🚨 **Causa Raiz**
O Supabase Storage automaticamente tenta inserir metadados na tabela `storage.objects`, mas as políticas RLS estão bloqueando porque:
1. **`content_type`** não está sendo passado corretamente
2. **`size`** não está sendo calculado
3. **Políticas RLS** muito restritivas

## 🔧 **Solução Implementada**

### **1. Código Atualizado**
- ✅ Adicionados logs de debug para `blob.size` e `blob.type`
- ✅ Melhorado o tratamento de metadata no upload

### **2. Scripts Criados**
- ✅ `fix-storage-metadata-policies.sql` - Corrige políticas de storage
- ✅ `create-certificates-bucket.sql` - Cria bucket se não existir

## 📋 **Passos para Resolver**

### **Passo 1: Verificar/Criar Bucket**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: create-certificates-bucket.sql
```

### **Passo 2: Corrigir Políticas de Storage**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-storage-metadata-policies.sql
```

### **Passo 3: Testar Upload**
1. **Abra** o console do navegador (F12)
2. **Tente emitir** um certificado
3. **Observe os logs**:

**✅ Sucesso Esperado:**
```
📊 Tamanho do blob: [número] bytes
📊 Tipo do blob: image/png
📤 Iniciando upload para: certificates/[nome]_[timestamp].png
✅ Upload realizado com sucesso
```

## 🔍 **Verificações Importantes**

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

### **3. Verificar Estrutura da Tabela**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;
```

## 🧪 **Teste de Funcionamento**

### **Logs de Debug Adicionados:**
- `📊 Tamanho do blob: [bytes]` - Verifica se o blob tem tamanho
- `📊 Tipo do blob: [type]` - Verifica se o blob tem tipo
- `📤 Iniciando upload` - Confirma início do upload
- `✅ Upload realizado com sucesso` - Confirma sucesso

### **Se Ainda Der Erro:**
```
❌ Erro no upload: [detalhes]
❌ Detalhes do erro: {
  message: "...",
  statusCode: 400,
  error: "..."
}
```

## 🚨 **Se Ainda Não Funcionar**

### **Teste de Emergência (Desabilitar RLS temporariamente)**
```sql
-- ⚠️ APENAS PARA TESTE
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Teste o upload
-- Se funcionar, o problema é RLS
-- Reabilite com os scripts de correção
```

## ✅ **Checklist de Solução**

- [ ] Bucket `certificates` existe e está público
- [ ] Políticas de storage corrigidas
- [ ] Logs mostram tamanho e tipo do blob
- [ ] Upload funciona sem erro de RLS
- [ ] RLS reabilitado (se foi desabilitado para teste)

## 🎉 **Resultado Esperado**

Após aplicar a solução:
1. ✅ O blob tem `size` e `type` corretos
2. ✅ O upload não gera erro de RLS
3. ✅ O certificado é salvo no storage
4. ✅ A URL pública é gerada corretamente

## 📞 **Próximos Passos**

1. **Execute** `create-certificates-bucket.sql`
2. **Execute** `fix-storage-metadata-policies.sql`
3. **Teste** a emissão de certificado
4. **Verifique** os logs de debug
5. **Se funcionar**, o problema está resolvido

## 🔧 **Arquivos Modificados/Criados**

- ✅ `src/lib/certificateService.ts` - Logs de debug adicionados
- ✅ `fix-storage-metadata-policies.sql` - Correção de políticas
- ✅ `create-certificates-bucket.sql` - Criação do bucket
- ✅ `SOLUCAO_METADATA_STORAGE.md` - Este guia
