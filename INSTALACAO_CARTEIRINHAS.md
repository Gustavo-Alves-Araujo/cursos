# 🚀 Instalação Rápida - Módulo de Carteirinhas

## ✅ Checklist de Instalação

### 1️⃣ Executar Scripts SQL no Supabase

Acesse o **SQL Editor** do Supabase e execute **na ordem**:

```bash
1. create-student-cards-buckets.sql
2. create-student-cards-tables.sql
```

**⚠️ Importante:** Execute um de cada vez e verifique se não há erros.

---

### 2️⃣ Verificar Variáveis de Ambiente

No arquivo `.env.local`, confirme:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ OBRIGATÓRIO para uploads
```

**Como obter a Service Role Key:**
1. Acesse seu projeto no Supabase
2. Settings → API
3. Copie a `service_role` key (secret)
4. Cole no `.env.local`

---

### 3️⃣ Verificar Instalação

Execute no SQL Editor do Supabase:

```sql
-- Verificar buckets criados
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('student-cards-templates', 'student-cards', 'student-profile-photos')
ORDER BY created_at DESC;

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('card_settings', 'student_cards')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('card_settings', 'student_cards')
ORDER BY tablename;
```

**Resultado esperado:**
- ✅ 3 buckets
- ✅ 2 tabelas
- ✅ Várias políticas RLS

---

### 4️⃣ Testar o Módulo

#### Como Administrador:

1. Acesse um curso: `/admin/courses/[id]`
2. Clique no botão **"Carteirinha"** (roxo)
3. Faça upload de um template (imagem PNG/JPG)
4. Configure posições de nome, CPF e foto
5. Defina dias após matrícula (ex: 0 para imediato)
6. Salve as configurações

#### Como Aluno:

1. Matricule-se em um curso (com carteirinha configurada)
2. Acesse: `/carteirinhas`
3. Veja a carteirinha disponível
4. Clique em **"Emitir Carteirinha"**
5. Faça upload de sua foto de perfil
6. Clique em **"Gerar Carteirinha"**
7. Baixe a carteirinha gerada

---

## 🔧 Troubleshooting

### ❌ Erro: "relation 'course_enrollments' does not exist"

**Solução:** A tabela `course_enrollments` precisa existir. Execute:

```sql
-- Verificar se existe
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'course_enrollments';

-- Se não existir, criar (ajustar conforme seu schema)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

---

### ❌ Erro: "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Solução:** Adicione a chave no `.env.local`:

1. Copie a service_role key do Supabase
2. Cole no `.env.local`
3. Reinicie o servidor: `npm run dev`

---

### ❌ Upload de template falha

**Solução:** Verifique:

1. Service Role Key está configurada?
2. Bucket `student-cards-templates` foi criado?
3. Políticas RLS estão ativas?
4. Você está logado como admin?

---

### ❌ Carteirinha não fica disponível

**Solução:** Verifique:

1. Trigger `create_card_on_enrollment` está ativo?
2. Configuração de dias está correta?
3. Aluno está realmente matriculado?

Execute:

```sql
-- Verificar trigger
SELECT tgname FROM pg_trigger 
WHERE tgname = 'create_card_on_enrollment';

-- Verificar carteirinhas do aluno
SELECT * FROM student_cards 
WHERE user_id = 'uuid-do-aluno';
```

---

### ❌ Preview não mostra template

**Solução:**

1. Verifique se o bucket é público
2. Teste a URL do template diretamente no navegador
3. Verifique configuração de CORS no Supabase

---

## 📝 Estrutura de Pastas Criadas

```
src/
├── app/
│   ├── api/
│   │   ├── card-settings/route.ts          # ✅ Criado
│   │   ├── card-template-upload/route.ts   # ✅ Criado
│   │   ├── student-photo-upload/route.ts   # ✅ Criado
│   │   ├── generate-card/route.ts          # ✅ Criado
│   │   └── student-cards/route.ts          # ✅ Criado
│   ├── admin/
│   │   └── courses/
│   │       └── [id]/
│   │           └── card/page.tsx           # ✅ Criado
│   └── carteirinhas/page.tsx               # ✅ Criado
├── components/
│   └── CardGeneratorModal.tsx              # ✅ Criado
└── hooks/
    └── useStudentCards.ts                  # ✅ Criado

Scripts SQL:
├── create-student-cards-buckets.sql        # ✅ Criado
└── create-student-cards-tables.sql         # ✅ Criado (corrigido)

Documentação:
├── MODULO_CARTEIRINHAS.md                  # ✅ Criado (guia completo)
└── INSTALACAO_CARTEIRINHAS.md              # ✅ Este arquivo
```

---

## 🎯 Próximos Passos Recomendados

Após a instalação básica, você pode:

1. **Personalizar o Design:**
   - Ajustar cores e estilos dos componentes
   - Criar templates de carteirinha customizados

2. **Adicionar Notificações:**
   - Avisar aluno quando carteirinha ficar disponível
   - Email quando carteirinha for gerada

3. **QR Code:**
   - Adicionar QR code na carteirinha
   - Sistema de validação de carteirinhas

4. **Relatórios:**
   - Dashboard de carteirinhas emitidas
   - Estatísticas por curso

5. **Validação:**
   - Sistema para validar autenticidade
   - Scanner de QR code

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique a documentação completa: `MODULO_CARTEIRINHAS.md`
2. Revise os logs do console (F12)
3. Verifique os logs do Supabase
4. Execute os scripts de verificação acima

---

**Instalação criada em:** Outubro 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para produção
