# 🔧 CORRIGIR ERRO: "new row violates row-level security policy"

## ❌ Erro Atual
```
Erro ao fazer upload do arquivo: new row violates row-level security policy
```

## ✅ Solução Rápida (5 minutos)

### Passo 1: Acesse o Supabase Dashboard
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Execute o Script SQL
1. Clique em **"New query"** (botão verde no canto superior direito)
2. Abra o arquivo `supabase-fix-storage-rls.sql` no seu editor
3. **Copie TODO o conteúdo do arquivo**
4. **Cole** no SQL Editor do Supabase
5. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

### Passo 3: Verifique o Resultado
Você deve ver algo como:
```
✓ 2 rows returned
✓ Bucket configurado: course-documents
✓ 4 políticas criadas
```

### Passo 4: Teste o Upload
1. Volte para o seu site em produção
2. Tente fazer upload de um documento novamente
3. ✅ Deve funcionar!

---

## 🔍 O que o Script Faz

1. ✅ Remove políticas antigas (se existirem)
2. ✅ Cria/atualiza o bucket `course-documents`
3. ✅ Configura limite de 50MB
4. ✅ Define tipos de arquivo permitidos (PDF, DOC, DOCX, TXT)
5. ✅ Cria 4 políticas RLS:
   - Upload para usuários autenticados
   - Leitura pública
   - Atualização para usuários autenticados
   - Deleção para usuários autenticados

---

## ⚠️ Troubleshooting

### Se ainda der erro:

#### 1. Verificar se o bucket é público
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'course-documents';
```
- `public` deve ser `true`

#### 2. Verificar políticas
```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%documento%';
```
- Deve retornar 4 políticas

#### 3. Verificar autenticação
- Faça logout e login novamente no seu site
- Verifique se você está autenticado como admin

---

## 🎯 Resultado Final

Após executar o script:
- ✅ Upload de até 50MB funcionando
- ✅ Documentos acessíveis publicamente
- ✅ Apenas admins podem fazer upload/editar/deletar
- ✅ Funciona em localhost E produção

---

## 📞 Ainda com problemas?

Se continuar com erro:
1. Tire um print da mensagem de erro
2. Verifique o console do navegador (F12)
3. Verifique se você está logado no Supabase
4. Confirme que executou TODO o script SQL

