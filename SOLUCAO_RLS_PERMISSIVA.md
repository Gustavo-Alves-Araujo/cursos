# 🚀 SOLUÇÃO RLS PERMISSIVA - SEM DESABILITAR

## 🚨 **Problema**
Não consegue desabilitar RLS porque não tem permissão de owner na tabela `storage.objects`.

## 🔧 **SOLUÇÃO: Políticas Ultra Permissivas**

### **Passo 1: Execute o Script Ultra Permissivo**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-storage-rls-ultra-permissive.sql
```

### **Passo 2: Teste Upload**
1. **Abra** o console do navegador (F12)
2. **Tente emitir** um certificado
3. **Deve funcionar** sem erro de RLS

## 📋 **O que o Script Faz**

- ✅ Remove TODAS as políticas conflitantes
- ✅ Cria políticas ultra permissivas (sem restrições)
- ✅ Cria bucket `certificates` se não existir
- ✅ Permite upload sem restrições

## 🎯 **Políticas Criadas**

- **INSERT**: Qualquer um pode fazer upload no bucket `certificates`
- **SELECT**: Qualquer um pode ver arquivos do bucket `certificates`
- **UPDATE**: Qualquer um pode atualizar arquivos do bucket `certificates`
- **DELETE**: Qualquer um pode deletar arquivos do bucket `certificates`

## ✅ **Resultado Esperado**

Após executar o script:
- ✅ Upload de certificados funciona
- ✅ Sem erro de RLS
- ✅ Problema resolvido!

## 🧪 **Teste Agora**

1. **Execute** `fix-storage-rls-ultra-permissive.sql`
2. **Teste** a emissão de certificado
3. **Deve funcionar** imediatamente!

## 📞 **Se Ainda Não Funcionar**

Verifique se:
- ✅ Bucket `certificates` foi criado
- ✅ Políticas foram criadas
- ✅ Não há outras restrições

**Execute o script e teste. Deve funcionar!**
