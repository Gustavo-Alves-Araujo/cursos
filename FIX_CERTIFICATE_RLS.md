# 🔧 Corrigir Problema de RLS em Certificados

## 🚨 **Problema Identificado**
O template existe no banco mas usuários não conseguem acessá-lo devido a políticas RLS (Row Level Security) restritivas.

## 🎯 **Solução: Corrigir Políticas RLS**

### **Opção 1: Corrigir Políticas (Recomendado)**

1. **Acesse o Supabase SQL Editor**
2. **Execute o script**: `fix-certificate-rls-policies.sql`
3. **Verifique** se as políticas foram criadas
4. **Teste** a emissão de certificado

### **Opção 2: Teste Temporário (Debug)**

1. **Execute o script**: `temporarily-disable-rls-certificates.sql`
2. **Teste** se a emissão funciona
3. **Se funcionar**, o problema é RLS
4. **Reabilite** o RLS com a Opção 1

## 📋 **Passo a Passo Detalhado**

### **Passo 1: Executar Script de Correção**

```sql
-- Execute este SQL no Supabase
-- 1. Remover políticas conflitantes
DROP POLICY IF EXISTS "Admins can manage certificate templates" ON certificate_templates;
DROP POLICY IF EXISTS "Authenticated users can read certificate templates" ON certificate_templates;

-- 2. Criar políticas corretas
CREATE POLICY "Admins can manage certificate templates" ON certificate_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can read certificate templates" ON certificate_templates
  FOR SELECT USING (auth.role() = 'authenticated');
```

### **Passo 2: Verificar Políticas**

```sql
-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'certificate_templates';
```

### **Passo 3: Testar Acesso**

```sql
-- Testar se consegue ler templates
SELECT COUNT(*) as template_count 
FROM certificate_templates;

-- Testar template específico
SELECT 
  ct.id,
  ct.course_id,
  ct.background_image_url
FROM certificate_templates ct
WHERE ct.course_id = '399b1247-3464-44fd-89d3-8f46787c423c';
```

### **Passo 4: Testar na Aplicação**

1. **Abra o console** do navegador (F12)
2. **Tente emitir** o certificado
3. **Observe os logs**:
   - ✅ Deve mostrar: "Template encontrado: {...}"
   - ❌ Se ainda der erro, execute a Opção 2

## 🔍 **Verificação de Sucesso**

### **Logs Esperados (Sucesso):**
```
🔍 Buscando template para curso: 399b1247-3464-44fd-89d3-8f46787c423c
📊 Resultado da busca: { data: {...}, error: null }
✅ Template encontrado: {...}
```

### **Logs de Erro (Ainda com problema):**
```
🔍 Buscando template para curso: 399b1247-3464-44fd-89d3-8f46787c423c
📊 Resultado da busca: { data: null, error: {...} }
❌ Erro na busca: {...}
```

## 🚨 **Se Ainda Não Funcionar**

### **Teste de Emergência (Desabilitar RLS temporariamente):**

```sql
-- ⚠️ APENAS PARA TESTE - Remove segurança
ALTER TABLE certificate_templates DISABLE ROW LEVEL SECURITY;

-- Teste a emissão
-- Se funcionar, o problema é RLS
-- Reabilite com: ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
```

## 📞 **Suporte Adicional**

Se o problema persistir:

1. **Execute** o teste de emergência
2. **Confirme** se funciona sem RLS
3. **Verifique** se as políticas foram aplicadas corretamente
4. **Considere** recriar o template do zero

## ✅ **Checklist Final**

- [ ] Script de correção executado
- [ ] Políticas verificadas no banco
- [ ] Teste de acesso executado
- [ ] Logs mostram template encontrado
- [ ] Emissão de certificado funciona
- [ ] RLS reabilitado (se foi desabilitado para teste)
