'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, CheckCircle, ExternalLink } from 'lucide-react';

interface DocumentLessonProps {
  title: string;
  documentUrl: string;
  additionalText?: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function DocumentLesson({ title, documentUrl, additionalText, onComplete, isCompleted = false }: DocumentLessonProps) {

  const handleDownload = () => {
    try {
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = `${title}.${getFileExtension(documentUrl)}`;
      link.target = '_blank';
      
      // Adicionar ao DOM temporariamente para funcionar em alguns navegadores
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Fallback: abrir em nova aba se o download não funcionar
      setTimeout(() => {
        window.open(documentUrl, '_blank');
      }, 100);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      // Fallback: abrir em nova aba
      window.open(documentUrl, '_blank');
    }
  };

  const handleView = () => {
    // Em um cenário real, você abriria o documento em uma nova aba ou modal
    window.open(documentUrl, '_blank');
  };

  const handleComplete = () => {
    console.log('DocumentLesson: handleComplete chamado');
    console.log('DocumentLesson: onComplete function:', onComplete);
    onComplete();
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || 'pdf';
  };

  const getFileType = (url: string) => {
    const extension = getFileExtension(url);
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
        return 'Excel';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint';
      default:
        return 'Documento';
    }
  };

  const getFileIcon = (url: string) => {
    const extension = getFileExtension(url);
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Documento */}
          <div 
            className="bg-white/5 rounded-lg p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors duration-200"
            onClick={handleDownload}
            title="Clique para baixar o documento"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getFileIcon(documentUrl)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
                <p className="text-blue-200 text-sm">Tipo: {getFileType(documentUrl)}</p>
                <p className="text-blue-300 text-xs mt-1">Clique para baixar</p>
              </div>
              <Download className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          {/* Baixar Documento */}
         

          {/* Texto Adicional */}
          {additionalText && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">Informações Adicionais</h4>
              <div 
                className="text-blue-200 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: additionalText }}
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
           
            
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            
          </div>

          {/* Botão de Conclusão */}
          {!isCompleted && (
            <Button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar como Concluída
            </Button>
          )}

          {isCompleted && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Aula Concluída!</span>
              </div>
            </div>
          )}

          {/* Instruções */}
        
        </CardContent>
      </Card>
    </div>
  );
}
