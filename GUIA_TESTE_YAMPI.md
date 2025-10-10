# 🧪 Guia de Testes - Integração Yampi

## ✅ Status Atual da Integração

A integração Yampi está **FUNCIONANDO** e pronta para uso! Aqui está o que foi implementado:

### 🗂️ **Componentes Criados:**
- ✅ Tabela `yampi_integrations` no Supabase
- ✅ Endpoint `/api/webhooks/yampi` para receber webhooks
- ✅ Página `/definir-senha` para definir nova senha
- ✅ Middleware global para verificar `needs_password_reset`
- ✅ Painel admin `/admin/integracoes/yampi` para CRUD
- ✅ API `/api/update-user-metadata` para atualizar metadados

---

## 🚀 Como Testar a Integração

### **Passo 1: Configurar o Banco de Dados**

Execute o SQL no Supabase:
```sql
-- Use o arquivo: create-yampi-integrations-table-fixed.sql
```

### **Passo 2: Configurar Variáveis de Ambiente**

Certifique-se de ter no `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### **Passo 3: Criar uma Integração**

1. **Acesse o painel admin:**
   ```
   http://localhost:3000/admin/integracoes/yampi
   ```

2. **Clique em "Nova Integração"**

3. **Preencha os dados:**
   - **Nome da Entrega:** "Curso de Teste"
   - **ID do Produto:** "12345" (simule um ID da Yampi)
   - **Chave Secreta:** "minha_chave_secreta_123"
   - **Curso Vinculado:** Selecione um curso existente

4. **Salve a integração**

### **Passo 4: Testar o Webhook**

#### **Opção A: Teste Manual com cURL**

```bash
curl -X POST http://localhost:3000/api/webhooks/yampi \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "status": "paid",
      "customer": {
        "email": "teste@exemplo.com",
        "name": "João da Silva"
      },
      "items": [
        {
          "product_id": "12345"
        }
      ]
    }
  }'
```

#### **Opção B: Teste com Postman/Insomnia**

**URL:** `POST http://localhost:3000/api/webhooks/yampi`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "order": {
    "status": "paid",
    "customer": {
      "email": "teste@exemplo.com",
      "name": "João da Silva"
    },
    "items": [
      {
        "product_id": "12345"
      }
    ]
  }
}
```

### **Passo 5: Verificar o Resultado**

Após enviar o webhook, verifique:

1. **Console do servidor** - deve mostrar logs como:
   ```
   Webhook Yampi recebido: {...}
   Integração encontrada: Curso de Teste
   Usuário criado com sucesso: [user-id]
   Matrícula criada/atualizada com sucesso
   ```

2. **Supabase Auth** - deve ter um novo usuário:
   - Email: `teste@exemplo.com`
   - Metadata: `{ name: "João da Silva", needs_password_reset: true }`

3. **Tabela `course_enrollments`** - deve ter uma nova matrícula

### **Passo 6: Testar o Fluxo de Login**

1. **Tente fazer login** com `teste@exemplo.com`
   - Como não há senha definida, o usuário será redirecionado para `/definir-senha`

2. **Defina uma nova senha** na página `/definir-senha`

3. **Verifique se foi redirecionado** para o dashboard principal

---

## 🔍 Verificações Importantes

### **1. Logs do Webhook**
Monitore o console do servidor para verificar se o webhook está sendo processado corretamente.

### **2. Banco de Dados**
Verifique no Supabase:
- Tabela `auth.users` - novo usuário criado
- Tabela `users` - perfil do usuário
- Tabela `course_enrollments` - matrícula no curso
- Tabela `yampi_integrations` - integração configurada

### **3. Middleware**
O middleware deve redirecionar automaticamente usuários com `needs_password_reset: true` para `/definir-senha`.

---

## 🐛 Troubleshooting

### **Problema: Webhook retorna erro 500**
**Solução:**
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Verifique se a tabela `yampi_integrations` existe
- Verifique os logs do servidor

### **Problema: Usuário não é criado**
**Solução:**
- Verifique se o `product_id` no webhook corresponde ao da integração
- Verifique se a integração está ativa
- Verifique se o status é exatamente `"paid"`

### **Problema: Middleware não redireciona**
**Solução:**
- Verifique se o usuário tem `needs_password_reset: true` nos metadados
- Verifique se o middleware está ativo
- Verifique os logs do middleware

### **Problema: Página de definir senha não funciona**
**Solução:**
- Verifique se a API `/api/update-user-metadata` está funcionando
- Verifique se o hook `useUpdateUserMetadata` está sendo usado
- Verifique os logs do navegador

---

## 📊 Testes de Cenários

### **Cenário 1: Usuário Novo**
- Webhook com email novo
- Deve criar usuário + matrícula
- Deve redirecionar para definir senha

### **Cenário 2: Usuário Existente**
- Webhook com email existente
- Deve atualizar metadata `needs_password_reset: true`
- Deve criar/atualizar matrícula

### **Cenário 3: Status Não Pago**
- Webhook com status diferente de `"paid"`
- Deve retornar 200 mas não processar

### **Cenário 4: Produto Não Encontrado**
- Webhook com `product_id` inexistente
- Deve retornar 200 mas não processar

---

## 🎯 Próximos Passos

### **Para Produção:**
1. **Configure o webhook na Yampi** com a URL real
2. **Teste com dados reais** da Yampi
3. **Configure monitoramento** de logs
4. **Teste o fluxo completo** com compra real

### **Melhorias Futuras:**
- [ ] Validação de assinatura do webhook
- [ ] Logs detalhados de webhooks
- [ ] Dashboard de estatísticas
- [ ] Testes automatizados
- [ ] Envio de email de boas-vindas

---

## ✅ Checklist de Testes

- [ ] Tabela `yampi_integrations` criada
- [ ] Integração criada no painel admin
- [ ] Webhook responde com status 200
- [ ] Usuário criado no Supabase Auth
- [ ] Matrícula criada na tabela `course_enrollments`
- [ ] Middleware redireciona para `/definir-senha`
- [ ] Página de definir senha funciona
- [ ] Usuário consegue fazer login após definir senha
- [ ] Metadata `needs_password_reset` é atualizada para `false`

**🎉 Integração Yampi está pronta para uso!**
