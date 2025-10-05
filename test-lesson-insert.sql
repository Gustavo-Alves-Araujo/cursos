-- =====================================================
-- TESTE: Inserção de aula após correção RLS
-- =====================================================
-- Execute este script para testar se a criação de aulas está funcionando

-- 1. Verificar se há módulos disponíveis para teste
SELECT 'Verificando módulos disponíveis:' as status;
SELECT id, title, course_id FROM modules LIMIT 5;

-- 2. Se houver módulos, testar inserção de uma aula
-- (Substitua 'MODULE_ID_AQUI' pelo ID de um módulo real)
DO $$
DECLARE
    module_id_var UUID;
    lesson_id_var UUID;
BEGIN
    -- Buscar o primeiro módulo disponível
    SELECT id INTO module_id_var FROM modules LIMIT 1;
    
    IF module_id_var IS NOT NULL THEN
        -- Inserir aula de teste
        INSERT INTO lessons (
            module_id,
            title,
            description,
            type,
            order_index,
            is_published,
            content
        ) VALUES (
            module_id_var,
            'Aula de Teste RLS',
            'Esta é uma aula de teste para verificar se o RLS está funcionando corretamente.',
            'text',
            999,
            false,
            '{"textContent": "Conteúdo de teste para verificar RLS"}'
        ) RETURNING id INTO lesson_id_var;
        
        RAISE NOTICE 'Aula criada com sucesso! ID: %', lesson_id_var;
        
        -- Verificar se a aula foi criada
        SELECT 'Aula criada:' as status, id, title, description FROM lessons WHERE id = lesson_id_var;
        
        -- Limpar a aula de teste
        DELETE FROM lessons WHERE id = lesson_id_var;
        RAISE NOTICE 'Aula de teste removida.';
        
    ELSE
        RAISE NOTICE 'Nenhum módulo encontrado para teste.';
    END IF;
END $$;

-- 3. Verificar políticas ativas
SELECT 'Políticas ativas na tabela lessons:' as status;
SELECT 
    policyname,
    cmd,
    roles,
    permissive
FROM pg_policies 
WHERE tablename = 'lessons';

-- 4. Verificar se RLS está habilitado
SELECT 'RLS habilitado:' as status;
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'lessons';