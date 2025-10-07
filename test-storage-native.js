// =====================================================
// TESTE DE STORAGE VIA TERMINAL (SEM DEPENDÊNCIAS)
// =====================================================
// Execute: node test-storage-native.js

console.log('🧪 INICIANDO TESTE NATIVO DE STORAGE');

// 1. VERIFICAR VARIÁVEIS DE AMBIENTE
console.log('1️⃣ Verificando variáveis de ambiente...');

// Carregar variáveis do .env.local
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1];
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1];
      }
    }
  }
} catch (error) {
  console.error('❌ Erro ao ler .env.local:', error.message);
}

console.log('📊 Supabase URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('📊 Supabase Key:', supabaseKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Verifique se o arquivo .env.local existe e contém:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

// 2. TESTAR REQUISIÇÃO HTTP DIRETA
console.log('2️⃣ Testando requisição HTTP direta...');

async function testHttpRequest() {
  try {
    // Testar endpoint de storage
    const url = `${supabaseUrl}/storage/v1/object/certificates/test-http-${Date.now()}.txt`;
    
    console.log('📤 Fazendo requisição para:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'text/plain'
      },
      body: 'Teste de upload via HTTP direto'
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Requisição HTTP funcionou!');
    } else {
      console.log('❌ Requisição HTTP falhou:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Erro na requisição HTTP:', error);
  }
}

// 3. TESTAR LISTAGEM DE BUCKETS
console.log('3️⃣ Testando listagem de buckets...');

async function testListBuckets() {
  try {
    const url = `${supabaseUrl}/storage/v1/bucket`;
    
    console.log('📤 Fazendo requisição para:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Listagem de buckets funcionou!');
      try {
        const data = JSON.parse(responseText);
        console.log('📋 Buckets encontrados:', data);
      } catch (parseError) {
        console.log('⚠️ Resposta não é JSON válido');
      }
    } else {
      console.log('❌ Listagem de buckets falhou:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Erro na listagem de buckets:', error);
  }
}

// 4. TESTAR POLÍTICAS RLS
console.log('4️⃣ Testando políticas RLS...');

async function testRLSPolicies() {
  try {
    const url = `${supabaseUrl}/rest/v1/storage.objects`;
    
    console.log('📤 Fazendo requisição para:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        bucket_id: 'certificates',
        name: 'test-rls-terminal.txt',
        content_type: 'text/plain'
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Inserção RLS funcionou!');
    } else {
      console.log('❌ Inserção RLS falhou:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Erro na função RLS:', error);
  }
}

// 5. TESTAR UPLOAD DE ARQUIVO
console.log('5️⃣ Testando upload de arquivo...');

async function testFileUpload() {
  try {
    const url = `${supabaseUrl}/storage/v1/object/certificates/test-file-${Date.now()}.txt`;
    
    console.log('📤 Fazendo upload para:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'text/plain'
      },
      body: 'Conteúdo do arquivo de teste'
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Upload de arquivo funcionou!');
    } else {
      console.log('❌ Upload de arquivo falhou:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Erro no upload de arquivo:', error);
  }
}

// EXECUTAR TODOS OS TESTES
async function runAllTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES...');
  
  await testListBuckets();
  await testRLSPolicies();
  await testFileUpload();
  await testHttpRequest();
  
  console.log('🏁 TESTES CONCLUÍDOS');
}

// Executar testes
runAllTests().catch(console.error);
