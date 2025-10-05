'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, CheckCircle, ExternalLink } from 'lucide-react';

interface DocumentLessonProps {
  title: string;
  documentUrl: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function DocumentLesson({ title, documentUrl, onComplete, isCompleted = false }: DocumentLessonProps) {

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
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getFileIcon(documentUrl)}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-blue-200 text-sm">Tipo: {getFileType(documentUrl)}</p>
                <p className="text-blue-300 text-sm">URL: {documentUrl}</p>
              </div>
            </div>
          </div>

          {/* Preview do Documento */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Preview do Documento</h4>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Documento: {getFileType(documentUrl)}</p>
                <p className="text-gray-400 text-sm">Clique em &quot;Visualizar&quot; para abrir o documento</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button 
              onClick={handleView}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            
            <Button 
              onClick={() => window.open(documentUrl, '_blank')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Botão de Conclusão */}
          {!isCompleted && (
            <Button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar como Concluída
            </Button>
          )}

          {isCompleted && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Aula Concluída!</span>
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-200 font-semibold mb-2">Como usar este documento:</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Clique em &quot;Visualizar&quot; para abrir o documento em uma nova aba</li>
              <li>• Use &quot;Baixar&quot; para salvar o arquivo em seu dispositivo</li>
              <li>• Marque como concluída após revisar o conteúdo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
