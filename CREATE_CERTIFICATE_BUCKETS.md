# Como Criar os Buckets de Certificados no Supabase

Este guia passo a passo mostra como criar os buckets necessários para o sistema de certificados no Supabase.

## 📋 Pré-requisitos

- Acesso ao painel do Supabase
- Projeto do Supabase configurado
- Permissões de administrador no projeto

## 🚀 Passo a Passo

### Passo 1: Acessar o Painel do Supabase

1. **Abra seu navegador** e acesse [https://supabase.com](https://supabase.com)
2. **Faça login** com suas credenciais
3. **Selecione seu projeto** na lista de projetos

### Passo 2: Navegar para Storage

1. **No menu lateral esquerdo**, clique em **"Storage"**
2. **Você verá a página de Storage** com a lista de buckets existentes

### Passo 3: Criar o Primeiro Bucket (certificate-templates)

1. **Clique no botão "Create Bucket"** (geralmente no canto superior direito)
2. **Preencha os seguintes dados:**

   ```
   Name: certificate-templates
   Public: ✅ Yes (marque esta opção)
   File size limit: 5242880
   Allowed MIME types: image/jpeg, image/png
   ```

3. **Clique em "Create Bucket"**

### Passo 4: Criar o Segundo Bucket (certificates)

1. **Clique novamente em "Create Bucket"**
2. **Preencha os seguintes dados:**

   ```
   Name: certificates
   Public: ✅ Yes (marque esta opção)
   File size limit: 10485760
   Allowed MIME types: image/png, image/jpeg, application/pdf
   ```

3. **Clique em "Create Bucket"**

### Passo 5: Verificar os Buckets Criados

1. **Na lista de buckets**, você deve ver:
   - `certificate-templates`
   - `certificates`

2. **Clique em cada bucket** para verificar as configurações:
   - ✅ **Public**: Yes
   - ✅ **File size limit**: Configurado corretamente
   - ✅ **Allowed MIME types**: Configurado corretamente

## 🔧 Configurações Detalhadas

### Bucket: certificate-templates

| Campo | Valor | Descrição |
|-------|-------|-----------|
| **Name** | `certificate-templates` | Nome do bucket para templates |
| **Public** | ✅ Yes | Permite acesso público aos arquivos |
| **File size limit** | `5242880` | 5MB em bytes |
| **Allowed MIME types** | `image/jpeg, image/png` | Tipos de arquivo permitidos |

### Bucket: certificates

| Campo | Valor | Descrição |
|-------|-------|-----------|
| **Name** | `certificates` | Nome do bucket para certificados |
| **Public** | ✅ Yes | Permite acesso público aos arquivos |
| **File size limit** | `10485760` | 10MB em bytes |
| **Allowed MIME types** | `image/png, image/jpeg, application/pdf` | Tipos de arquivo permitidos |

## 🛡️ Configuração de Políticas (Opcional)

As políticas de segurança são configuradas automaticamente pelo script SQL `setup-certificates-complete.sql`. 

**Se você quiser verificar manualmente:**

1. **Vá para Storage** → **Policies**
2. **Verifique se existem as seguintes políticas:**

### Para certificate-templates:
- ✅ Admins can upload certificate templates
- ✅ Admins can update certificate templates  
- ✅ Admins can delete certificate templates
- ✅ Anyone can view certificate templates

### Para certificates:
- ✅ Admins can upload certificates
- ✅ Users can view their own certificates
- ✅ Admins can view all certificates

## ✅ Verificação Final

### 1. Teste de Upload (Admin)
1. **Acesse** `/admin/certificates` como administrador
2. **Vá para a aba "Templates"**
3. **Clique em "Novo Template"**
4. **Faça upload de uma imagem** de fundo
5. **Verifique** se o upload foi bem-sucedido

### 2. Teste de Visualização (Usuário)
1. **Acesse** `/certificados` como usuário
2. **Complete um curso** se ainda não tiver
3. **Emita um certificado**
4. **Verifique** se o certificado foi gerado e pode ser visualizado

## 🚨 Solução de Problemas

### Erro: "Bucket not found"
- **Verifique** se os nomes dos buckets estão exatamente como especificado
- **Confirme** se os buckets foram criados corretamente

### Erro: "Permission denied"
- **Verifique** se as políticas RLS foram aplicadas
- **Execute** o script `setup-certificates-complete.sql`

### Erro: "File too large"
- **Verifique** se o limite de tamanho está configurado corretamente
- **Templates**: máximo 5MB
- **Certificados**: máximo 10MB

### Erro: "Invalid file type"
- **Verifique** se os tipos MIME estão configurados corretamente
- **Templates**: apenas `image/jpeg, image/png`
- **Certificados**: `image/png, image/jpeg, application/pdf`

## 📝 Notas Importantes

- ⚠️ **Nomes dos buckets são case-sensitive** - use exatamente como especificado
- 🔒 **Buckets públicos** permitem acesso direto aos arquivos via URL
- 📏 **Limites de tamanho** são em bytes (1MB = 1048576 bytes)
- 🎨 **Templates** são para imagens de fundo dos certificados
- 📜 **Certificados** são os arquivos finais gerados para os usuários

## 🎯 Próximos Passos

Após criar os buckets:

1. **Execute** o script `setup-certificates-complete.sql`
2. **Teste** o sistema criando um template
3. **Complete** um curso como estudante
4. **Emita** um certificado e verifique se foi gerado corretamente

## 📞 Suporte

Se encontrar problemas:

1. **Verifique** os logs do Supabase
2. **Confirme** as permissões do usuário
3. **Teste** as políticas RLS
4. **Verifique** se os buckets estão públicos
5. **Consulte** a documentação do Supabase Storage
