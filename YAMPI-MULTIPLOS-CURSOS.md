# Integração Yampi com Múltiplos Cursos

## 📋 Resumo das Alterações

Foi implementada a funcionalidade de permitir que uma integração Yampi possa estar vinculada a **múltiplos cursos**. Agora, quando um aluno fizer uma compra, ele será automaticamente matriculado em **todos os cursos** configurados na integração.

## 🗄️ Alterações no Banco de Dados

### Nova Coluna: `course_ids`

Foi adicionada uma coluna `course_ids` (array de UUIDs) na tabela `yampi_integrations` existente.

**O que mudou:**
- Adicionada coluna `course_ids` do tipo `UUID[]` (array)
- A coluna `course_id` (singular) é **mantida** para compatibilidade total
- Índice GIN para performance em buscas de array

### Como Aplicar a Migração

1. Acesse o painel do Supabase: https://app.supabase.com
2. Vá para o seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Cole o conteúdo do arquivo `supabase-yampi-multiple-courses.sql`
5. Clique em "Run" para executar a migração

**✅ IMPORTANTE:** 
- **Zero downtime!** A migração não mexe nas integrações existentes
- A coluna `course_id` antiga é mantida e continua funcionando
- Nenhum dado é alterado ou perdido

## 🎨 Alterações na Interface

### Página de Administração (`/admin/integracoes/yampi`)

#### Antes:
- Seleção de **um único curso** por integração (dropdown)

#### Depois:
- Seleção de **múltiplos cursos** por integração (checkboxes)
- Campo de busca para filtrar cursos
- Contador de cursos selecionados
- Validação para garantir que pelo menos 1 curso seja selecionado

#### Visualização:
- Lista de integrações agora mostra **todos os cursos vinculados** como badges
- Contador de cursos vinculados por integração

## 🔄 Alterações no Webhook

### Arquivo: `/src/app/api/webhooks/yampi/route.ts`

**O que mudou:**
1. O webhook agora lê a coluna `course_ids` (array)
2. Para cada compra aprovada (`status: paid`), o sistema **matricula o aluno em todos os cursos** do array
3. **Compatibilidade total:** se `course_ids` estiver vazio, usa `course_id` (singular) da estrutura antiga
4. Logs melhorados para rastreamento de matrículas em múltiplos cursos

**Lógica de Prioridade:**
```javascript
// Prioridade 1: course_ids (array - nova estrutura)
if (integration.course_ids && integration.course_ids.length > 0) {
  // Matricula em todos os cursos do array
}
// Prioridade 2: course_id (singular - compatibilidade)
else if (integration.course_id) {
  // Matricula no curso único
}
```

**Comportamento:**
```javascript
// Exemplo: Integração com 3 cursos
yampi_integration {
  name: "Pacote Completo",
  product_id: "12345",
  course_ids: [
    "uuid-curso-psicologia",
    "uuid-curso-terapia",
    "uuid-curso-coaching"
  ]
}

// Ao receber webhook de compra aprovada:
// → Cria/atualiza usuário
// → Matricula no Curso de Psicologia
// → Matricula no Curso de Terapia
// → Matricula no Curso de Coaching
```

## ✅ Como Usar

### 1. Criar Nova Integração com Múltiplos Cursos

1. Acesse `/admin/integracoes/yampi`
2. Clique em "Nova Integração"
3. Preencha:
   - Nome da Entrega
   - ID do Produto (Yampi)
   - Chave Secreta
   - **Selecione todos os cursos desejados** (mínimo 1)
4. Clique em "Criar"

### 2. Editar Integração Existente

1. Na lista de integrações, clique no ícone de editar (✏️)
2. Os cursos já vinculados aparecerão selecionados
3. Marque/desmarque cursos conforme necessário
4. Clique em "Atualizar"

### 3. Testar a Integração

1. Faça uma compra de teste na Yampi com o produto configurado
2. Aguarde o webhook ser processado
3. Verifique os logs do servidor para confirmar as matrículas
4. Confirme que o aluno foi matriculado em **todos os cursos**

## 🔍 Checklist de Verificação

Após aplicar as alterações, verifique:

- [ ] Migração do banco executada com sucesso
- [ ] Coluna `course_ids` criada na tabela `yampi_integrations`
- [ ] Integrações antigas continuam funcionando
- [ ] Interface permite seleção de múltiplos cursos
- [ ] Validação de mínimo 1 curso funciona
- [ ] Lista mostra todos os cursos vinculados
- [ ] Webhook matricula em todos os cursos
- [ ] Logs mostram informações de múltiplas matrículas

## 📝 Estrutura de Dados

### Exemplo de Integração na Nova Estrutura

```json
{
  "id": "uuid-da-integracao",
  "name": "Pacote Premium",
  "product_id": "12345",
  "secret_key": "chave-secreta",
  "course_id": null,  // Mantido para compatibilidade
  "course_ids": [     // Nova coluna (array)
    "uuid-curso-1",
    "uuid-curso-2",
    "uuid-curso-3"
  ]
}
```

### Exemplo de Integração Antiga (Ainda Funciona!)

```json
{
  "id": "uuid-da-integracao-antiga",
  "name": "Curso Único",
  "product_id": "54321",
  "secret_key": "chave-secreta",
  "course_id": "uuid-curso-1",  // Estrutura antiga
  "course_ids": []                // Vazio
}
```

## 🐛 Troubleshooting

### Problema: "Selecione pelo menos um curso"
**Solução:** Marque pelo menos um checkbox antes de salvar.

### Problema: Cursos não aparecem na lista
**Solução:** Verifique se há cursos cadastrados na tabela `courses`.

### Problema: Webhook não matricula em todos os cursos
**Solução:** 
1. Verifique os logs do servidor
2. Confirme que a migração foi executada (coluna `course_ids` existe)
3. Verifique se a integração tem valores em `course_ids`
4. Se não tiver `course_ids`, verifique se tem `course_id` (compatibilidade)

### Problema: Coluna course_ids não aparece
**Solução:** Execute a migração SQL novamente:
```sql
ALTER TABLE yampi_integrations 
ADD COLUMN IF NOT EXISTS course_ids UUID[] DEFAULT '{}';
```

## 🔐 Segurança

- As políticas RLS foram configuradas para a nova tabela
- Apenas administradores podem criar/editar integrações
- O webhook valida o `product_id` antes de processar

## 📞 Suporte

Se encontrar algum problema:
1. Verifique os logs do console do navegador (frontend)
2. Verifique os logs do servidor (webhook)
3. Verifique o Supabase Dashboard > Logs
4. Consulte este documento para troubleshooting

