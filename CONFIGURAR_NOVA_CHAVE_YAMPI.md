# 🔐 Configuração da Nova Chave Secreta da Yampi

## 📋 Resumo

Foi adicionada a nova chave secreta `wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se` ao webhook da Yampi para aceitar requisições da sua cliente.

## ✅ O que foi implementado

### 1. **Validação de Chave Secreta**
- O webhook agora valida a chave secreta antes de processar qualquer requisição
- Aceita a nova chave: `wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se`
- Suporta múltiplas chaves secretas (pode adicionar mais no futuro)

### 2. **Formatos de Autenticação Suportados**
O webhook aceita a chave secreta em dois formatos:

#### **Formato 1: Header Authorization**
```http
Authorization: Bearer wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se
```

#### **Formato 2: Header X-Webhook-Secret**
```http
X-Webhook-Secret: wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se
```

## 🚀 Como Configurar na Yampi

### **Passo 1: Acessar Configurações de Webhook**
1. Faça login no painel da Yampi
2. Vá em **Configurações** > **Webhooks**
3. Localize o webhook existente ou crie um novo

### **Passo 2: Configurar Headers**
Adicione um dos headers abaixo na configuração do webhook:

**Opção A - Authorization Header:**
```
Authorization: Bearer wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se
```

**Opção B - X-Webhook-Secret Header:**
```
X-Webhook-Secret: wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se
```

### **Passo 3: URL do Webhook**
```
POST https://seudominio.com/api/webhooks/yampi
```

## 🧪 Como Testar

### **Teste com cURL**
```bash
curl -X POST https://infinitto.vercel.app/api/webhooks/yampi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se" \
  -d '{
    "resource": {
      "status": {
        "data": {
          "alias": "paid"
        }
      },
      "customer": {
        "data": {
          "email": "naaaaaaaa@exemplo.com",
          "name": "Cliente Teste"
        }
      },
      "items": {
        "data": [
          {
            "product_id": "12345"
          }
        ]
      }
    }
  }'
```

### **Teste com Postman/Insomnia**
- **URL:** `POST https://seudominio.com/api/webhooks/yampi`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se
  ```

## 🔒 Segurança

### **Proteções Implementadas**
- ✅ Validação obrigatória de chave secreta
- ✅ Rejeição de requisições sem chave válida
- ✅ Logs de tentativas de acesso inválidas
- ✅ Suporte a múltiplas chaves secretas

### **Resposta de Erro**
Se a chave for inválida ou ausente:
```json
{
  "error": "Chave secreta inválida"
}
```
**Status:** `401 Unauthorized`

## 📝 Logs

O sistema registra:
- ✅ Tentativas de validação de chave
- ❌ Tentativas com chaves inválidas
- 📊 Headers recebidos (parcialmente mascarados)

## 🔄 Adicionar Novas Chaves

Para adicionar mais chaves secretas no futuro, edite o arquivo:
```
src/app/api/webhooks/yampi/route.ts
```

Localize a linha:
```typescript
const validSecrets = [
  'wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se', // Nova chave da cliente
  // Adicione outras chaves aqui se necessário
];
```

E adicione a nova chave:
```typescript
const validSecrets = [
  'wh_xcFWpsMbuU87Rddt7Xo2Kqm6zOk5aJUD305Se', // Nova chave da cliente
  'sua_nova_chave_aqui', // Nova chave adicional
  // Adicione outras chaves aqui se necessário
];
```

## ✅ Status da Implementação

- ✅ Validação de chave secreta implementada
- ✅ Nova chave da cliente adicionada
- ✅ Suporte a múltiplos formatos de header
- ✅ Logs de segurança implementados
- ✅ Documentação criada

**A integração está pronta para uso com a nova chave secreta!**
