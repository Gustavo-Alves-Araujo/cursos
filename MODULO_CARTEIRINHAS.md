# 📇 Módulo de Carteirinhas de Aluno

Sistema completo para geração de carteirinhas personalizadas para alunos matriculados em cursos.

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Configuração Inicial](#configuração-inicial)
- [Uso pelo Administrador](#uso-pelo-administrador)
- [Uso pelo Aluno](#uso-pelo-aluno)
- [APIs Disponíveis](#apis-disponíveis)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)

---

## 🎯 Visão Geral

O módulo de carteirinhas permite que:

### **Administradores podem:**
- ✅ Fazer upload de template personalizado de carteirinha por curso
- ✅ Configurar posições de nome, CPF e foto do aluno
- ✅ Visualizar preview em tempo real
- ✅ Definir quantos dias após matrícula a carteirinha fica disponível
- ✅ Personalizar fontes e cores do texto

### **Alunos podem:**
- ✅ Ver todas as carteirinhas dos seus cursos
- ✅ Visualizar contador de dias para carteirinhas indisponíveis
- ✅ Fazer upload de foto de perfil
- ✅ Gerar e baixar carteirinha quando disponível

---

## 🚀 Instalação

### 1. Executar Scripts SQL no Supabase

Execute os seguintes arquivos SQL no **SQL Editor** do Supabase (na ordem):

```bash
# 1. Criar buckets de armazenamento
create-student-cards-buckets.sql

# 2. Criar tabelas no banco
create-student-cards-tables.sql
```

### 2. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` contém:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

⚠️ **IMPORTANTE:** A `SUPABASE_SERVICE_ROLE_KEY` é necessária para uploads.

---

## ⚙️ Configuração Inicial

### Buckets Criados

O script cria 3 buckets no Supabase Storage:

| Bucket | Descrição | Acesso |
|--------|-----------|---------|
| `student-cards-templates` | Templates de carteirinha (admin) | Público |
| `student-profile-photos` | Fotos de perfil dos alunos | Público |
| `student-cards` | Carteirinhas geradas | Público |

### Tabelas Criadas

#### `card_settings`
Configurações de carteirinha por curso.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único |
| `course_id` | UUID | ID do curso (único) |
| `template_url` | TEXT | URL do template |
| `name_position_x/y` | INTEGER | Posição do nome (pixels) |
| `name_font_size` | INTEGER | Tamanho da fonte do nome |
| `name_color` | TEXT | Cor do nome (hex) |
| `cpf_position_x/y` | INTEGER | Posição do CPF (pixels) |
| `cpf_font_size` | INTEGER | Tamanho da fonte do CPF |
| `cpf_color` | TEXT | Cor do CPF (hex) |
| `photo_position_x/y` | INTEGER | Posição da foto (pixels) |
| `photo_width/height` | INTEGER | Dimensões da foto |
| `days_after_enrollment` | INTEGER | Dias para disponibilidade |

#### `student_cards`
Carteirinhas dos alunos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único |
| `user_id` | UUID | ID do aluno |
| `course_id` | UUID | ID do curso |
| `enrollment_date` | TIMESTAMPTZ | Data de matrícula |
| `available_date` | TIMESTAMPTZ | Data de disponibilidade |
| `profile_photo_url` | TEXT | URL da foto do aluno |
| `generated_card_url` | TEXT | URL da carteirinha gerada |
| `is_generated` | BOOLEAN | Se foi gerada |

---

## 👨‍💼 Uso pelo Administrador

### 1. Acessar Configuração de Carteirinha

Vá para: `/admin/courses/[id]/card`

Onde `[id]` é o ID do curso.

### 2. Upload do Template

1. Clique em **"Selecionar Imagem"**
2. Escolha uma imagem PNG ou JPG (máximo 5MB)
3. A imagem será enviada e o preview atualizado

**Dica:** Use uma imagem com boa resolução (recomendado: 800x500px ou similar)

### 3. Configurar Posições

#### **Nome do Aluno**
- **Posição X/Y:** Coordenadas onde o nome será exibido
- **Tamanho da Fonte:** Tamanho em pixels (ex: 24)
- **Cor:** Cor do texto em hexadecimal

#### **CPF do Aluno**
- Mesmas configurações do nome
- Será formatado como: `000.000.000-00`

#### **Foto do Aluno**
- **Posição X/Y:** Canto superior esquerdo da foto
- **Largura/Altura:** Dimensões da foto na carteirinha
- **Preview:** Aparece como retângulo verde no preview

### 4. Configurar Disponibilidade

- **Dias após matrícula:** Número de dias que o aluno deve esperar
- `0` = Disponível imediatamente
- `30` = Disponível 30 dias após matrícula

### 5. Salvar

Clique em **"Salvar Configurações"** para aplicar as alterações.

---

## 🎓 Uso pelo Aluno

### 1. Acessar Carteirinhas

Vá para: `/carteirinhas`

(Link também disponível na sidebar)

### 2. Visualizar Status

**Carteirinhas Disponíveis:**
- ✅ Aparecem em destaque
- Botão para emitir carteirinha

**Carteirinhas Indisponíveis:**
- 🔒 Bloqueadas
- Contador mostrando dias restantes
- Ex: "Disponível em 15 dias"

### 3. Emitir Carteirinha

1. Clique em **"Emitir Carteirinha"**
2. Faça upload de uma foto de perfil (PNG ou JPG, máximo 2MB)
3. Aguarde a geração
4. Baixe a carteirinha gerada

**Foto de Perfil:**
- Recomendado: Foto 3x4 ou similar
- Fundo neutro
- Tamanho máximo: 2MB

---

## 🔌 APIs Disponíveis

### 1. **GET** `/api/card-settings`
Buscar configurações de carteirinha de um curso.

**Query Params:**
- `courseId` (obrigatório): ID do curso

**Resposta:**
```json
{
  "course_id": "uuid",
  "template_url": "https://...",
  "name_position_x": 100,
  "name_position_y": 100,
  ...
}
```

---

### 2. **POST** `/api/card-settings`
Criar ou atualizar configurações de carteirinha.

**Body:**
```json
{
  "course_id": "uuid",
  "template_url": "https://...",
  "name_position_x": 100,
  "name_position_y": 100,
  "name_font_size": 24,
  "name_color": "#000000",
  "cpf_position_x": 100,
  "cpf_position_y": 150,
  "cpf_font_size": 18,
  "cpf_color": "#000000",
  "photo_position_x": 50,
  "photo_position_y": 50,
  "photo_width": 120,
  "photo_height": 150,
  "days_after_enrollment": 0
}
```

**Autorização:** Apenas administradores

---

### 3. **POST** `/api/card-template-upload`
Upload de template de carteirinha.

**Headers:**
- `Authorization: Bearer {access_token}`

**Body (FormData):**
- `file`: Arquivo da imagem (PNG/JPG)
- `courseId`: ID do curso

**Resposta:**
```json
{
  "url": "https://...",
  "path": "course-id/template-123.png",
  "message": "Upload realizado com sucesso"
}
```

---

### 4. **POST** `/api/student-photo-upload`
Upload de foto de perfil do aluno.

**Headers:**
- `Authorization: Bearer {access_token}`

**Body (FormData):**
- `file`: Arquivo da foto (PNG/JPG)

**Resposta:**
```json
{
  "url": "https://...",
  "path": "user-id/profile-123.jpg",
  "message": "Upload realizado com sucesso"
}
```

---

### 5. **POST** `/api/generate-card`
Obter dados para gerar carteirinha.

**Headers:**
- `Authorization: Bearer {access_token}`

**Body:**
```json
{
  "courseId": "uuid",
  "profilePhotoUrl": "https://..."
}
```

**Resposta:**
```json
{
  "message": "Dados prontos para gerar carteirinha",
  "data": {
    "templateUrl": "https://...",
    "profilePhotoUrl": "https://...",
    "name": "João Silva",
    "cpf": "000.000.000-00",
    "positions": {
      "name": { "x": 100, "y": 100, "fontSize": 24, "color": "#000000" },
      "cpf": { "x": 100, "y": 150, "fontSize": 18, "color": "#000000" },
      "photo": { "x": 50, "y": 50, "width": 120, "height": 150 }
    }
  }
}
```

---

### 6. **PUT** `/api/generate-card`
Salvar carteirinha gerada.

**Headers:**
- `Authorization: Bearer {access_token}`

**Body:**
```json
{
  "courseId": "uuid",
  "generatedCardBlob": "data:image/png;base64,..."
}
```

**Resposta:**
```json
{
  "message": "Carteirinha salva com sucesso",
  "url": "https://..."
}
```

---

### 7. **GET** `/api/student-cards`
Listar carteirinhas do aluno autenticado.

**Headers:**
- `Authorization: Bearer {access_token}`

**Resposta:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "course_id": "uuid",
    "enrollment_date": "2025-01-01T00:00:00Z",
    "available_date": "2025-01-31T00:00:00Z",
    "profile_photo_url": "https://...",
    "generated_card_url": "https://...",
    "is_generated": true,
    "courses": {
      "id": "uuid",
      "title": "Curso de React",
      "thumbnail": "https://..."
    },
    "is_available": true,
    "days_remaining": 0
  }
]
```

---

## 📊 Estrutura do Banco de Dados

### Relacionamentos

```
users
  └─ student_cards (1:N)
       └─ courses (N:1)

courses
  └─ card_settings (1:1)
  └─ student_cards (1:N)
```

### Triggers Automáticos

**Criação Automática de Carteirinha:**

Quando um aluno é matriculado em um curso (`INSERT` em `enrollments`), um registro é criado automaticamente em `student_cards` com a data de disponibilidade calculada baseada em `days_after_enrollment`.

---

## 🔒 Segurança (RLS)

### Políticas Implementadas

**card_settings:**
- ✅ Admins: acesso total
- ✅ Alunos: podem ver configurações dos seus cursos

**student_cards:**
- ✅ Admins: podem ver todas
- ✅ Alunos: podem ver, criar e atualizar apenas as suas

**Buckets:**
- ✅ Templates: admin faz upload, todos visualizam
- ✅ Fotos de perfil: aluno faz upload das suas, todos visualizam
- ✅ Carteirinhas: sistema gera, aluno pode deletar as suas

---

## 🎨 Personalização

### Cores e Fontes

Você pode personalizar:
- Cor do texto (nome e CPF)
- Tamanho da fonte
- Posição de todos os elementos

### Exemplo de Template

Crie uma imagem com:
- Logo da instituição
- Design de fundo
- Campos vazios para nome, CPF e foto
- Elementos decorativos

---

## ❓ Troubleshooting

### Problema: Template não aparece no preview
**Solução:** Verifique se a URL do bucket é pública e se o CORS está configurado.

### Problema: Upload falha
**Solução:** Confirme se `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`.

### Problema: Carteirinha não fica disponível
**Solução:** Verifique se o trigger `create_card_on_enrollment` está ativo.

### Problema: Foto não aparece
**Solução:** Certifique-se de que a foto foi feita upload antes de gerar a carteirinha.

---

## 📝 Checklist de Implementação

- [ ] Executar `create-student-cards-buckets.sql`
- [ ] Executar `create-student-cards-tables.sql`
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Adicionar link "Carteirinhas" na sidebar
- [ ] Criar página `/carteirinhas`
- [ ] Criar página `/admin/courses/[id]/card`
- [ ] Testar upload de template
- [ ] Testar upload de foto de perfil
- [ ] Testar geração de carteirinha
- [ ] Verificar disponibilidade baseada em dias

---

## 🚀 Próximos Passos

1. **Backend Canvas:** Implementar geração de carteirinha no backend usando `canvas` ou `sharp`
2. **QR Code:** Adicionar QR code com dados do aluno
3. **Validação:** Sistema de validação de carteirinhas
4. **Notificações:** Avisar aluno quando carteirinha ficar disponível
5. **Múltiplos Templates:** Permitir vários templates por curso

---

**Criado por:** Sistema de Cursos Axo  
**Versão:** 1.0.0  
**Data:** Outubro 2025
