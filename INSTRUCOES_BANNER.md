# Configuração do Sistema de Banner

## Instruções de Instalação

### 1. Executar o SQL no Banco de Dados

Execute o arquivo `create-banner-settings-table.sql` no seu banco de dados Supabase para criar a tabela necessária:

```sql
-- O arquivo create-banner-settings-table.sql contém:
-- - Criação da tabela banner_settings
-- - Inserção de configuração padrão
-- - Configuração de RLS (Row Level Security)
-- - Políticas de acesso
-- - Trigger para atualizar updated_at automaticamente
```

### 2. Funcionalidades Implementadas

#### ✅ Página de Configuração do Banner
- **Localização**: `/admin/banner`
- **Acesso**: Apenas administradores
- **Funcionalidades**:
  - Campo de texto para configurar mensagem de aviso
  - Preview em tempo real
  - Contador de caracteres (máximo 500)
  - Botões de salvar e resetar
  - Validação de alterações não salvas

#### ✅ Integração com o Banner do Aluno
- **Componente**: `StudentBanner.tsx`
- **Comportamento**:
  - Se houver mensagem configurada: exibe a mensagem personalizada
  - Se não houver mensagem: exibe "Continue sua jornada de aprendizado"
  - Atualização automática quando as configurações são alteradas

#### ✅ Hook Personalizado
- **Arquivo**: `useBannerSettings.ts`
- **Funcionalidades**:
  - Busca configurações do banco
  - Atualização de configurações
  - Tratamento de erros
  - Estados de loading

#### ✅ Navegação Admin
- **Localização**: Sidebar do admin
- **Item**: "Configurar Banner" com ícone MessageSquare
- **Posição**: Entre "Integrações Yampi" e "Configurações"

### 3. Como Usar

1. **Acesse como Admin**: Faça login com uma conta de administrador
2. **Navegue para Configurar Banner**: Clique em "Configurar Banner" na sidebar
3. **Configure a Mensagem**: Digite a mensagem de aviso desejada
4. **Visualize o Preview**: Veja como ficará no banner do aluno
5. **Salve as Configurações**: Clique em "Salvar Configurações"
6. **Verifique no Banner**: A mensagem aparecerá no banner dos alunos

### 4. Estrutura do Banco de Dados

```sql
banner_settings (
  id UUID PRIMARY KEY,
  welcome_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 5. Políticas de Segurança (RLS)

- **Leitura**: Todos os usuários autenticados podem ler
- **Escrita**: Apenas administradores podem inserir/atualizar
- **Atualização automática**: Campo `updated_at` é atualizado automaticamente

### 6. Arquivos Modificados/Criados

#### Novos Arquivos:
- `create-banner-settings-table.sql` - Script SQL para criar a tabela
- `src/hooks/useBannerSettings.ts` - Hook para gerenciar configurações
- `src/app/admin/banner/page.tsx` - Página de configuração
- `INSTRUCOES_BANNER.md` - Este arquivo de instruções

#### Arquivos Modificados:
- `src/components/AdminSidebar.tsx` - Adicionado item "Configurar Banner"
- `src/components/StudentBanner.tsx` - Integrado com configurações do banner

### 7. Notas Importantes

- A mensagem é opcional (pode ficar vazia)
- Máximo de 500 caracteres
- As alterações são aplicadas imediatamente
- Preview em tempo real na página de configuração
- Sistema de notificações para feedback do usuário
- Interface responsiva e moderna

### 8. Troubleshooting

Se houver problemas:

1. **Verifique se o SQL foi executado**: Confirme que a tabela `banner_settings` existe
2. **Verifique as políticas RLS**: Certifique-se de que as políticas estão ativas
3. **Verifique os logs**: Console do navegador para erros JavaScript
4. **Verifique as permissões**: Confirme que o usuário é administrador

### 9. Próximos Passos (Opcionais)

- Adicionar mais campos de configuração (cor, tamanho, etc.)
- Implementar histórico de alterações
- Adicionar templates de mensagens pré-definidas
- Implementar agendamento de mensagens
