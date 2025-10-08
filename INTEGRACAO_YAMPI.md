# 🚀 Integração com Yampi - Guia Completo

## 📋 Visão Geral

Esta integração permite que usuários comprem cursos na Yampi e sejam automaticamente matriculados na plataforma, com um fluxo de definição de senha interno.

## 🗂️ 1. Configuração do Banco de Dados

### Executar o SQL
Execute o arquivo `create-yampi-integrations-table-fixed.sql` no Supabase para criar a tabela necessária:

```sql
-- O arquivo corrigido está em: create-yampi-integrations-table-fixed.sql
```

**⚠️ Importante**: Use o arquivo `-fixed.sql` que corrige a referência da tabela `users` em vez de `profiles`.

### Variáveis de Ambiente Necessárias
Certifique-se de ter estas variáveis no seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

## ⚙️ 2. Endpoint de Webhook

### URL do Webhook
```
POST https://seudominio.com/api/webhooks/yampi
```

### Configuração na Yampi
1. Acesse o painel da Yampi
2. Vá em **Configurações > Webhooks**
3. Adicione a URL do webhook
4. Configure para enviar eventos de **Pagamento Aprovado**

### Estrutura dos Dados Recebidos
O webhook recebe dados no formato:
```json
{
  "order": {
    "status": "paid",
    "customer": {
      "email": "cliente@email.com",
      "name": "Nome do Cliente"
    },
    "items": [
      {
        "product_id": "ID_DO_PRODUTO_NA_YAMPI"
      }
    ]
  }
}
```

## 🔐 3. Fluxo de Autenticação

### Criação Automática de Usuários
1. **Webhook recebido** → Status "paid"
2. **Busca integração** → Por `product_id`
3. **Cria/atualiza usuário** → Com senha aleatória
4. **Define metadata** → `needs_password_reset: true`
5. **Cria matrícula** → No curso vinculado

### Página de Definição de Senha
- **URL**: `/definir-senha`
- **Funcionalidade**: Usuário define nova senha
- **Redirecionamento**: Após sucesso, vai para `/`

## 🔄 4. Middleware de Proteção

O middleware verifica automaticamente:
- ✅ Usuário autenticado
- ✅ Flag `needs_password_reset`
- 🔄 Redireciona para `/definir-senha` se necessário

## 🧠 5. Painel Administrativo

### Acesso
- **URL**: `/admin/integracoes/yampi`
- **Permissão**: Apenas administradores

### Funcionalidades
- ✅ **Listar** todas as integrações
- ✅ **Criar** nova integração
- ✅ **Editar** integração existente
- ✅ **Excluir** integração
- ✅ **Copiar URL** do webhook

### Campos da Integração
- **Nome da Entrega**: Nome descritivo (ex: "Curso Psicologia")
- **ID do Produto**: ID do produto na Yampi
- **Chave Secreta**: Chave para validação do webhook
- **Curso Vinculado**: Curso interno que será atribuído

## 📝 6. Como Usar

### Passo 1: Criar Integração
1. Acesse `/admin/integracoes/yampi`
2. Clique em **"Nova Integração"**
3. Preencha os dados:
   - Nome: "Curso de Psicologia"
   - ID do Produto: "12345" (da Yampi)
   - Chave Secreta: "sua_chave_secreta"
   - Curso: Selecione o curso interno

### Passo 2: Configurar na Yampi
1. Copie a URL do webhook: `https://seudominio.com/api/webhooks/yampi`
2. Configure na Yampi com a chave secreta definida

### Passo 3: Testar
1. Faça uma compra de teste na Yampi
2. Verifique se o usuário foi criado
3. Teste o login e definição de senha

## 🔧 7. Estrutura de Arquivos Criados

```
src/
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── yampi/
│   │           └── route.ts          # Endpoint do webhook
│   ├── admin/
│   │   └── integracoes/
│   │       └── yampi/
│   │           └── page.tsx          # Painel administrativo
│   └── definir-senha/
│       └── page.tsx                  # Página de definição de senha
├── components/
│   └── AdminSidebar.tsx              # Atualizado com link Yampi
└── middleware.ts                     # Middleware de proteção
```

## 🚨 8. Troubleshooting

### Problemas Comuns

**Webhook não está funcionando:**
- ✅ Verifique se a URL está correta
- ✅ Confirme se a chave secreta está igual na Yampi
- ✅ Verifique os logs do Supabase

**Usuário não está sendo criado:**
- ✅ Verifique se o `product_id` está correto
- ✅ Confirme se a integração existe no banco
- ✅ Verifique se o status é "paid"

**Middleware redirecionando incorretamente:**
- ✅ Verifique se o usuário tem `needs_password_reset: true`
- ✅ Confirme se a página `/definir-senha` existe

### Logs Importantes
```javascript
// No endpoint do webhook
console.log('Webhook Yampi recebido:', JSON.stringify(body, null, 2));
console.log('Integração encontrada:', integration.name);
console.log('Usuário criado com sucesso:', newUser.user?.id);
```

## 🎯 9. Próximos Passos

### Melhorias Futuras
- [ ] Envio de email de boas-vindas
- [ ] Logs detalhados de webhooks
- [ ] Dashboard de estatísticas
- [ ] Testes automatizados
- [ ] Validação de assinatura do webhook

### Monitoramento
- [ ] Configurar alertas para falhas
- [ ] Dashboard de webhooks recebidos
- [ ] Relatórios de conversão

---

## ✅ Checklist de Implementação

- [x] Tabela `yampi_integrations` criada
- [x] Endpoint `/api/webhooks/yampi` funcionando
- [x] Página `/definir-senha` criada
- [x] Middleware de proteção ativo
- [x] Painel administrativo `/admin/integracoes/yampi`
- [x] Integração com sidebar administrativo
- [x] Documentação completa

**🎉 Integração Yampi implementada com sucesso!**
