// =====================================================
// TESTE DIRETO DE STORAGE VIA CONSOLE
// =====================================================
// Execute este código no console do navegador (F12)

console.log('🧪 INICIANDO TESTE DIRETO DE STORAGE');

// 1. TESTAR CONEXÃO COM SUPABASE
console.log('1️⃣ Testando conexão com Supabase...');
try {
  const { createClient } = window.supabase || {};
  if (!createClient) {
    console.error('❌ Supabase não encontrado. Verifique se está carregado.');
    throw new Error('Supabase não encontrado');
  }
  console.log('✅ Supabase encontrado');
} catch (error) {
  console.error('❌ Erro na conexão:', error);
}

// 2. TESTAR BUCKET
console.log('2️⃣ Testando bucket certificates...');
async function testBucket() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    console.log('📊 Buckets disponíveis:', data);
    
    const certificatesBucket = data?.find(bucket => bucket.id === 'certificates');
    if (certificatesBucket) {
      console.log('✅ Bucket certificates encontrado:', certificatesBucket);
    } else {
      console.log('❌ Bucket certificates NÃO encontrado');
      console.log('📋 Buckets disponíveis:', data?.map(b => b.id));
    }
  } catch (error) {
    console.error('❌ Erro ao listar buckets:', error);
  }
}

// 3. TESTAR UPLOAD SIMPLES
console.log('3️⃣ Testando upload simples...');
async function testSimpleUpload() {
  try {
    // Criar um blob de teste
    const testContent = 'Teste de upload direto';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log('📊 Blob criado:', {
      size: blob.size,
      type: blob.type
    });
    
    const fileName = `test-direct-${Date.now()}.txt`;
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

// 4. TESTAR POLÍTICAS RLS
console.log('4️⃣ Testando políticas RLS...');
async function testRLSPolicies() {
  try {
    // Tentar inserir diretamente na tabela storage.objects
    const { data, error } = await supabase
      .from('storage.objects')
      .insert({
        bucket_id: 'certificates',
        name: 'test-rls-policy.txt',
        content_type: 'text/plain',
        owner: (await supabase.auth.getUser()).data.user?.id
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

// 5. TESTAR USUÁRIO ATUAL
console.log('5️⃣ Testando usuário atual...');
async function testCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Erro ao obter usuário:', error);
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

// EXECUTAR TODOS OS TESTES
async function runAllTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES...');
  
  await testCurrentUser();
  await testBucket();
  await testRLSPolicies();
  await testSimpleUpload();
  
  console.log('🏁 TESTES CONCLUÍDOS');
}

// Executar testes
runAllTests();

// =====================================================
// FUNÇÕES AUXILIARES PARA TESTE MANUAL
// =====================================================

// Função para testar upload de imagem
window.testImageUpload = async function() {
  console.log('🖼️ Testando upload de imagem...');
  
  try {
    // Criar canvas de teste
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Desenhar algo simples
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('TEST', 25, 50);
    
    // Converter para blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    console.log('📊 Imagem criada:', {
      size: blob.size,
      type: blob.type
    });
    
    // Upload
    const fileName = `test-image-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, blob, {
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
};

// Função para verificar políticas
window.checkPolicies = async function() {
  console.log('🔍 Verificando políticas...');
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');
    
    if (error) {
      console.error('❌ Erro ao verificar políticas:', error);
    } else {
      console.log('📋 Políticas encontradas:', data);
    }
  } catch (error) {
    console.error('❌ Erro na função de políticas:', error);
  }
};

console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testImageUpload() - Testa upload de imagem');
console.log('- checkPolicies() - Verifica políticas RLS');
console.log('- runAllTests() - Executa todos os testes');
