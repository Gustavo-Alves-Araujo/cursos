# 🧪 EXECUTAR TESTES VIA TERMINAL

## 🚨 **Problema**
O console do navegador não consegue acessar o objeto `supabase` porque não está no contexto correto.

## 🔧 **Solução: Testes via Terminal**

### **Scripts Criados:**
1. **`test-storage-native.js`** - Teste sem dependências (RECOMENDADO)
2. **`test-storage-simple.js`** - Teste com node-fetch
3. **`test-storage-terminal.js`** - Teste completo com dependências

## 📋 **Passos para Executar**

### **Opção 1: Teste Nativo (Sem Dependências)**
```bash
# Execute no terminal
node test-storage-native.js
```

### **Opção 2: Teste com node-fetch**
```bash
# Instalar dependência
npm install node-fetch@2

# Executar teste
node test-storage-simple.js
```

### **Opção 3: Teste Completo**
```bash
# Instalar dependências
npm install @supabase/supabase-js dotenv canvas

# Executar teste
node test-storage-terminal.js
```

## 🎯 **O que os Testes Fazem**

### **1. Verificar Variáveis de Ambiente**
- ✅ Lê `.env.local`
- ✅ Verifica `NEXT_PUBLIC_SUPABASE_URL`
- ✅ Verifica `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **2. Testar Listagem de Buckets**
- ✅ Faz requisição para `/storage/v1/bucket`
- ✅ Verifica se bucket `certificates` existe

### **3. Testar Políticas RLS**
- ✅ Tenta inserir na tabela `storage.objects`
- ✅ Verifica se RLS está bloqueando

### **4. Testar Upload de Arquivo**
- ✅ Tenta fazer upload via HTTP direto
- ✅ Verifica se upload funciona

## 🔍 **Resultados Esperados**

### **✅ Sucesso:**
```
✅ Listagem de buckets funcionou!
✅ Upload de arquivo funcionou!
```

### **❌ Erro RLS:**
```
❌ Inserção RLS falhou: 400 new row violates row-level security policy
```

### **❌ Bucket não existe:**
```
❌ Listagem de buckets falhou: 404
```

## 📞 **Se Ainda Não Funcionar**

Execute o teste e me envie os resultados:
1. **Execute** `node test-storage-native.js`
2. **Copie** todos os logs
3. **Me envie** os resultados

## 🎉 **Teste Agora**

```bash
# Execute no terminal
node test-storage-native.js
```

**Deve mostrar exatamente onde está o problema!**
