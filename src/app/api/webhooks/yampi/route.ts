import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tipos para os dados do webhook da Yampi
interface YampiCustomer {
  data: {
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
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

// Função para gerar senha aleatória
function generateRandomPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
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

      const existingUser = users.users.find(user => user.email === customerEmail);
      let currentUserId: string;

      if (existingUser) {
        // Usuário já existe, atualizar metadata
        console.log('Usuário já existe, atualizando metadata');
        currentUserId = existingUser.id;
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: {
              name: customerName,
              needs_password_reset: true
            }
          }
        );

        if (updateError) {
          console.error('Erro ao atualizar usuário:', updateError);
          continue;
        }
      } else {
        // Criar novo usuário
        console.log('Criando novo usuário');
        const randomPassword = generateRandomPassword();
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          password: randomPassword,
          user_metadata: {
            name: customerName,
            needs_password_reset: true
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
        console.log('Senha temporária:', randomPassword);
      }

      // Criar matrícula no curso (se necessário)
      if (integration.course_id) {
        console.log('Criando matrícula para o curso:', integration.course_id);
        
        const { error: enrollmentError } = await supabaseAdmin
          .from('course_enrollments')
          .upsert({
            user_id: currentUserId,
            course_id: integration.course_id
          });

        if (enrollmentError) {
          console.error('Erro ao criar matrícula:', enrollmentError);
        } else {
          console.log('Matrícula criada/atualizada com sucesso');
        }
      } else {
        console.log('Nenhum course_id configurado na integração');
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
