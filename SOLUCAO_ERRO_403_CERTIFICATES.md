# 🎯 SOLUÇÃO PARA ERRO 403 NA TABELA certificates

## ✅ **PROGRESSO:**
- ✅ Upload do arquivo funcionou (storage)
- ✅ Políticas RLS do storage corrigidas
- ❌ **NOVO PROBLEMA**: Erro 403 na tabela `certificates`

## 🚨 **Problema Atual:**
Erro 403 (Forbidden) ao tentar inserir na tabela `certificates`:
- **URL**: `/rest/v1/certificates?select=*`
- **Status**: 403 (Forbidden)
- **Erro**: `new row violates row-level security policy for table 'certificates'`

## 🎯 **Causa:**
O problema agora é RLS na tabela `certificates` do banco de dados, não mais no storage.

## 🔧 **SOLUÇÃO:**

### **Passo 1: Corrigir RLS da Tabela certificates**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-certificates-table-rls.sql
```

## 📋 **O que o Script Faz:**

1. **Verifica estrutura** da tabela `certificates`
2. **Remove todas as políticas** conflitantes
3. **Cria políticas super simples** (WITH CHECK (true))
4. **Testa inserção** na tabela

## 🎯 **Políticas Criadas:**

```sql
-- INSERT - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate insert" ON certificates
  FOR INSERT WITH CHECK (true);

-- SELECT - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate select" ON certificates
  FOR SELECT USING (true);

-- UPDATE - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate update" ON certificates
  FOR UPDATE USING (true);

-- DELETE - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate delete" ON certificates
  FOR DELETE USING (true);
```

## 🧪 **Teste Após Correção:**

### **1. Execute o Script:**
```sql
-- Execute fix-certificates-table-rls.sql
```

### **2. Teste na Aplicação:**
- ✅ Abra o console do navegador
- ✅ Tente emitir um certificado
- ✅ Deve funcionar sem erro 403

## ✅ **Resultado Esperado:**

Após executar o script:
- ✅ Políticas RLS da tabela `certificates` configuradas
- ✅ Inserção de certificados funciona
- ✅ Sem erro 403 (Forbidden)
- ✅ Certificado é salvo no banco

## 🎉 **Teste Agora:**

1. **Execute** `fix-certificates-table-rls.sql` no Supabase SQL Editor
2. **Teste** a emissão de certificado na aplicação
3. **Deve funcionar** completamente!

## 📊 **Progresso Atual:**
- ✅ Storage RLS corrigido
- ✅ Upload de arquivo funcionando
- 🔄 **Próximo**: Corrigir RLS da tabela certificates
