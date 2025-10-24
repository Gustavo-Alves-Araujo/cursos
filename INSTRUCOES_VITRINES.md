# 📦 Sistema de Vitrines - Instruções Completas

## Visão Geral

O Sistema de Vitrines permite criar coleções de cursos relacionados que são recomendados aos alunos com base nos cursos que eles já possuem. Este sistema cria recomendações personalizadas e inteligentes.

## 🎯 Como Funciona

### Para o Admin

1. **Criar Vitrines**: O admin cria vitrines e adiciona cursos relacionados a cada uma
2. **Exemplo de Uso**:
   - Vitrine "Avançado em Marketing": Contém o curso "Marketing Digital Básico" + "Marketing Avançado" + "SEO Profissional"
   - Vitrine "Trilha de Programação": Contém "Python Básico" + "Python Avançado" + "Django"

### Para o Aluno

1. **Recomendações Inteligentes**: Na página inicial, na seção "Cursos que você ainda não tem", o aluno verá APENAS cursos que:
   - Fazem parte de vitrines relacionadas aos cursos que ele JÁ possui
   - Ele ainda NÃO tem acesso

2. **Exemplo Prático**:
   - Aluno tem: "Marketing Digital Básico"
   - Este curso faz parte da vitrine "Avançado em Marketing"
   - Logo, o aluno verá: "Marketing Avançado" e "SEO Profissional" (se ele não tiver ainda)

## 📋 Passo a Passo - Configuração Inicial

### 1. Criar as Tabelas no Banco de Dados

Execute o arquivo SQL no Supabase SQL Editor:

```sql
-- Execute o conteúdo do arquivo: create-showcases-tables.sql
```

Este arquivo criará:
- Tabela `showcases`: Armazena as vitrines
- Tabela `showcase_courses`: Relaciona vitrines com cursos
- Políticas RLS apropriadas
- Índices para performance

### 2. Acessar o Painel Admin

1. Faça login como admin
2. No menu lateral, você verá o novo item "Vitrines" (ícone de pacote 📦)
3. Clique em "Vitrines" para gerenciar

## 🎨 Gerenciamento de Vitrines

### Criar uma Nova Vitrine

1. Acesse `/admin/showcases`
2. Clique em "Nova Vitrine"
3. Preencha:
   - **Nome**: Nome da vitrine (ex: "Trilha Python")
   - **Descrição**: Descrição opcional do objetivo da vitrine
4. Clique em "Criar Vitrine"

### Adicionar Cursos à Vitrine

1. Após criar a vitrine, você será redirecionado para a página de edição
2. Na seção "Cursos da Vitrine":
   - Marque os cursos que deseja incluir
   - Apenas cursos publicados podem ser adicionados
3. Clique em "Salvar Alterações"

### Editar uma Vitrine

1. Na listagem de vitrines, clique em "Editar"
2. Você pode:
   - Alterar nome e descrição
   - Adicionar ou remover cursos
   - Ativar/Desativar a vitrine

### Ativar/Desativar Vitrine

- **Vitrine Ativa**: Os cursos da vitrine aparecerão nas recomendações dos alunos
- **Vitrine Inativa**: Os cursos NÃO aparecerão nas recomendações

Para alterar o status:
1. Na listagem, clique em "Ativar" ou "Desativar"
2. Ou edite a vitrine e marque/desmarque "Ativa"

### Deletar uma Vitrine

1. Na listagem, clique em "Deletar"
2. Confirme a ação
3. **Atenção**: Esta ação não pode ser desfeita!

## 💡 Exemplos de Uso

### Exemplo 1: Trilha de Cursos

**Objetivo**: Criar uma progressão de cursos de programação

**Vitrine**: "Trilha Python Completa"
**Cursos**:
- Python para Iniciantes
- Python Intermediário
- Python Avançado
- Django Framework
- APIs com Django REST

**Resultado**: Alunos que possuem "Python para Iniciantes" verão recomendações dos outros cursos da trilha.

### Exemplo 2: Cursos Complementares

**Objetivo**: Recomendar cursos que complementam o conhecimento

**Vitrine**: "Marketing Digital Completo"
**Cursos**:
- Marketing Digital Básico
- SEO e Google Ads
- Social Media Marketing
- E-mail Marketing
- Analytics e Métricas

**Resultado**: Alunos com qualquer curso de marketing verão os demais cursos relacionados.

### Exemplo 3: Upsell Estratégico

**Objetivo**: Oferecer cursos mais avançados

**Vitrine**: "Design Profissional"
**Cursos**:
- Photoshop Básico
- Photoshop Avançado
- Design para Redes Sociais
- Branding e Identidade Visual

**Resultado**: Alunos com Photoshop Básico verão recomendações de cursos mais avançados.

## 🔍 Lógica de Recomendação

### Como o Sistema Decide o que Mostrar

