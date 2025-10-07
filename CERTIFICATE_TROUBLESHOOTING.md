# Solução de Problemas - Sistema de Certificados

## 🚨 Erro: "Template de certificado não encontrado para este curso"

### 📋 **O que significa este erro?**

Este erro acontece quando um estudante tenta emitir um certificado, mas não existe um template de certificado configurado para o curso que ele concluiu.

### 🔧 **Como Resolver:**

#### **Passo 1: Verificar se existe template para o curso**

1. **Acesse** `/admin/certificates` como administrador
2. **Vá para a aba "Templates"**
3. **Verifique** se existe um template para o curso em questão

#### **Passo 2: Criar template se não existir**

1. **Clique em "Novo Template"**
2. **Selecione o curso** que precisa do template
3. **Faça upload** de uma imagem de fundo (JPG ou PNG)
4. **Configure as posições** do texto:
   - Nome do estudante (X, Y, fonte, cor, alinhamento)
   - Data de conclusão (X, Y, fonte, cor, alinhamento)
5. **Salve** o template

#### **Passo 3: Testar a emissão**

1. **Volte** para a página de certificados do estudante
2. **Tente emitir** o certificado novamente
3. **Deve funcionar** agora!

### 🎯 **Prevenção:**

Para evitar este problema no futuro:

1. **Sempre crie templates** para todos os cursos que emitem certificados
2. **Verifique** se o template foi criado corretamente
3. **Teste** a emissão de certificados após criar templates

### 🔍 **Verificações Adicionais:**

#### **Verificar se o curso existe:**
- O curso deve estar publicado (`is_published = true`)
- O curso deve ter módulos e aulas

#### **Verificar se o template está correto:**
- Template deve ter `course_id` correto
- Template deve ter `background_image_url` válida
- Template deve ter `text_config` configurado

#### **Verificar permissões:**
- Usuário deve ter permissão para acessar o curso
- Template deve ser acessível publicamente

### 🛠️ **Comandos SQL para Debug:**

Se precisar verificar diretamente no banco:

```sql
-- Verificar se existe template para um curso
SELECT * FROM certificate_templates 
WHERE course_id = 'ID_DO_CURSO';

-- Verificar se o curso existe e está publicado
SELECT id, title, is_published FROM courses 
WHERE id = 'ID_DO_CURSO';

-- Verificar templates de todos os cursos
SELECT 
  ct.id,
  ct.course_id,
  c.title as course_title,
  ct.background_image_url,
  ct.created_at
FROM certificate_templates ct
JOIN courses c ON c.id = ct.course_id
ORDER BY ct.created_at DESC;
```

### 📞 **Se o problema persistir:**

1. **Verifique os logs** do navegador (F12 → Console)
2. **Verifique os logs** do Supabase
3. **Confirme** se as tabelas foram criadas corretamente
4. **Execute** o script `setup-certificates-complete.sql` novamente

### ✅ **Checklist de Verificação:**

- [ ] Template existe para o curso?
- [ ] Template tem imagem de fundo válida?
- [ ] Template tem configuração de texto?
- [ ] Curso está publicado?
- [ ] Usuário tem acesso ao curso?
- [ ] Buckets de storage foram criados?
- [ ] Políticas de RLS estão ativas?

### 🎉 **Resultado Esperado:**

Após seguir estes passos, o estudante deve conseguir:
1. **Ver** o curso na lista de "Cursos Concluídos"
2. **Clicar** em "Emitir" sem erro
3. **Receber** o certificado gerado
4. **Visualizar** e baixar o certificado
