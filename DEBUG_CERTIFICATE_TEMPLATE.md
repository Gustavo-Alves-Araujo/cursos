# Debug: Template de Certificado Não Encontrado

## 🔍 **Passo a Passo para Debug**

### **1. Verificar se o Template Existe**

1. **Acesse** `/admin/certificates` como administrador
2. **Vá para a aba "Templates"**
3. **Verifique** se existe um template para o curso em questão
4. **Anote o ID do curso** que está causando problema

### **2. Verificar no Console do Navegador**

1. **Abra o Console** (F12 → Console)
2. **Tente emitir o certificado** novamente
3. **Procure pelos logs** que começam com emojis:
   - 🔍 Buscando template para curso: [ID_DO_CURSO]
   - 📊 Resultado da busca: [dados]
   - ❌ Erro na busca: [erro]
   - 📝 Template não encontrado para o curso

### **3. Verificar no Banco de Dados**

Execute este SQL no Supabase para verificar:

```sql
-- Verificar todos os templates
SELECT 
  ct.id,
  ct.course_id,
  c.title as course_title,
  ct.background_image_url,
  ct.created_at
FROM certificate_templates ct
LEFT JOIN courses c ON c.id = ct.course_id
ORDER BY ct.created_at DESC;

-- Verificar template específico para um curso
SELECT * FROM certificate_templates 
WHERE course_id = 'ID_DO_CURSO_AQUI';

-- Verificar se o curso existe
SELECT id, title, is_published FROM courses 
WHERE id = 'ID_DO_CURSO_AQUI';
```

### **4. Possíveis Causas do Problema**

#### **A. Template não foi criado corretamente**
- **Sintoma**: Template não aparece na lista de admin
- **Solução**: Recriar o template

#### **B. ID do curso incorreto**
- **Sintoma**: Template existe mas para curso diferente
- **Solução**: Verificar se o ID do curso está correto

#### **C. Problema de permissões RLS**
- **Sintoma**: Template existe no banco mas não é encontrado
- **Solução**: Verificar políticas RLS

#### **D. Problema de cache**
- **Sintoma**: Template aparece em admin mas não é encontrado
- **Solução**: Limpar cache do navegador

### **5. Comandos de Debug no Console**

Execute estes comandos no console do navegador:

```javascript
// Verificar se o template existe
const checkTemplate = async (courseId) => {
  const { data, error } = await supabase
    .from('certificate_templates')
    .select('*')
    .eq('course_id', courseId);
  
  console.log('Template encontrado:', data);
  console.log('Erro:', error);
};

// Usar: checkTemplate('ID_DO_CURSO')
```

### **6. Checklist de Verificação**

- [ ] Template existe na aba "Templates" do admin?
- [ ] ID do curso está correto?
- [ ] Template tem imagem de fundo válida?
- [ ] Template tem configuração de texto?
- [ ] Curso está publicado?
- [ ] Usuário tem acesso ao curso?
- [ ] Não há erros no console?
- [ ] Políticas RLS estão ativas?

### **7. Soluções Rápidas**

#### **Solução 1: Recriar Template**
1. Delete o template existente
2. Crie um novo template para o curso
3. Teste a emissão

#### **Solução 2: Verificar ID do Curso**
1. Anote o ID do curso que está falhando
2. Verifique se existe template para esse ID
3. Se não existir, crie um template

#### **Solução 3: Resetar RLS**
1. Execute o script `setup-certificates-complete.sql`
2. Verifique se as políticas foram aplicadas
3. Teste novamente

### **8. Logs Esperados (Sucesso)**

Quando funcionando, você deve ver:

```
🔍 Buscando template para curso: [ID]
📊 Resultado da busca: { data: {...}, error: null }
✅ Template encontrado: {...}
🎓 Gerando certificado: {...}
📋 Template encontrado: {...}
```

### **9. Logs de Erro Comuns**

#### **Template não encontrado:**
```
🔍 Buscando template para curso: [ID]
📊 Resultado da busca: { data: null, error: {...} }
❌ Erro na busca: {...}
📝 Template não encontrado para o curso
```

#### **Problema de permissão:**
```
🔍 Buscando template para curso: [ID]
📊 Resultado da busca: { data: null, error: {...} }
❌ Erro na busca: { message: "permission denied" }
```

### **10. Contato para Suporte**

Se o problema persistir:

1. **Copie todos os logs** do console
2. **Anote o ID do curso** que está falhando
3. **Verifique** se o template existe no banco
4. **Execute** os comandos SQL de verificação
5. **Documente** os passos que já tentou
