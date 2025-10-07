// =====================================================
// TESTE DE STORAGE VIA TERMINAL
// =====================================================
// Execute: node test-storage-terminal.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 INICIANDO TESTE DE STORAGE VIA TERMINAL');

// 1. VERIFICAR VARIÁVEIS DE AMBIENTE
console.log('1️⃣ Verificando variáveis de ambiente...');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📊 Supabase URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('📊 Supabase Key:', supabaseKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Verifique se o arquivo .env.local existe e contém:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

// 2. CRIAR CLIENTE SUPABASE
console.log('2️⃣ Criando cliente Supabase...');
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Cliente Supabase criado com sucesso');
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error);
  process.exit(1);
}

// 3. TESTAR CONEXÃO
console.log('3️⃣ Testando conexão...');
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('⚠️ Erro na conexão (esperado se não autenticado):', error.message);
    } else {
      console.log('✅ Conexão funcionando');
    }
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

// 4. TESTAR BUCKETS
console.log('4️⃣ Testando buckets...');
async function testBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Erro ao listar buckets:', error);
    } else {
      console.log('✅ Buckets listados:', data);
      const certificatesBucket = data?.find(bucket => bucket.id === 'certificates');
      if (certificatesBucket) {
        console.log('✅ Bucket certificates encontrado:', certificatesBucket);
      } else {
        console.log('❌ Bucket certificates NÃO encontrado');
      }
    }
  } catch (error) {
    console.error('❌ Erro na função de buckets:', error);
  }
}

// 5. TESTAR UPLOAD SIMPLES
console.log('5️⃣ Testando upload simples...');
async function testSimpleUpload() {
  try {
    // Criar um blob de teste
    const testContent = 'Teste de upload via terminal';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log('📊 Blob criado:', {
      size: blob.size,
      type: blob.type
    });
    
    const fileName = `test-terminal-${Date.now()}.txt`;
    console.log('📁 Nome do arquivo:', fileName);
    
    // Tentar upload
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, blob, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Erro no upload:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
    } else {
      console.log('✅ Upload realizado com sucesso:', data);
    }
  } catch (error) {
    console.error('❌ Erro na função de upload:', error);
  }
}

// 6. TESTAR POLÍTICAS RLS
console.log('6️⃣ Testando políticas RLS...');
async function testRLSPolicies() {
  try {
    // Tentar inserir diretamente na tabela storage.objects
    const { data, error } = await supabase
      .from('storage.objects')
      .insert({
        bucket_id: 'certificates',
        name: 'test-rls-terminal.txt',
        content_type: 'text/plain'
      });
    
    if (error) {
      console.error('❌ Erro RLS:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem:', error.message);
    } else {
      console.log('✅ Inserção RLS funcionou:', data);
    }
  } catch (error) {
    console.error('❌ Erro na função RLS:', error);
  }
}

// 7. TESTAR USUÁRIO ATUAL
console.log('7️⃣ Testando usuário atual...');
async function testCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('⚠️ Usuário não autenticado (esperado):', error.message);
    } else {
      console.log('👤 Usuário atual:', {
        id: user?.id,
        email: user?.email,
        role: user?.user_metadata?.role || 'N/A'
      });
    }
  } catch (error) {
    console.error('❌ Erro na função de usuário:', error);
  }
}

// 8. TESTAR UPLOAD DE IMAGEM
console.log('8️⃣ Testando upload de imagem...');
async function testImageUpload() {
  try {
    // Criar canvas de teste
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    // Desenhar algo simples
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('TEST', 25, 50);
    
    // Converter para buffer
    const buffer = canvas.toBuffer('image/png');
    
    console.log('📊 Imagem criada:', {
      size: buffer.length,
      type: 'image/png'
    });
    
    // Upload
    const fileName = `test-image-terminal-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Erro no upload da imagem:', error);
    } else {
      console.log('✅ Upload da imagem realizado:', data);
    }
  } catch (error) {
    console.error('❌ Erro na função de imagem:', error);
  }
}

// EXECUTAR TODOS OS TESTES
async function runAllTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES...');
  
  await testConnection();
  await testCurrentUser();
  await testBuckets();
  await testRLSPolicies();
  await testSimpleUpload();
  await testImageUpload();
  
  console.log('🏁 TESTES CONCLUÍDOS');
}

// Executar testes
runAllTests().catch(console.error);
