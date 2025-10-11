# 📧 Personalização de Templates de Email no Supabase

## 🎯 **Onde Personalizar os Templates**

### **1. Acesse o Dashboard do Supabase**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto

### **2. Navegue para Authentication**
1. No menu lateral, clique em **"Authentication"**
2. Clique na aba **"Email Templates"**

---

## 📋 **Templates Disponíveis**

### **Templates que Podem ser Personalizados:**
- ✅ **Confirm signup** - Confirmação de cadastro
- ✅ **Reset password** - Reset de senha (nosso caso)
- ✅ **Magic Link** - Link mágico
- ✅ **Change email address** - Mudança de email
- ✅ **Invite user** - Convite de usuário

---

## 🔧 **Personalizando o Template de Reset de Senha**

### **1. Localizar o Template**
1. Em **Authentication > Email Templates**
2. Clique em **"Reset password"**

### **2. Campos Editáveis**

#### **Subject (Assunto):**
```
Redefinir sua senha - [Nome da sua empresa]
```

#### **Body (Corpo do Email):**
```html
<h2>Redefinir sua senha</h2>
<p>Olá!</p>
<p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            display: inline-block;">
    Redefinir Senha
  </a>
</div>

<p>Se você não solicitou esta redefinição, pode ignorar este email.</p>

<p>Este link expira em 1 hora por motivos de segurança.</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
<p style="color: #666; font-size: 12px;">
  Este email foi enviado automaticamente. Não responda a esta mensagem.
</p>
```

---

## 🎨 **Variáveis Disponíveis**

### **Variáveis do Supabase:**
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Token }}` - Token de confirmação
- `{{ .Email }}` - Email do usuário
- `{{ .SiteURL }}` - URL do seu site

### **Exemplo com Variáveis:**
```html
<p>Olá!</p>
<p>Você solicitou a redefinição da sua senha para a conta <strong>{{ .Email }}</strong>.</p>
<p>Clique no link abaixo para redefinir sua senha:</p>
<a href="{{ .ConfirmationURL }}">Redefinir Senha</a>
```

---

## 🎨 **Exemplo de Template Personalizado Completo**

### **Template Profissional:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; margin: 0;">[Nome da sua Empresa]</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Plataforma de Cursos Online</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">🔐 Redefinir sua Senha</h2>
        
        <p>Olá!</p>
        
        <p>Você solicitou a redefinição da sua senha. Para continuar, clique no botão abaixo:</p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                ✨ Redefinir Senha
            </a>
        </div>
        
        <p><strong>⚠️ Importante:</strong></p>
        <ul>
            <li>Este link expira em <strong>1 hora</strong></li>
            <li>Use uma senha forte com pelo menos 6 caracteres</li>
            <li>Se você não solicitou esta redefinição, ignore este email</li>
        </ul>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>Este email foi enviado automaticamente pelo sistema.</p>
        <p>Se você tiver dúvidas, entre em contato conosco.</p>
        
        <div style="margin-top: 20px;">
            <a href="https://seudominio.com" style="color: #667eea; text-decoration: none;">[Nome da Empresa]</a> | 
            <a href="https://seudominio.com/contato" style="color: #667eea; text-decoration: none;">Contato</a> | 
            <a href="https://seudominio.com/privacidade" style="color: #667eea; text-decoration: none;">Privacidade</a>
        </div>
    </div>
    
</body>
</html>
```

---

## ⚙️ **Configurações Adicionais**

### **1. Configurar URL de Redirecionamento**
1. Em **Authentication > URL Configuration**
2. Adicione sua URL de produção:
   ```
   https://seudominio.com/redefinir-senha
   ```

### **2. Configurar Domínio de Email**
1. Em **Authentication > Settings**
2. Configure o domínio personalizado (opcional)
3. Configure o remetente personalizado

### **3. Configurar Expiração**
1. Em **Authentication > Settings**
2. Ajuste o tempo de expiração do link:
   - **Default**: 1 hora
   - **Mínimo**: 5 minutos
   - **Máximo**: 24 horas

---

## 🧪 **Testando o Template**

### **1. Teste Local:**
1. Use o template personalizado
2. Solicite reset de senha
3. Verifique o email recebido
4. Teste o link de redefinição

### **2. Teste em Produção:**
1. Configure as URLs de produção
2. Teste com email real
3. Verifique se o link funciona
4. Teste a expiração

---

## 🎨 **Dicas de Design**

### **Cores Recomendadas:**
- **Primária**: `#667eea` (azul)
- **Secundária**: `#764ba2` (roxo)
- **Sucesso**: `#10b981` (verde)
- **Erro**: `#ef4444` (vermelho)
- **Texto**: `#333333` (cinza escuro)

### **Fontes:**
- **Títulos**: Arial, Helvetica, sans-serif
- **Texto**: Arial, sans-serif
- **Código**: 'Courier New', monospace

### **Responsividade:**
```css
@media only screen and (max-width: 600px) {
    .container {
        width: 100% !important;
        padding: 10px !important;
    }
    
    .button {
        width: 100% !important;
        display: block !important;
    }
}
```

---

## 🔧 **Solução para o Erro de Token**

### **Problemas Comuns:**

#### **1. Link Expirado:**
- **Causa**: Link usado após 1 hora
- **Solução**: Solicitar novo link
- **Prevenção**: Usar link rapidamente

#### **2. Link Já Usado:**
- **Causa**: Link usado anteriormente
- **Solução**: Solicitar novo link
- **Prevenção**: Links são de uso único

#### **3. URL de Redirecionamento Incorreta:**
- **Causa**: URL não configurada no Supabase
- **Solução**: Configurar em Authentication > URL Configuration

### **Configuração Correta:**
```
Site URL: https://seudominio.com
Redirect URLs: 
- https://seudominio.com/redefinir-senha
- http://localhost:3000/redefinir-senha (para desenvolvimento)
```

---

## 📱 **Template Mobile-Friendly**

### **Versão Responsiva:**
```html
<div style="max-width: 100%; padding: 20px; box-sizing: border-box;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 24px; margin-top: 0;">🔐 Redefinir Senha</h2>
        
        <p style="font-size: 16px; line-height: 1.5;">Olá!</p>
        <p style="font-size: 16px; line-height: 1.5;">Você solicitou a redefinição da sua senha.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 25px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;
                      width: 100%;
                      max-width: 200px;
                      box-sizing: border-box;">
                Redefinir Senha
            </a>
        </div>
    </div>
</div>
```

---

## ✅ **Checklist de Personalização**

### **Antes de Publicar:**
- [ ] Template testado em diferentes clientes de email
- [ ] Links funcionando corretamente
- [ ] Design responsivo para mobile
- [ ] URLs de redirecionamento configuradas
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] Tempo de expiração ajustado
- [ ] Teste com email real realizado

### **Pós-Publicação:**
- [ ] Monitorar logs de email
- [ ] Verificar taxa de abertura
- [ ] Ajustar template baseado no feedback
- [ ] Testar periodicamente

---

## 🚀 **Resultado Final**

Com essas personalizações, você terá:
- ✅ **Emails profissionais** com sua marca
- ✅ **Design responsivo** para todos os dispositivos
- ✅ **Links funcionais** e seguros
- ✅ **Experiência consistente** com seu app
- ✅ **Melhor taxa de conversão** de resets de senha

**🎉 Templates personalizados e funcionais!**
