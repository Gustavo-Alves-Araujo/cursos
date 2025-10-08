import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Criar cliente Supabase para middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Se não há variáveis de ambiente, permitir acesso (modo desenvolvimento)
    return res;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não há sessão, permitir acesso (o AuthContext vai lidar com isso)
  if (!session) {
    return res;
  }

  // Verificar se o usuário precisa redefinir a senha
  const needsPasswordReset = session.user?.user_metadata?.needs_password_reset;

  // Se precisa redefinir senha e não está na página de definir senha, redirecionar
  if (needsPasswordReset && req.nextUrl.pathname !== '/definir-senha') {
    return NextResponse.redirect(new URL('/definir-senha', req.url));
  }

  // Se está na página de definir senha mas não precisa redefinir, redirecionar para home
  if (req.nextUrl.pathname === '/definir-senha' && !needsPasswordReset) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
