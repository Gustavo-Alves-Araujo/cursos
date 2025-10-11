'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Star, ShoppingCart, Heart, Clock, Users, Award, TrendingUp, BookOpen, Zap, Crown, Gift } from "lucide-react";

// Mock data para produtos da loja
const mockProducts = [
  {
    id: "p-1",
    title: "Curso Premium: React Avançado",
    description: "Domine React com hooks, context, performance e padrões avançados",
    price: 299.90,
    originalPrice: 399.90,
    rating: 4.9,
    students: 1250,
    duration: "40h",
    level: "Avançado",
    category: "Desenvolvimento",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    discount: 25,
    tags: ["React", "JavaScript", "Frontend"]
  },
  {
    id: "p-2",
    title: "Trilha Completa: Full Stack",
    description: "Do zero ao deploy: frontend, backend, banco de dados e DevOps",
    price: 599.90,
    originalPrice: 899.90,
    rating: 4.8,
    students: 890,
    duration: "120h",
    level: "Intermediário",
    category: "Desenvolvimento",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    discount: 33,
    tags: ["Full Stack", "Node.js", "React", "MongoDB"]
  },
  {
    id: "p-3",
    title: "Design System Masterclass",
    description: "Crie sistemas de design escaláveis e consistentes",
    price: 199.90,
    originalPrice: 299.90,
    rating: 4.7,
    students: 650,
    duration: "25h",
    level: "Intermediário",
    category: "Design",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    discount: 33,
    tags: ["Design", "Figma", "UI/UX"]
  },
  {
    id: "p-4",
    title: "Python para Data Science",
    description: "Análise de dados, machine learning e visualização com Python",
    price: 349.90,
    originalPrice: 499.90,
    rating: 4.9,
    students: 2100,
    duration: "60h",
    level: "Avançado",
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    discount: 30,
    tags: ["Python", "Data Science", "Machine Learning"]
  },
  {
    id: "p-5",
    title: "Marketing Digital Completo",
    description: "Estratégias de marketing digital, SEO, redes sociais e analytics",
    price: 249.90,
    originalPrice: 399.90,
    rating: 4.6,
    students: 1800,
    duration: "35h",
    level: "Iniciante",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    discount: 37,
    tags: ["Marketing", "SEO", "Analytics"]
  },
  {
    id: "p-6",
    title: "Certificação AWS Cloud",
    description: "Prepare-se para as certificações AWS Solutions Architect",
    price: 449.90,
    originalPrice: 699.90,
    rating: 4.8,
    students: 950,
    duration: "50h",
    level: "Avançado",
    category: "Cloud",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    discount: 36,
    tags: ["AWS", "Cloud", "DevOps"]
  }
];

const categories = [
  { id: "all", name: "Todos", icon: BookOpen },
  { id: "Desenvolvimento", name: "Desenvolvimento", icon: Zap },
  { id: "Design", name: "Design", icon: Award },
  { id: "Data Science", name: "Data Science", icon: TrendingUp },
  { id: "Marketing", name: "Marketing", icon: Users },
  { id: "Cloud", name: "Cloud", icon: Crown }
];

export default function LojaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [storeUrl, setStoreUrl] = useState("");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role === 'admin') {
        router.push('/admin');
        return;
      }
    }
  }, [user, isLoading, router]);

  // Carregar URL da loja configurada pelo admin
  useEffect(() => {
    const savedUrl = localStorage.getItem('storeUrl');
    if (savedUrl) {
      setStoreUrl(savedUrl);
      // Redirecionar automaticamente para a loja externa
      window.open(savedUrl, '_blank');
      // Voltar para a página inicial após redirecionamento
      router.push('/');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return null;
  }

  // Se não há URL configurada, mostrar mensagem
  if (!storeUrl) {
    return (
      <div className="relative">
        <Sidebar />
        <main className="space-y-8 p-4 sm:p-6 lg:ml-64">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8" />
                  Loja
                </h1>
                <p className="text-blue-300 mt-1">
                  Descubra cursos incríveis e acelere sua carreira
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-blue-200 mb-2">
                Loja em Configuração
              </h2>
              <p className="text-blue-300 mb-6">
                A loja está sendo configurada pelo administrador. Em breve você poderá acessar todos os cursos disponíveis.
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar aos Cursos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "students":
        return b.students - a.students;
      default:
        return b.featured ? 1 : -1;
    }
  });

  const addToCart = (productId: string) => {
    setCart(prev => [...prev, productId]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-4 sm:p-6 lg:ml-64">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                Loja
              </h1>
              <p className="text-blue-300 mt-1">
                Descubra cursos incríveis e acelere sua carreira
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-blue-300" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                  {cart.length}
                </Badge>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/10 border border-white/30 text-white rounded px-3 py-2 text-sm focus:border-blue-400"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/30 text-white rounded px-3 py-2 text-sm focus:border-blue-400"
                >
                  <option value="featured">Em Destaque</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                  <option value="students">Mais Alunos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
                    : 'bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Produtos em Destaque */}
        {selectedCategory === "all" && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-blue-200 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Produtos em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProducts.filter(p => p.featured).map((product) => (
                <Card key={product.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image 
                        src={product.image} 
                        alt={product.title}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {product.discount > 0 && (
                        <Badge className="absolute left-3 top-3 bg-red-500 text-white">
                          -{product.discount}%
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-3 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-blue-200 text-sm line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-300 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{product.students.toLocaleString()}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{product.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-200">
                        {product.level}
                      </Badge>
                      <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-200">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">{formatPrice(product.price)}</div>
                        {product.originalPrice > product.price && (
                          <div className="text-sm text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => addToCart(product.id)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Todos os Produtos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-200">
              {selectedCategory === "all" ? "Todos os Cursos" : `Cursos de ${selectedCategory}`}
            </h2>
            <div className="text-blue-300 text-sm">
              {sortedProducts.length} curso{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <Card key={product.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                    <Image 
                      src={product.image} 
                      alt={product.title}
                      width={300}
                      height={160}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {product.discount > 0 && (
                      <Badge className="absolute left-2 top-2 bg-red-500 text-white text-xs">
                        -{product.discount}%
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 bg-black/50 hover:bg-black/70 text-white p-1"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart className={`w-3 h-3 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1 line-clamp-2 text-sm">{product.title}</h3>
                    <p className="text-blue-200 text-xs line-clamp-2">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-300 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{product.students.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-white">{formatPrice(product.price)}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product.id)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Carrinho Flutuante */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full p-4 shadow-2xl">
              <ShoppingCart className="w-6 h-6 mr-2" />
              Finalizar Compra ({cart.length})
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
