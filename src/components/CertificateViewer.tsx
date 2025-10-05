'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Download, Eye, Calendar, User, BookOpen } from 'lucide-react';
import { Certificate } from '@/types/certificate';

interface CertificateViewerProps {
  certificate: Certificate;
  courseTitle?: string;
}

export function CertificateViewer({ certificate, courseTitle }: CertificateViewerProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = async () => {
    try {
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = certificate.certificateUrl;
      link.download = `certificado-${certificate.studentName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Certificado de Conclusão</CardTitle>
                <p className="text-blue-300 text-sm">{courseTitle || 'Curso'}</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-200 border-green-500/50">
              Concluído
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-sm">Aluno:</span>
              <span className="text-white font-medium">{certificate.studentName}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-sm">Concluído em:</span>
              <span className="text-white font-medium">{formatDate(certificate.completionDate)}</span>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-sm">Emitido em:</span>
              <span className="text-white font-medium">{formatDate(certificate.createdAt)}</span>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-blue-200 text-xl">
              Certificado de Conclusão
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={certificate.certificateUrl}
                alt="Certificado"
                className="max-w-full h-auto border rounded-lg shadow-lg"
              />
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Certificado
              </Button>
              <Button 
                variant="outline"
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => setIsPreviewOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
