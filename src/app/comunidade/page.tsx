'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, MessageCircle, Heart, Share2, TrendingUp, Trophy, Star, Users, Zap, Target, Award, Calendar, Clock, BookOpen, Plus, Filter, ThumbsUp, Reply, Flag, Code, Palette } from "lucide-react";

// Mock data para posts da comunidade
const mockPosts = [
  {
    id: "post-1",
    title: "🚀 Dica: Como otimizar performance no React",
    content: "Descobri uma técnica incrível para melhorar a performance dos componentes React usando useMemo e useCallback. Quem mais já testou?",
    author: {
      name: "Maria Silva",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop",
      level: "Avançado",
      points: 2450
    },
    category: "Desenvolvimento",
    tags: ["React", "Performance", "JavaScript"],
    likes: 42,
    comments: 18,
    shares: 8,
    timeAgo: "2h",
    isLiked: false,
    isBookmarked: false
  },
  {
    id: "post-2",
    title: "🎨 Design System: Componentes reutilizáveis",
    content: "Compartilhando meu design system que criei para o projeto atual. Inclui tokens de design, componentes e documentação completa!",
    author: {
      name: "João Santos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      level: "Expert",
      points: 3200
    },
    category: "Design",
    tags: ["Design System", "Figma", "UI/UX"],
    likes: 67,
    comments: 23,
    shares: 15,
    timeAgo: "4h",
    isLiked: true,
    isBookmarked: true
  },
  {
    id: "post-3",
    title: "💡 Challenge: Criem um clone do Spotify em 7 dias",
    content: "Que tal um desafio divertido? Vamos criar um clone do Spotify usando React e Node.js. Quem topa participar?",
    author: {
      name: "Ana Costa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
      level: "Intermediário",
      points: 1800
    },
    category: "Desafio",
    tags: ["Challenge", "React", "Node.js", "Spotify"],
    likes: 89,
    comments: 45,
    shares: 32,
    timeAgo: "6h",
    isLiked: false,
    isBookmarked: false
  },
  {
    id: "post-4",
    title: "🏆 Conquista: Completei a trilha Full Stack!",
    content: "Finalmente terminei todos os cursos da trilha Full Stack! 6 meses de muito estudo, mas valeu cada minuto. Obrigado comunidade! 🙏",
    author: {
      name: "Carlos Lima",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
      level: "Avançado",
      points: 2100
    },
    category: "Conquista",
    tags: ["Full Stack", "Conquista", "Motivação"],
    likes: 156,
    comments: 67,
    shares: 28,
    timeAgo: "1d",
    isLiked: true,
    isBookmarked: true
  }
];

