import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface StudentImportData {
  name: string;
  email: string;
  cpf?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
  details?: {
    successful: StudentImportData[];
    failed: Array<{ data: StudentImportData; error: string }>;
  };
}

// Função para gerar senha temporária fixa
function generateTemporaryPassword(): string {
  return '123123';
}

// Função para formatar CPF
function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return cpf; // Retorna o original se não conseguir formatar
  }
  
  // Formata: 000.000.000-00
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const studentsJson = formData.get('students') as string;

    if (!studentsJson) {
      return NextResponse.json(
        { error: 'Dados dos alunos não fornecidos' },
        { status: 400 }
      );
    }

    const studentsData: StudentImportData[] = JSON.parse(studentsJson);

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return NextResponse.json(
        { error: 'Lista de alunos vazia ou inválida' },
        { status: 400 }
      );
    }

    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar usuários existentes para verificar duplicatas
    const { data: existingUsers, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Erro ao buscar usuários existentes:', userError);
      return NextResponse.json(
        { error: 'Erro ao verificar usuários existentes' },
        { status: 500 }
      );
    }

    const existingEmails = new Set(existingUsers.users.map(user => user.email));

    const result: ImportResult = {
      success: true,
      message: '',
      imported: 0,
      errors: [],
      details: {
        successful: [],
        failed: []
      }
    };

    // Processar cada aluno
    for (const student of studentsData) {
      try {
        // Verificar se email já existe
        if (existingEmails.has(student.email)) {
          result.details!.failed.push({
            data: student,
            error: 'Email já existe no sistema'
          });
          continue;
        }

        // Gerar senha temporária
        const temporaryPassword = generateTemporaryPassword();
        
        // Formatar CPF se fornecido
        const formattedCPF = student.cpf ? formatCPF(student.cpf) : null;

        // Criar usuário
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: temporaryPassword,
          user_metadata: {
            name: student.name,
            cpf: formattedCPF,
            needs_password_reset: true
          },
          email_confirm: true
        });

        if (createError) {
          result.details!.failed.push({
            data: student,
            error: `Erro ao criar usuário: ${createError.message}`
          });
          continue;
        }

        if (!newUser?.user?.id) {
          result.details!.failed.push({
            data: student,
            error: 'ID do usuário não foi retornado'
          });
          continue;
        }

        // Atualizar CPF na tabela users se fornecido
        if (formattedCPF) {
          const { error: updateUserError } = await supabaseAdmin
            .from('users')
            .update({ cpf: formattedCPF })
            .eq('id', newUser.user.id);

          if (updateUserError) {
            console.error('Erro ao atualizar CPF na tabela users:', updateUserError);
            // Não falhar por causa disso, mas log o erro
          }
        }

        result.details!.successful.push(student);
        result.imported++;
        existingEmails.add(student.email); // Adicionar à lista para evitar duplicatas no mesmo lote

        console.log(`Aluno importado com sucesso: ${student.name} (${student.email})`);

      } catch (error) {
        console.error('Erro ao processar aluno:', student, error);
        result.details!.failed.push({
          data: student,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    // Determinar resultado final
    if (result.imported === 0) {
      result.success = false;
      result.message = 'Nenhum aluno foi importado';
    } else if (result.details!.failed.length > 0) {
      result.success = true;
      result.message = `${result.imported} aluno(s) importado(s) com sucesso, ${result.details!.failed.length} falharam`;
    } else {
      result.success = true;
      result.message = `Todos os ${result.imported} aluno(s) foram importados com sucesso!`;
    }

    // Adicionar erros à lista de erros
    result.errors = result.details!.failed.map(f => `${f.data.name} (${f.data.email}): ${f.error}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro no endpoint de importação de alunos:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
