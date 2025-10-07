# 🔧 SOLUÇÃO PARA COLUNA INEXISTENTE

## 🚨 **Problema Identificado**
Erro: `column "content_type" does not exist` - A tabela `storage.objects` não possui a coluna `content_type`.

## 🎯 **Causa**
O Supabase Storage gerencia metadados internamente e não expõe todas as colunas na tabela `storage.objects`.

## 🔧 **SOLUÇÃO:**

### **Passo 1: Verificar Estrutura Real**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: check-storage-objects-structure.sql
```

### **Passo 2: Executar Script Corrigido**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-storage-rls-corrected.sql
```

## 📋 **O que os Scripts Fazem:**

### **1. check-storage-objects-structure.sql:**
- ✅ Verifica estrutura real da tabela `storage.objects`
- ✅ Lista colunas existentes
- ✅ Verifica constraints e triggers
- ✅ Mostra índices

### **2. fix-storage-rls-corrected.sql:**
- ✅ Verifica bucket existente
- ✅ Remove todas as políticas conflitantes
- ✅ Cria políticas super simples (sem colunas inexistentes)
- ✅ Verifica objetos existentes

## 🎯 **Políticas Criadas (Corrigidas):**

```sql
-- INSERT - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates');

-- SELECT - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates download" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- UPDATE - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'certificates');

-- DELETE - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'certificates');
```

## 🧪 **Teste Após Correção:**

### **1. Execute o Script de Estrutura:**
```sql
-- Execute check-storage-objects-structure.sql
```

### **2. Execute o Script Corrigido:**
```sql
-- Execute fix-storage-rls-corrected.sql
```

### **3. Teste na Aplicação:**
- ✅ Abra o console do navegador
- ✅ Tente emitir um certificado
- ✅ Deve funcionar sem erro de RLS

## ✅ **Resultado Esperado:**

Após executar os scripts:
- ✅ Estrutura da tabela verificada
- ✅ Políticas RLS configuradas corretamente
- ✅ Upload de certificados funciona
- ✅ Sem erro de "new row violates row-level security policy"

## 🎉 **Teste Agora:**

1. **Execute** `check-storage-objects-structure.sql` no Supabase SQL Editor
2. **Execute** `fix-storage-rls-corrected.sql` no Supabase SQL Editor
3. **Teste** a emissão de certificado na aplicação

**Deve funcionar imediatamente!**
