# Sistema de Certificados Personalizados

Este documento descreve o sistema de geração de certificados personalizados implementado na plataforma de cursos.

## Funcionalidades

### Para Administradores

1. **Gestão de Templates de Certificados**
   - Upload de imagens de fundo personalizadas (.jpg/.png)
   - Configuração de posições de texto (nome do estudante e data)
   - Configuração de estilos (fonte, cor, tamanho, alinhamento)
   - Visualização em tempo real das configurações

2. **Interface de Administração**
   - Acesso via `/admin/certificates`
   - Aba "Templates" para gerenciar templates
   - Aba "Certificados" para visualizar certificados emitidos
   - Upload e configuração de templates por curso

### Para Estudantes

1. **Visualização de Certificados**
   - Lista de certificados conquistados
   - Visualização em modal com preview da imagem
   - Download direto do certificado (.png)

2. **Emissão Automática**
   - Certificados são gerados automaticamente ao completar um curso
   - Verificação de duplicatas (um certificado por curso)
   - Notificações de sucesso

## Configuração do Banco de Dados

### 1. Executar Scripts SQL

```bash
# Configurar tabelas de certificados
psql -f setup-certificates-database.sql

# Configurar storage buckets
psql -f setup-certificate-storage.sql
```

### 2. Configurar Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Estrutura do Sistema

### Tipos TypeScript

```typescript
// src/types/certificate.ts
- CertificateTemplate: Template de certificado com configurações
- Certificate: Certificado gerado para um usuário
- CertificateGenerationData: Dados para geração
- CertificateConfig: Configurações padrão
```

### Serviços

```typescript
// src/lib/certificateService.ts
- createTemplate(): Criar template para um curso
- getTemplateByCourseId(): Buscar template de um curso
- updateTemplate(): Atualizar template existente
- generateCertificate(): Gerar certificado para usuário
- getUserCertificates(): Listar certificados do usuário
- hasCertificate(): Verificar se usuário já tem certificado
```

### Componentes

```typescript
// src/components/admin/CertificateTemplateForm.tsx
- Formulário para criar/editar templates
- Upload de imagem de fundo
- Configuração de posições e estilos

// src/components/CertificateViewer.tsx
- Visualização de certificados para estudantes
- Preview em modal
- Download direto
```

## Como Usar

### 1. Configurar Template (Admin)

1. Acesse `/admin/certificates`
2. Clique na aba "Templates"
3. Clique em "Novo Template"
4. Selecione o curso
5. Faça upload da imagem de fundo
6. Configure as posições do texto:
   - Nome do estudante (x, y, fonte, cor, alinhamento)
   - Data de conclusão (x, y, fonte, cor, alinhamento)
7. Salve o template

### 2. Gerar Certificado (Estudante)

1. Complete um curso
2. Acesse `/certificados`
3. Clique em "Emitir" no curso concluído
4. O certificado será gerado automaticamente
5. Visualize e baixe o certificado

## Configurações de Texto

### Posicionamento
- **X, Y**: Coordenadas em pixels (ex: 400, 300)
- **Alinhamento**: left, center, right

### Estilo
- **Fonte**: Nome da fonte (ex: Arial, Times New Roman)
- **Tamanho**: Tamanho em pixels (ex: 32, 20)
- **Cor**: Código hexadecimal (ex: #000000, #666666)

### Exemplo de Configuração

```json
{
  "studentName": {
    "x": 400,
    "y": 300,
    "fontSize": 32,
    "fontFamily": "Arial",
    "color": "#000000",
    "textAlign": "center"
  },
  "completionDate": {
    "x": 400,
    "y": 400,
    "fontSize": 20,
    "fontFamily": "Arial",
    "color": "#666666",
    "textAlign": "center"
  }
}
```

## Tecnologias Utilizadas

- **Canvas API**: Geração de imagens
- **Supabase Storage**: Armazenamento de arquivos
- **React**: Interface de usuário
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização

## Limitações

- Imagens de fundo limitadas a 5MB
- Certificados limitados a 10MB
- Formatos suportados: JPG, PNG
- Geração client-side (requer JavaScript)

## Troubleshooting

### Erro: "Template não encontrado"
- Verifique se o template foi criado para o curso
- Confirme se o curso ID está correto

### Erro: "Erro ao carregar imagem de fundo"
- Verifique se a URL da imagem está acessível
- Confirme se o arquivo está no bucket correto

### Erro: "Erro no upload"
- Verifique as permissões do bucket
- Confirme se o arquivo não excede o limite de tamanho

## Próximos Passos

1. **Melhorias Futuras**
   - Suporte a PDF
   - Templates pré-definidos
   - Assinatura digital
   - Validação de certificados

2. **Otimizações**
   - Geração server-side
   - Cache de certificados
   - Compressão de imagens
