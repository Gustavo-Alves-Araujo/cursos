// =====================================================
// TESTE DO BUCKET EXISTENTE
// =====================================================
// Execute: node test-bucket-existing.js

console.log('🧪 TESTANDO BUCKET EXISTENTE');

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
  process.exit(1);
}

// 1. VERIFICAR BUCKET EXISTENTE
console.log('1️⃣ Verificando bucket existente...');

async function checkExistingBucket() {
  try {
    const url = `${supabaseUrl}/storage/v1/bucket`;
    
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
      const data = JSON.parse(responseText);
      console.log('📋 Buckets encontrados:', data);
      
      const certificatesBucket = data.find(bucket => bucket.id === 'certificates');
      if (certificatesBucket) {
        console.log('✅ Bucket certificates encontrado:', certificatesBucket);
        console.log('📊 Configurações:', {
          id: certificatesBucket.id,
          name: certificatesBucket.name,
          public: certificatesBucket.public,
          file_size_limit: certificatesBucket.file_size_limit,
          allowed_mime_types: certificatesBucket.allowed_mime_types
        });
      } else {
        console.log('❌ Bucket certificates NÃO encontrado');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar bucket:', error);
  }
}

// 2. TESTAR UPLOAD COM MIME TYPE CORRETO
console.log('2️⃣ Testando upload com MIME type correto...');

async function testCorrectUpload() {
  try {
    const url = `${supabaseUrl}/storage/v1/object/certificates/test-existing-${Date.now()}.png`;
    
    console.log('📤 Fazendo upload para:', url);
    
    // Criar um PNG simples
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'image/png'
      },
      body: pngData
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Upload de PNG funcionou!');
    } else {
      console.log('❌ Upload de PNG falhou:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Erro no upload de PNG:', error);
  }
}

// 3. TESTAR UPLOAD DE TEXTO (SE PERMITIDO)
console.log('3️⃣ Testando upload de texto...');

async function testTextUpload() {
  try {
    const url = `${supabaseUrl}/storage/v1/object/certificates/test-text-${Date.now()}.txt`;
    
    console.log('📤 Fazendo upload para:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'text/plain'
      },
      body: 'Teste de upload de texto'
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Upload de texto funcionou!');
    } else {
      console.log('❌ Upload de texto falhou:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Erro no upload de texto:', error);
  }
}

// EXECUTAR TODOS OS TESTES
async function runAllTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES...');
  
  await checkExistingBucket();
  await testTextUpload();
  await testCorrectUpload();
  
  console.log('🏁 TESTES CONCLUÍDOS');
}

// Executar
runAllTests().catch(console.error);
