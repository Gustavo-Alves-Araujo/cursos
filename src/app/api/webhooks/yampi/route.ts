import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tipos para os dados do webhook da Yampi
interface YampiCustomer {
  data: {
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    cpf?: string;
    document?: string;
  };
}

interface YampiStatus {
  data: {
    alias: string;
    name: string;
    description: string;
  };
}

interface YampiItem {
  product_id: number;
  sku_id: number;
  sku: {
    data: {
      title: string;
    };
  };
}

interface YampiOrder {
  status: YampiStatus;
  customer: YampiCustomer;
  items: {
    data: YampiItem[];
  };
}

interface YampiWebhookData {
  event: string;
  resource: YampiOrder;
}

// Função para gerar senha fixa padrão
function generateDefaultPassword(): string {
  return '123123';
}

// Função para formatar CPF (remove caracteres especiais e adiciona formatação)
function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    console.warn('CPF inválido (não tem 11 dígitos):', cpf);
    return cpf; // Retorna o original se não conseguir formatar
  }
  
  // Formata: 000.000.000-00
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Ler o corpo da requisição
    const body: YampiWebhookData = await request.json();
    const { resource: order } = body;

    console.log('Webhook Yampi recebido:', JSON.stringify(body, null, 2));

    // Validar estrutura básica
    if (!order || !order.status || !order.status.data || !order.customer || !order.customer.data || !order.items || !order.items.data) {
      console.error('Estrutura do webhook inválida:', {
        hasOrder: !!order,
        hasStatus: !!(order?.status?.data),
        hasCustomer: !!(order?.customer?.data),
        hasItems: !!(order?.items?.data)
      });
      return NextResponse.json({ error: 'Estrutura do webhook inválida' }, { status: 400 });
    }

    // Validar dados essenciais do customer
    if (!order.customer.data.email) {
      console.error('Email do customer não encontrado');
      return NextResponse.json({ error: 'Email do customer não encontrado' }, { status: 400 });
    }

    // Validar se há itens no pedido
    if (!order.items.data || order.items.data.length === 0) {
      console.log('Nenhum item encontrado no pedido');
      return NextResponse.json({ message: 'Nenhum item no pedido' }, { status: 200 });
    }

    // Verificar se o status é "paid"
    if (order.status.data.alias !== 'paid') {
      console.log('Status do pedido não é "paid":', order.status.data.alias);
      return NextResponse.json({ message: 'Status não é paid' }, { status: 200 });
    }

    // Processar cada item do pedido
    for (const item of order.items.data) {
      // Validar item
      if (!item || !item.product_id) {
        console.log('Item inválido, pulando:', item);
        continue;
      }

      console.log('Processando item:', item.product_id);

      // Buscar integração correspondente
      const { data: integration, error: integrationError } = await supabaseAdmin
        .from('yampi_integrations')
        .select('*')
        .eq('product_id', item.product_id.toString())
        .single();

      if (integrationError || !integration) {
        console.log('Integração não encontrada para product_id:', item.product_id);
        continue;
      }

      console.log('Integração encontrada:', integration.name);

      // Verificar se o usuário já existe
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error('Erro ao listar usuários:', userError);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
      }
      
      const customerEmail = order.customer.data.email;
      const customerName = order.customer.data.name || 
        `${order.customer.data.first_name || ''} ${order.customer.data.last_name || ''}`.trim() ||
        'Usuário';
      
      // Extrair CPF do customer (pode vir como 'cpf' ou 'document')
      const customerCPF = order.customer.data.cpf || order.customer.data.document;
      const formattedCPF = customerCPF ? formatCPF(customerCPF) : null;
      
      console.log('Dados do customer:', {
        email: customerEmail,
        name: customerName,
        cpf: customerCPF,
        formattedCPF
      });

      const existingUser = users.users.find(user => user.email === customerEmail);
      let currentUserId: string;

      if (existingUser) {
        // Usuário já existe, atualizar metadata e CPF
        console.log('Usuário já existe, atualizando metadata e CPF');
        currentUserId = existingUser.id;
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: {
              name: customerName,
              cpf: formattedCPF
              // Removido needs_password_reset para não redirecionar para /primeiro-acesso
            }
          }
        );

        if (updateError) {
          console.error('Erro ao atualizar usuário:', updateError);
          continue;
        }

        // Atualizar CPF na tabela users também
        if (formattedCPF) {
          const { error: updateUserError } = await supabaseAdmin
            .from('users')
            .update({ cpf: formattedCPF })
            .eq('id', currentUserId);

          if (updateUserError) {
            console.error('Erro ao atualizar CPF na tabela users:', updateUserError);
          } else {
            console.log('CPF atualizado na tabela users:', formattedCPF);
          }
        }
      } else {
        // Criar novo usuário
        console.log('Criando novo usuário');
        const defaultPassword = generateDefaultPassword();
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          password: defaultPassword,
          user_metadata: {
            name: customerName,
            cpf: formattedCPF
            // Removido needs_password_reset para não redirecionar para /primeiro-acesso
          },
          email_confirm: true // Confirmar email automaticamente
        });

        if (createError) {
          console.error('Erro ao criar usuário:', createError);
          continue;
        }

        if (!newUser?.user?.id) {
          console.error('Erro: ID do usuário não foi retornado');
          continue;
        }

        currentUserId = newUser.user.id;
        console.log('Usuário criado com sucesso:', currentUserId);
        console.log('Senha padrão:', defaultPassword);

        // Atualizar CPF na tabela users se fornecido
        if (formattedCPF) {
          const { error: updateUserError } = await supabaseAdmin
            .from('users')
            .update({ cpf: formattedCPF })
            .eq('id', currentUserId);

          if (updateUserError) {
            console.error('Erro ao atualizar CPF na tabela users:', updateUserError);
          } else {
            console.log('CPF adicionado na tabela users:', formattedCPF);
          }
        }
      }

      // Determinar quais cursos matricular
      let coursesToEnroll: string[] = [];
      
      // Prioridade 1: course_ids (array - nova estrutura)
      if (integration.course_ids && integration.course_ids.length > 0) {
        coursesToEnroll = integration.course_ids;
        console.log('Usando course_ids (array) - múltiplos cursos:', coursesToEnroll.length);
      } 
      // Prioridade 2: course_id (único - estrutura antiga para compatibilidade)
      else if (integration.course_id) {
        coursesToEnroll = [integration.course_id];
        console.log('Usando course_id (único) - curso único:', integration.course_id);
      }
      
      // Criar matrículas em todos os cursos
      if (coursesToEnroll.length > 0) {
        console.log('Criando matrículas para', coursesToEnroll.length, 'curso(s)');
        
        for (const courseId of coursesToEnroll) {
          console.log('Matriculando no curso:', courseId);
          
          const { error: enrollmentError } = await supabaseAdmin
            .from('course_enrollments')
            .upsert({
              user_id: currentUserId,
              course_id: courseId
            }, {
              onConflict: 'user_id,course_id'
            });

          if (enrollmentError) {
            console.error('Erro ao criar matrícula no curso', courseId, ':', enrollmentError);
          } else {
            console.log('Matrícula criada/atualizada com sucesso no curso:', courseId);
          }
        }
      } else {
        console.log('Nenhum curso configurado na integração');
      }
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso' }, { status: 200 });

  } catch (error) {
    console.error('Erro no webhook Yampi:', error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