1. **Passo 1**: Sistema identifica todos os cursos que o aluno possui
2. **Passo 2**: Busca todas as vitrines que contêm esses cursos
3. **Passo 3**: Lista todos os cursos dessas vitrines
4. **Passo 4**: Filtra apenas cursos que:
   - O aluno NÃO possui ainda
   - Estão publicados
   - Pertencem a vitrines ATIVAS

### Casos Especiais

#### Aluno sem Cursos
- Não verá nenhuma recomendação
- Mensagem: "Nenhum curso disponível"

#### Aluno com Todos os Cursos das Vitrines
- Verá mensagem de parabéns
- "Você já tem acesso a todos os cursos disponíveis!"

#### Curso em Múltiplas Vitrines
- Aparecerá uma única vez nas recomendações
- Sistema remove duplicatas automaticamente

## 🛠️ Estrutura Técnica

### Tabelas do Banco de Dados

#### `showcases`
```
- id: UUID (PK)
- name: VARCHAR(255) - Nome da vitrine
- description: TEXT - Descrição opcional
- is_active: BOOLEAN - Se está ativa
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `showcase_courses`
```
- id: UUID (PK)
- showcase_id: UUID (FK -> showcases)
- course_id: UUID (FK -> courses)
- position: INTEGER - Ordem dos cursos
- created_at: TIMESTAMP
```

### Arquivos Criados

#### Backend
- `/create-showcases-tables.sql` - Script SQL para criar tabelas

#### Types
- `/src/types/course.ts` - Tipos TypeScript atualizados (Showcase, ShowcaseCourse, ShowcaseWithCourses)

#### Hooks
- `/src/hooks/useShowcases.ts` - Hook para gerenciar vitrines no React

#### Admin Pages
- `/src/app/admin/showcases/page.tsx` - Listagem de vitrines
- `/src/app/admin/showcases/new/page.tsx` - Criar nova vitrine
- `/src/app/admin/showcases/[id]/page.tsx` - Editar vitrine existente

#### Components
- `/src/components/AdminSidebar.tsx` - Atualizado com link para Vitrines

#### Student Pages
- `/src/app/page.tsx` - Página inicial com lógica de recomendação

## 🎯 Boas Práticas

### 1. Nomenclatura de Vitrines
- Use nomes claros e descritivos
- Exemplos bons: "Trilha Python", "Marketing Completo", "Design Avançado"
- Exemplos ruins: "Vitrine 1", "Cursos", "Teste"

### 2. Organização de Cursos
- Agrupe cursos relacionados tematicamente
- Considere progressão (básico → intermediário → avançado)
- Evite vitrines muito grandes (máx. 10 cursos)

### 3. Estratégia de Vitrines
- Crie vitrines para cada área de conhecimento
- Use vitrines para criar trilhas de aprendizado
- Ative/desative conforme campanhas de marketing

### 4. Manutenção
- Revise vitrines periodicamente
- Adicione novos cursos às vitrines relevantes
- Desative vitrines de cursos descontinuados

## 🔒 Segurança (RLS)

O sistema implementa Row Level Security (RLS):

### Admins
- ✅ Podem criar, editar, deletar vitrines
- ✅ Podem adicionar/remover cursos de vitrines
- ✅ Podem ver todas as vitrines (ativas e inativas)

### Estudantes
- ✅ Podem ver apenas vitrines ATIVAS
- ✅ Podem ver apenas cursos de vitrines ativas
- ❌ Não podem criar ou editar vitrines

## 🐛 Troubleshooting

### Cursos não aparecem nas recomendações

**Possíveis causas**:
1. Vitrine está inativa → Ative a vitrine
2. Aluno não possui cursos da vitrine → Adicione o aluno em algum curso da vitrine
3. Curso não está publicado → Publique o curso
4. Curso já pertence ao aluno → Verifique as matrículas

### "Nenhuma vitrine criada"

**Solução**: Crie sua primeira vitrine clicando em "Nova Vitrine"

### Erro ao criar vitrine

**Possíveis causas**:
1. Tabelas não foram criadas → Execute `create-showcases-tables.sql`
2. Permissões RLS incorretas → Re-execute o script SQL
3. Erro de conexão com Supabase → Verifique as credenciais

## 📊 Métricas e Análise

### Métricas Sugeridas para Acompanhar

1. **Conversão por Vitrine**: Quantos alunos compraram cursos recomendados
2. **Vitrines Mais Efetivas**: Quais geram mais conversões
3. **Taxa de Cliques**: % de alunos que clicam nos cursos recomendados
4. **Progressão em Trilhas**: Quantos alunos completam trilhas inteiras

## 🚀 Próximos Passos

Depois de configurar o sistema de vitrines:

1. **Crie suas primeiras vitrines** com cursos relacionados
2. **Teste como aluno** para ver as recomendações
3. **Ajuste as vitrines** baseado no feedback
4. **Monitore conversões** para otimizar

## 💬 Suporte

Se encontrar problemas:
1. Verifique os logs do navegador (Console)
2. Verifique os logs do Supabase
3. Consulte este documento
4. Entre em contato com o suporte técnico

---

**Última atualização**: Outubro 2025
**Versão do Sistema**: 1.0.0

