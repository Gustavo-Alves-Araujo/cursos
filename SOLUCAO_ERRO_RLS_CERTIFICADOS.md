# 🔧 Solução para Erro de RLS em Certificados

## 🚨 **Problema Identificado**
Erro: `Bad Request` com `new row violates row-level security policy` ao tentar emitir certificados.

## 🎯 **Solução Passo a Passo**

### **Passo 1: Diagnóstico**
Execute o script de diagnóstico para identificar o problema:

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: diagnose-certificate-issue.sql
```

### **Passo 2: Corrigir Políticas RLS**
Execute o script de correção:

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-certificate-upload-rls.sql
```

### **Passo 3: Verificar Buckets de Storage**
1. **Acesse** o painel do Supabase
2. **Vá em** Storage
3. **Verifique** se existe o bucket `certificates`
4. **Se não existir**, crie com as seguintes configurações:
   - **Nome**: `certificates`
   - **Público**: Sim
   - **Limite de arquivo**: 10MB
   - **Tipos permitidos**: `image/png, image/jpeg, application/pdf`

### **Passo 4: Testar a Solução**
1. **Abra** o console do navegador (F12)
2. **Tente emitir** um certificado
3. **Observe os logs**:
   - ✅ **Sucesso**: "Template encontrado: {...}"
   - ❌ **Erro**: Verifique se executou todos os scripts

## 🔍 **Verificações Importantes**

### **1. Políticas RLS Corretas**
```sql
-- Deve retornar políticas para certificate_templates e certificates
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('certificate_templates', 'certificates');
```

### **2. Bucket de Storage**
```sql
-- Deve retornar o bucket certificates
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'certificates';
```

### **3. Políticas de Storage**
```sql
-- Deve retornar políticas para o bucket certificates
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%certificates%';
```

## 🚨 **Se Ainda Não Funcionar**

### **Teste de Emergência (Desabilitar RLS temporariamente)**
```sql
-- ⚠️ APENAS PARA TESTE - Remove segurança
ALTER TABLE certificate_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;

-- Teste a emissão
-- Se funcionar, o problema é RLS
-- Reabilite com os scripts de correção
```

### **Verificar Logs Detalhados**
1. **Abra** o console do navegador
2. **Procure por**:
   - `🔍 Buscando template para curso:`
   - `📊 Resultado da busca:`
   - `❌ Erro na busca:` ou `✅ Template encontrado:`

## 📋 **Checklist de Solução**

- [ ] Script de diagnóstico executado
- [ ] Script de correção RLS executado
- [ ] Bucket `certificates` existe e está público
- [ ] Políticas de storage configuradas
- [ ] Teste de emissão realizado
- [ ] Logs mostram sucesso
- [ ] RLS reabilitado (se foi desabilitado para teste)

## 🔧 **Scripts Criados**

1. **`diagnose-certificate-issue.sql`** - Diagnóstico completo
2. **`fix-certificate-upload-rls.sql`** - Correção das políticas RLS
3. **`temporarily-disable-rls-certificates.sql`** - Teste de emergência

## 📞 **Próximos Passos**

1. **Execute** o diagnóstico primeiro
2. **Aplique** a correção de RLS
3. **Verifique** os buckets de storage
4. **Teste** a emissão de certificado
5. **Se funcionar**, o problema está resolvido
6. **Se não funcionar**, execute o teste de emergência

## ✅ **Resultado Esperado**

Após aplicar a solução, você deve ver nos logs:
```
🔍 Buscando template para curso: [ID_DO_CURSO]
📊 Resultado da busca: { data: {...}, error: null }
✅ Template encontrado: {...}
```

E o certificado deve ser emitido com sucesso sem erro de RLS.