// Mock data para ranking
const mockRanking = [
  { position: 1, name: "Maria Silva", points: 2450, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop", level: "Expert" },
  { position: 2, name: "João Santos", points: 3200, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", level: "Expert" },
  { position: 3, name: "Ana Costa", points: 1800, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop", level: "Avançado" },
  { position: 4, name: "Carlos Lima", points: 2100, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop", level: "Avançado" },
  { position: 5, name: "Pedro Oliveira", points: 1650, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", level: "Intermediário" }
];

// Mock data para desafios
const mockChallenges = [
  {
    id: "challenge-1",
    title: "🎨 Clone do Instagram",
    description: "Crie um clone do Instagram usando React e Node.js",
    participants: 234,
    deadline: "7 dias",
    difficulty: "Intermediário",
    reward: "500 pontos"
  },
  {
    id: "challenge-2",
    title: "🚀 App de To-Do Avançado",
    description: "Desenvolva um app de tarefas com funcionalidades avançadas",
    participants: 189,
    deadline: "5 dias",
    difficulty: "Iniciante",
    reward: "300 pontos"
  },
  {
    id: "challenge-3",
    title: "💻 API REST Completa",
    description: "Crie uma API REST completa com autenticação e CRUD",
    participants: 156,
    deadline: "10 dias",
    difficulty: "Avançado",
    reward: "800 pontos"
  }
];

export default function ComunidadePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState("posts");

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

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "Todos", icon: MessageCircle },
    { id: "Desenvolvimento", name: "Desenvolvimento", icon: Code },
    { id: "Design", name: "Design", icon: Palette },
    { id: "Desafio", name: "Desafios", icon: Target },
    { id: "Conquista", name: "Conquistas", icon: Trophy }
  ];

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-4 sm:p-6">
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
                <Users className="w-8 h-8" />
                Comunidade
              </h1>
              <p className="text-blue-300 mt-1">
                Conecte-se, aprenda e cresça junto com outros desenvolvedores
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2.4k</div>
                  <div className="text-blue-200 text-sm">Membros Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-blue-200 text-sm">Posts Hoje</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">23</div>
                  <div className="text-blue-200 text-sm">Desafios Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">89</div>
                  <div className="text-blue-200 text-sm">Conquistas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "posts" ? "default" : "outline"}
            onClick={() => setActiveTab("posts")}
            className={activeTab === "posts" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Posts
          </Button>
          <Button
            variant={activeTab === "ranking" ? "default" : "outline"}
            onClick={() => setActiveTab("ranking")}
            className={activeTab === "ranking" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Ranking
          </Button>
          <Button
            variant={activeTab === "challenges" ? "default" : "outline"}
            onClick={() => setActiveTab("challenges")}
            className={activeTab === "challenges" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"}
          >
            <Target className="w-4 h-4 mr-2" />
            Desafios
          </Button>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <>
            {/* Search and Filters */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                    <Input
                      placeholder="Buscar posts, tags ou usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 border border-white/30 text-black rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/15 transition-all duration-200"
              >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{post.author.name}</h3>
                          <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-200 text-xs">
                            {post.author.level}
                          </Badge>
                          <span className="text-blue-300 text-sm">{post.author.points} pts</span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-400 text-sm">{post.timeAgo}</span>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">{post.title}</h4>
                          <p className="text-blue-200 mb-4">{post.content}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-white/10 border-white/30 text-blue-200 text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 ${
                              post.isLiked 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-blue-300 hover:text-blue-200'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-300 hover:text-blue-200">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-300 hover:text-blue-200">
                            <Share2 className="w-4 h-4" />
                            {post.shares}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(post.id)}
                            className={`flex items-center gap-2 ${
                              post.isBookmarked 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-blue-300 hover:text-blue-200'
                            }`}
                          >
                            <BookOpen className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Ranking Tab */}
        {activeTab === "ranking" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-200 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Ranking Semanal
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Os membros mais ativos da comunidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRanking.map((user, index) => (
                  <div key={user.position} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                        'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      }`}>
                        {user.position}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-blue-200 text-sm">{user.points} pontos</div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-200">
                      {user.level}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-200 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Suas Conquistas
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Badges e conquistas desbloqueadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Primeiro Post</div>
                    <div className="text-yellow-200 text-sm">Conquistado</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                    <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">10 Likes</div>
                    <div className="text-blue-200 text-sm">Conquistado</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Desafio</div>
                    <div className="text-green-200 text-sm">Em andamento</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Streak</div>
                    <div className="text-purple-200 text-sm">7 dias</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{challenge.title}</CardTitle>
                  <CardDescription className="text-blue-200">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-blue-300">
                      <Users className="w-4 h-4" />
                      <span>{challenge.participants} participantes</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <Clock className="w-4 h-4" />
                      <span>{challenge.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${
                      challenge.difficulty === 'Iniciante' ? 'bg-green-500/20 border-green-500/50 text-green-200' :
                      challenge.difficulty === 'Intermediário' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' :
                      'bg-red-500/20 border-red-500/50 text-red-200'
                    }`}>
                      {challenge.difficulty}
                    </Badge>
                    <div className="text-yellow-400 font-semibold">{challenge.reward}</div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Participar do Desafio
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
