# 🔧 Corrigir Problema de Storage de Certificados

## 🚨 **Problema Identificado**
Erro: `Invalid key: certificates/Usuário_1759742572310.png`

O problema é que o nome do arquivo contém caracteres inválidos para o Supabase Storage.

## 🎯 **Soluções Implementadas**

### **1. Limpeza do Nome do Arquivo**
- ✅ Removidos caracteres especiais (acentos, espaços, etc.)
- ✅ Substituídos por underscores
- ✅ Removidos underscores duplicados
- ✅ Adicionado log para debug

### **2. Verificação do Bucket**
Execute o script `verify-certificate-storage.sql` para verificar:
- Se o bucket `certificates` existe
- Se as políticas estão corretas
- Se há arquivos no bucket

## 🔍 **Como Testar**

### **Passo 1: Verificar Bucket**
```sql
-- Execute no Supabase SQL Editor
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'certificates';
```

**Resultado esperado:**
- `id`: certificates
- `name`: certificates  
- `public`: true
- `file_size_limit`: 10485760 (10MB)
- `allowed_mime_types`: ["image/png", "image/jpeg", "application/pdf"]

### **Passo 2: Verificar Políticas**
```sql
-- Verificar políticas do storage
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%certificates%';
```

**Políticas esperadas:**
- `Admins can upload certificates` (INSERT)
- `Users can view their own certificates` (SELECT)
- `Admins can view all certificates` (SELECT)

### **Passo 3: Testar Upload**
1. **Abra o console** do navegador (F12)
2. **Tente emitir** o certificado
3. **Observe os logs**:
   - ✅ Deve mostrar: `📁 Nome do arquivo: certificates/Usuario_1234567890.png`
   - ❌ Se ainda der erro, verifique as políticas

## 🚨 **Se Ainda Não Funcionar**

### **Problema 1: Bucket não existe**
**Solução:** Criar bucket manualmente no painel do Supabase
1. Vá em **Storage** → **Create Bucket**
2. Nome: `certificates`
3. Public: ✅ Yes
4. File size limit: `10485760` (10MB)
5. Allowed MIME types: `image/png, image/jpeg, application/pdf`

### **Problema 2: Políticas incorretas**
**Solução:** Executar script de correção
```sql
-- Remover políticas existentes
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;

-- Criar políticas corretas
CREATE POLICY "Admins can upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM certificates 
      WHERE certificates.certificate_url LIKE '%' || name || '%'
      AND certificates.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

### **Problema 3: Permissões de usuário**
**Solução:** Verificar se o usuário tem permissão para acessar o bucket
```sql
-- Verificar se o usuário atual tem permissão
SELECT auth.uid() as current_user_id;
```

## 📋 **Checklist de Verificação**

- [ ] Bucket `certificates` existe?
- [ ] Bucket está público?
- [ ] Políticas de storage estão corretas?
- [ ] Nome do arquivo está limpo?
- [ ] Usuário tem permissão para upload?
- [ ] Logs mostram nome do arquivo correto?

## 🎯 **Logs Esperados (Sucesso)**

```
📁 Nome do arquivo: certificates/Usuario_1759742572310.png
✅ Upload realizado com sucesso
✅ Certificado gerado
```

## 🎯 **Logs de Erro (Ainda com problema)**

```
📁 Nome do arquivo: certificates/Usuario_1759742572310.png
❌ Erro no upload: Invalid key
```

Se ainda der erro após essas correções, o problema pode ser:
1. **Bucket não existe** - Criar manualmente
2. **Políticas incorretas** - Executar script de correção
3. **Permissões de usuário** - Verificar RLS
