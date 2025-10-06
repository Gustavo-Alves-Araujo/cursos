'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart, Plus, Edit, Trash2, DollarSign, Package, Star, Users, TrendingUp } from "lucide-react";

// Mock data para produtos da loja
const mockProducts = [
  {
    id: "prod-1",
    name: "Curso Premium: React Avançado",
    description: "Aprenda React do zero ao avançado com projetos reais",
    price: 299.90,
    originalPrice: 399.90,
    category: "Cursos",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop",
    stock: 50,
    status: "Ativo",
    sales: 234,
    rating: 4.8,
    tags: ["React", "JavaScript", "Frontend"]
  },
  {
    id: "prod-2",
    name: "E-book: Guia Completo de TypeScript",
    description: "Manual completo para dominar TypeScript",
    price: 49.90,
    originalPrice: 79.90,
    category: "E-books",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1200&auto=format&fit=crop",
    stock: 100,
    status: "Ativo",
    sales: 156,
    rating: 4.6,
    tags: ["TypeScript", "JavaScript", "E-book"]
  },
  {
    id: "prod-3",
    name: "Workshop: Node.js em Produção",
    description: "Workshop prático de Node.js para produção",
    price: 199.90,
    originalPrice: 299.90,
    category: "Workshops",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1200&auto=format&fit=crop",
    stock: 25,
    status: "Ativo",
    sales: 89,
    rating: 4.9,
    tags: ["Node.js", "Backend", "Workshop"]
  },
  {
    id: "prod-4",
    name: "Template: Dashboard Admin",
    description: "Template completo de dashboard administrativo",
    price: 99.90,
    originalPrice: 149.90,
    category: "Templates",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    stock: 75,
    status: "Ativo",
    sales: 67,
    rating: 4.7,
    tags: ["Template", "Dashboard", "Admin"]
  },
  {
    id: "prod-5",
    name: "Curso: Python para Data Science",
    description: "Aprenda Python aplicado à ciência de dados",
    price: 399.90,
    originalPrice: 599.90,
    category: "Cursos",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    stock: 0,
    status: "Inativo",
    sales: 123,
    rating: 4.5,
    tags: ["Python", "Data Science", "Machine Learning"]
  }
];

export default function AdminShopPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [user, isLoading]); // Remove router from dependencies

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

  if (!user || user.role !== 'admin') {
    return null;
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || product.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === "all" || product.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedProductData = selectedProduct ? products.find(p => p.id === selectedProduct) : null;

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleToggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: product.status === "Ativo" ? "Inativo" : "Ativo" }
        : product
    ));
  };

  const openEditDialog = (productId: string) => {
    setSelectedProduct(productId);
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-green-500/20 text-green-200 border-green-500/50';
      case 'inativo':
        return 'bg-red-500/20 text-red-200 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cursos':
        return 'bg-blue-500/20 text-blue-200';
      case 'e-books':
        return 'bg-purple-500/20 text-purple-200';
      case 'workshops':
        return 'bg-orange-500/20 text-orange-200';
      case 'templates':
        return 'bg-green-500/20 text-green-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const categories = ["Cursos", "E-books", "Workshops", "Templates"];
  const totalRevenue = products.reduce((acc, product) => acc + (product.price * product.sales), 0);
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "Ativo").length;
  const totalSales = products.reduce((acc, product) => acc + product.sales, 0);

  return (
    <div className="relative">
      <AdminSidebar />
      <main className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                Gestão da Loja
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie todos os produtos da loja
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalProducts}</div>
                  <div className="text-blue-200 text-sm">Total de Produtos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-blue-200 text-sm">Receita Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalSales}</div>
                  <div className="text-blue-200 text-sm">Vendas Totais</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{activeProducts}</div>
                  <div className="text-blue-200 text-sm">Produtos Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca e Filtros */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200">Buscar Produtos</CardTitle>
            <CardDescription className="text-blue-300">
              Encontre produtos por nome, descrição ou tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <Input
                  placeholder="Buscar por nome, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white/15 border border-white/40 text-black rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/15 border border-white/40 text-black rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Todos os Produtos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                        <CardDescription className="text-blue-300 text-sm">{product.description}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(product.status)}
                    >
                      {product.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Preço:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-gray-400 text-sm line-through">
                            R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Categoria:</span>
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Estoque:</span>
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-200' : 'text-red-200'}`}>
                        {product.stock} unidades
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Vendas:</span>
                      <span className="text-white font-medium">{product.sales}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Avaliação:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{product.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => openEditDialog(product.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                        onClick={() => handleToggleProductStatus(product.id)}
                      >
                        {product.status === "Ativo" ? "Desativar" : "Ativar"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Editar Produto - {selectedProductData?.name}
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Modifique as informações do produto
              </DialogDescription>
            </DialogHeader>
            
            {selectedProductData && (
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Nome</label>
                    <Input 
                      defaultValue={selectedProductData.name}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Categoria</label>
                    <select 
                      defaultValue={selectedProductData.category}
                      className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Descrição</label>
                  <textarea 
                    defaultValue={selectedProductData.description}
                    className="w-full bg-white/15 border border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 rounded-md px-3 py-2 min-h-[100px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Preço</label>
                    <Input 
                      type="number"
                      step="0.01"
                      defaultValue={selectedProductData.price}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Preço Original</label>
                    <Input 
                      type="number"
                      step="0.01"
                      defaultValue={selectedProductData.originalPrice}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Estoque</label>
                    <Input 
                      type="number"
                      defaultValue={selectedProductData.stock}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Status</label>
                    <select 
                      defaultValue={selectedProductData.status}
                      className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Avaliação</label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={selectedProductData.rating}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Criação */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Criar Novo Produto
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Adicione um novo produto à loja
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Nome</label>
                  <Input 
                    placeholder="Nome do produto"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Categoria</label>
                  <select 
                    className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-blue-200 text-sm font-medium">Descrição</label>
                <textarea 
                  placeholder="Descrição do produto"
                  className="w-full bg-white/15 border border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 rounded-md px-3 py-2 min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Preço</label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Preço Original</label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Estoque</label>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Status</label>
                  <select 
                    className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Avaliação</label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="0.0"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Criar Produto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
