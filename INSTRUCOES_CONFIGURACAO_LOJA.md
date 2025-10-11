# Configuração da Loja Externa

## Passos para Implementar

### 1. Executar o SQL no Supabase
Execute o arquivo `create-store-settings-table.sql` no SQL Editor do Supabase:

```sql
-- Criar tabela para configurações da loja
CREATE TABLE IF NOT EXISTS store_settings (
  id SERIAL PRIMARY KEY,
  store_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão (vazia)
INSERT INTO store_settings (store_url) VALUES (NULL) ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins leiam e atualizem
CREATE POLICY "Admins can manage store settings" ON store_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para permitir que todos leiam (para alunos acessarem a URL)
CREATE POLICY "Everyone can read store settings" ON store_settings
  FOR SELECT USING (true);
```

### 2. Como Funciona

#### Para o Admin:
1. Acesse `/admin/loja` na sidebar do admin
2. Digite a URL da loja externa (ex: https://sua-loja.com.br)
3. Clique em "Salvar Configuração"
4. A URL é salva no banco de dados

#### Para o Aluno:
1. Quando o aluno clica em "Loja" na sidebar
2. O sistema busca a URL configurada no banco
3. Se houver URL configurada, abre em nova aba
4. Se não houver URL, redireciona para `/loja` (página padrão)

### 3. Arquivos Criados/Modificados

- ✅ `create-store-settings-table.sql` - SQL para criar a tabela
- ✅ `src/app/api/store-settings/route.ts` - API para gerenciar configurações
- ✅ `src/app/admin/loja/page.tsx` - Página de configuração do admin
- ✅ `src/components/AdminSidebar.tsx` - Adicionado item "Configurar Loja"
- ✅ `src/components/Sidebar.tsx` - Redirecionamento direto para URL externa
- ✅ `src/app/loja/page.tsx` - Página de fallback (quando não há URL configurada)

### 4. Testando

1. Execute o SQL no Supabase
2. Acesse como admin e configure uma URL de loja
3. Acesse como aluno e clique em "Loja" na sidebar
4. Deve abrir a URL configurada em nova aba

## Funcionalidades Implementadas

- ✅ Configuração de URL da loja pelo admin
- ✅ Redirecionamento automático do aluno
- ✅ Abertura em nova aba
- ✅ Fallback para página padrão se não houver URL
- ✅ Persistência no banco de dados
- ✅ Políticas de segurança (RLS)
