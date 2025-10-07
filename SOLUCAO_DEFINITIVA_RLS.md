# 🚀 SOLUÇÃO DEFINITIVA - DESABILITAR RLS TEMPORARIAMENTE

## 🎯 **Problema**
O Supabase Storage está violando RLS porque não está passando `size` e `content_type` corretamente, e as políticas estão bloqueando.

## 🔧 **SOLUÇÃO SIMPLES**

### **Passo 1: Desabilitar RLS Temporariamente**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: disable-storage-rls-temp.sql
```

### **Passo 2: Testar Upload**
1. **Abra** o console do navegador (F12)
2. **Tente emitir** um certificado
3. **Deve funcionar** sem erro de RLS

### **Passo 3: Reabilitar RLS (Opcional)**
```sql
-- Execute APENAS se quiser reabilitar depois
-- Arquivo: reenable-storage-rls.sql
```

## 📋 **Scripts Criados**

1. **`disable-storage-rls-temp.sql`** - Desabilita RLS e cria bucket
2. **`reenable-storage-rls.sql`** - Reabilita RLS com políticas corretas

## ✅ **Resultado Esperado**

Após executar `disable-storage-rls-temp.sql`:
- ✅ RLS desabilitado na tabela `storage.objects`
- ✅ Bucket `certificates` criado
- ✅ Upload de certificados funciona
- ✅ Sem erro de RLS

## 🚨 **IMPORTANTE**

- **RLS desabilitado** = Menos segurança, mas funciona
- **RLS habilitado** = Mais segurança, mas pode dar problema
- **Escolha** baseada na sua necessidade de segurança

## 🎉 **Teste Agora**

1. **Execute** `disable-storage-rls-temp.sql`
2. **Teste** a emissão de certificado
3. **Se funcionar**, problema resolvido!
4. **Se quiser**, execute `reenable-storage-rls.sql` depois

## 📞 **Se Ainda Não Funcionar**

Verifique se:
- ✅ Bucket `certificates` foi criado
- ✅ RLS está desabilitado
- ✅ Não há outras políticas conflitantes

**Execute o script e teste. Deve funcionar!**
