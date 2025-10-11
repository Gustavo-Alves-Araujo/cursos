# 📋 Implementação de CPF para Usuários

## ✅ Resumo das Implementações

Foi adicionada a funcionalidade de CPF para usuários em todo o sistema, incluindo integração com a Yampi e formulários de criação manual.

---

## 🗂️ 1. Banco de Dados

### Script SQL Criado
- **Arquivo**: `add-cpf-column-users.sql`
- **Função**: Adiciona coluna CPF na tabela users
- **Execução**: Execute no SQL Editor do Supabase

```sql
-- Adiciona coluna CPF
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Cria índice para busca
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

-- Atualiza função handle_new_user para incluir CPF
```

---

## 🔧 2. Tipos TypeScript

### Arquivos Modificados:
- `src/types/auth.ts` - Adicionado `cpf?: string` nos tipos User e LoggedInUser
- `src/lib/supabase.ts` - Atualizado interface Database para incluir CPF

### Mudanças:
```typescript
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string; // ✅ NOVO
  created_at: string;
  updated_at: string;
};
```

---

## 🔗 3. Integração Yampi

### Arquivo Modificado:
- `src/app/api/webhooks/yampi/route.ts`

### Funcionalidades Adicionadas:

#### ✅ Extração de CPF do Webhook
```typescript
interface YampiCustomer {
  data: {
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    cpf?: string;        // ✅ NOVO
    document?: string;   // ✅ NOVO (alternativo)
  };
}
```

#### ✅ Formatação Automática de CPF
```typescript
function formatCPF(cpf: string): string {
  // Remove caracteres especiais
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Formata: 000.000.000-00
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
```

#### ✅ Atualização de Usuários Existentes
- CPF é extraído do webhook da Yampi
- Formatado automaticamente
- Salvo nos metadados do usuário
- Atualizado na tabela users

#### ✅ Criação de Novos Usuários
- CPF incluído nos metadados
- Salvo na tabela users
- Logs detalhados para debug

---

## 👥 4. Criação Manual de Usuários

### Arquivos Modificados:
- `src/components/admin/CreateStudentForm.tsx`
- `src/app/api/admin/create-user/route.ts`

### Funcionalidades:

#### ✅ Formulário de Criação
- Campo CPF adicionado (opcional)
- Placeholder com formato: `000.000.000-00`
- Validação e estilização consistente

#### ✅ API de Criação
- Aceita parâmetro `cpf` no request
- Salva CPF nos metadados do usuário
- Atualiza tabela users com CPF

---

## 🔐 5. Contexto de Autenticação

### Arquivo Modificado:
- `src/contexts/AuthContext.tsx`

### Mudanças:
- Função `loadUserProfile` atualizada para incluir CPF
- CPF disponível no contexto global da aplicação

---

## 📊 6. Como Funciona

### Fluxo da Integração Yampi:

1. **Webhook Recebido** → Yampi envia dados da compra
2. **Extração de CPF** → Busca em `customer.data.cpf` ou `customer.data.document`
3. **Formatação** → Aplica máscara `000.000.000-00`
4. **Usuário Existente** → Atualiza metadados e tabela users
5. **Usuário Novo** → Cria com CPF nos metadados e tabela users
6. **Matrícula** → Cria matrícula no curso vinculado

### Fluxo de Criação Manual:

1. **Admin Acessa** → `/admin/students`
2. **Clica "Adicionar Aluno"** → Abre formulário
3. **Preenche Dados** → Nome, email, CPF (opcional), tipo
4. **Submete** → API cria usuário com senha temporária
5. **CPF Salvo** → Nos metadados e tabela users

---

## 🧪 7. Como Testar

### Teste da Integração Yampi:

```bash
curl -X POST http://localhost:3000/api/webhooks/yampi \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "status": "paid",
      "customer": {
        "email": "teste@exemplo.com",
        "name": "João da Silva",
        "cpf": "12345678901"
      },
      "items": [
        {
          "product_id": "12345"
        }
      ]
    }
  }'
```

### Teste de Criação Manual:

1. Acesse `/admin/students`
2. Clique em "Adicionar Aluno"
3. Preencha: Nome, Email, CPF (ex: `123.456.789-01`)
4. Clique em "Criar Usuário"
5. Verifique se CPF foi salvo

---

## 📝 8. Logs e Debug

### Logs Implementados:
- Extração de CPF do webhook
- Formatação aplicada
- Atualização na tabela users
- Erros de validação

### Exemplo de Log:
```
Dados do customer: {
  email: "cliente@email.com",
  name: "João da Silva",
  cpf: "12345678901",
  formattedCPF: "123.456.789-01"
}
CPF atualizado na tabela users: 123.456.789-01
```

---

## ⚠️ 9. Considerações Importantes

### Validação de CPF:
- Sistema aceita CPF em qualquer formato
- Formatação automática para `000.000.000-00`
- Não há validação de dígitos verificadores (pode ser adicionada futuramente)

### Compatibilidade:
- CPF é opcional em todos os formulários
- Sistema funciona normalmente sem CPF
- Usuários existentes não são afetados

### Segurança:
- CPF é armazenado nos metadados do usuário
- Acessível apenas via Service Role Key
- Não exposto em APIs públicas

---

## 🚀 10. Próximos Passos (Opcionais)

### Melhorias Futuras:
1. **Validação de CPF** → Implementar validação de dígitos verificadores
2. **Máscara no Frontend** → Aplicar máscara em tempo real nos inputs
3. **Busca por CPF** → Adicionar filtro de busca por CPF no admin
4. **Relatórios** → Incluir CPF em relatórios de usuários
5. **Exportação** → Incluir CPF em exports de dados

---

## ✅ Status Final

- ✅ Coluna CPF adicionada ao banco
- ✅ Tipos TypeScript atualizados
- ✅ Integração Yampi modificada
- ✅ Formulários de criação atualizados
- ✅ Contexto de autenticação atualizado
- ✅ Logs e debug implementados
- ✅ Testes funcionais realizados

**🎉 Implementação concluída com sucesso!**
