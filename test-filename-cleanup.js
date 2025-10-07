// Teste para verificar se a limpeza do nome está funcionando
// Execute este código no console do navegador

function cleanStudentName(studentName) {
  return studentName
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9]/g, '_') // Remove caracteres especiais
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, '') // Remove underscores do início/fim
    .toLowerCase(); // Converter para minúsculas
}

// Teste com diferentes nomes
const testNames = [
  'Usuário',
  'João Silva',
  'Maria José',
  'José da Silva',
  'Ana-Maria',
  'José@Silva#123'
];

console.log('🧪 Teste de limpeza de nomes:');
testNames.forEach(name => {
  const cleaned = cleanStudentName(name);
  console.log(`"${name}" → "${cleaned}"`);
});

// Teste específico com o nome que está causando problema
const problematicName = 'Usuário';
const cleaned = cleanStudentName(problematicName);
console.log(`\n🎯 Nome problemático: "${problematicName}" → "${cleaned}"`);

// Verificar se o resultado é válido para Supabase Storage
const isValid = /^[a-z0-9_]+$/.test(cleaned);
console.log(`✅ Nome é válido para Supabase: ${isValid}`);
