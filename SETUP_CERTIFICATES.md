# Configuração do Sistema de Certificados

## Passo 1: Configurar o Banco de Dados

Execute os scripts SQL na seguinte ordem:

```bash
# 1. Primeiro, configure as tabelas
psql -f setup-certificates-database.sql

# 2. Depois, configure as políticas de storage (após criar os buckets)
psql -f setup-certificate-policies.sql
```

## Passo 2: Criar Buckets no Supabase

### No Painel do Supabase:

1. **Acesse Storage** no painel do Supabase
2. **Clique em "Create Bucket"**

### Bucket 1: certificate-templates
- **Name**: `certificate-templates`
- **Public**: ✅ Yes
- **File size limit**: `5242880` (5MB)
- **Allowed MIME types**: `image/jpeg, image/png`

### Bucket 2: certificates
- **Name**: `certificates`
- **Public**: ✅ Yes
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `image/png, image/jpeg, application/pdf`

## Passo 3: Configurar Políticas de Storage

### No Painel do Supabase:

1. **Acesse Storage** → **Policies**
2. **Para cada bucket**, configure as políticas conforme especificado no arquivo `setup-certificate-policies.sql`

### Bucket: certificate-templates

**Política 1: Admins can upload certificate templates**
- Operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'certificate-templates' AND
EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
```

**Política 2: Admins can update certificate templates**
- Operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'certificate-templates' AND
EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
```

**Política 3: Admins can delete certificate templates**
- Operation: `DELETE`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'certificate-templates' AND
EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
```

**Política 4: Anyone can view certificate templates**
- Operation: `SELECT`
- Target roles: `public`
- Policy definition:
```sql
bucket_id = 'certificate-templates'
```

### Bucket: certificates

**Política 1: Admins can upload certificates**
- Operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'certificates' AND
EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
```

**Política 2: Users can view their own certificates**
- Operation: `SELECT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'certificates' AND
EXISTS (SELECT 1 FROM certificates WHERE certificates.certificate_url LIKE '%' || name || '%' AND certificates.user_id = auth.uid())
```

**Política 3: Admins can view all certificates**
- Operation: `SELECT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'certificates' AND
EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
```

## Passo 4: Verificar Configuração

### Teste no Painel do Supabase:

1. **Storage**: Verifique se os buckets foram criados
2. **Database**: Verifique se as tabelas foram criadas:
   - `certificate_templates`
   - `certificates`
3. **Authentication**: Verifique se as políticas RLS estão ativas

### Teste na Aplicação:

1. **Admin**: Acesse `/admin/certificates`
2. **Crie um template** para um curso
3. **Faça upload** de uma imagem de fundo
4. **Configure** as posições do texto
5. **Salve** o template

## Troubleshooting

### Erro: "must be owner of table buckets"
- **Solução**: Crie os buckets manualmente no painel do Supabase
- **Não execute**: O script de criação de buckets via SQL

### Erro: "bucket not found"
- **Verifique**: Se os buckets foram criados corretamente
- **Nomes**: Devem ser exatamente `certificate-templates` e `certificates`

### Erro: "permission denied"
- **Verifique**: Se as políticas RLS foram aplicadas
- **Execute**: O script `setup-certificate-policies.sql`

### Erro: "RLS is enabled"
- **Verifique**: Se as políticas foram criadas corretamente
- **Teste**: Login como admin e estudante

## Estrutura Final

```
Supabase Database:
├── Tables
│   ├── certificate_templates
│   └── certificates
├── Storage
│   ├── certificate-templates (bucket)
│   └── certificates (bucket)
└── Policies
    ├── RLS policies (tables)
    └── Storage policies (buckets)
```

## Próximos Passos

1. **Teste o sistema** criando um template
2. **Complete um curso** como estudante
3. **Emita um certificado** e verifique se foi gerado
4. **Verifique o download** do certificado

## Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Confirme as permissões do usuário
3. Teste as políticas RLS
4. Verifique se os buckets estão públicos
