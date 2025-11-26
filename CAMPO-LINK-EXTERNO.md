# Campo de Link Externo para Cursos ✅

## Resumo
Foi adicionado um novo campo **opcional** chamado "Link Externo do Curso" nos formulários de criação e edição de cursos. Este campo permite direcionar usuários que ainda não possuem o curso (aba "Cursos que você ainda não tem") para um link específico quando clicarem no card do curso.

## ⚠️ AÇÃO NECESSÁRIA
Antes de usar esta funcionalidade, você deve executar o script SQL no seu banco de dados Supabase:
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o conteúdo do arquivo `supabase-add-external-link.sql`

## Alterações Realizadas

### 1. 🗄️ Banco de Dados
- **Arquivo**: `supabase-add-external-link.sql`
- **Ação necessária**: Execute este script no Supabase para adicionar o campo `external_link` na tabela `courses`

```sql
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS external_link TEXT;
```

### 2. 📘 Tipos TypeScript
**Arquivos alterados:**
- `src/types/course.ts` - Adicionado campo `externalLink?: string` no tipo `Course`
- `src/lib/supabase.ts` - Atualizado interface Database para incluir `external_link` na tabela courses

### 3. 📝 Formulário de Administração
- **Arquivo**: `src/components/admin/AdminCourseForm.tsx`
- Adicionado campo de input para o link externo
- Campo é **opcional** e aceita URLs
- Inclui descrição explicativa: "Link para direcionar usuários que ainda não possuem o curso"
- Validação de URL com `type="url"`

### 4. 🔧 Hook de Cursos
- **Arquivo**: `src/hooks/useCourses.ts`
- Atualizada função `createCourse` para incluir o campo `external_link`
- Atualizada função `updateCourse` para incluir o campo `external_link`
- Mapeamento do campo nas funções `fetchCourses` e `fetchMyCourses`
- Campo só é enviado se estiver preenchido

### 5. 🎨 Componente CourseCard
- **Arquivo**: `src/components/CourseCard.tsx`
- Quando o usuário **não possui** o curso (`isOwned = false`) e há um `externalLink` definido:
  - O card se torna clicável ✅
  - Ao clicar, redireciona para o link externo em uma nova aba ✅
  - Não fica mais com aparência desabilitada (grayscale) ✅
  - Mantém a animação de hover ✅
  - Link abre com segurança (`target="_blank"` + `rel="noopener noreferrer"`) ✅

### 6. 📄 Páginas de Administração
- **Arquivo**: `src/app/admin/courses/new/page.tsx`
- Atualizado tipo do handleSubmit para incluir `externalLink`

## Como Usar

### 1. Aplicar a Migration
Execute o script SQL no Supabase:
```bash
# Acesse o Supabase Dashboard > SQL Editor e execute o conteúdo de:
# supabase-add-external-link.sql
```

### 2. Criar ou Editar um Curso
1. Acesse a área de administração
2. Vá para "Cursos" > "Novo Curso" ou edite um curso existente
3. Preencha o campo "Link Externo do Curso" (opcional)
   - Exemplo: `https://minha-loja.com/comprar-curso-react`
4. Salve o curso

### 3. Comportamento para Usuários
- **Se o usuário JÁ possui o curso**: Ao clicar no card, é direcionado para a página interna do curso
- **Se o usuário NÃO possui o curso E há um link externo**: Ao clicar no card, é direcionado para o link externo (nova aba)
- **Se o usuário NÃO possui o curso E NÃO há link externo**: O card fica desabilitado (comportamento anterior)

## Validações
- Campo é **opcional** (não obrigatório)
- Aceita qualquer URL válida
- Se deixado em branco, o comportamento padrão é mantido

## Exemplos de Uso
- Link para página de venda do curso
- Link para página de inscrição
- Link para formulário de interesse
- Link para página de informações detalhadas
- Link para checkout direto

## Observações
- O link externo só é utilizado para usuários que **não possuem** o curso
- O link abre em uma **nova aba** do navegador (`target="_blank"`)
- Mantém segurança com `rel="noopener noreferrer"`

