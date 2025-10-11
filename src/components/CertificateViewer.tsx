'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  // Debug: verificar se a URL do certificado está sendo passada
  console.log('CertificateViewer - certificate:', certificate);
  console.log('CertificateViewer - certificateUrl:', certificate.certificateUrl);
  console.log('CertificateViewer - secondPageUrl:', certificate.secondPageUrl);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      if (!certificate.certificateUrl) {
        alert('Certificado não disponível para download');
        return;
      }
      
      // Função para baixar uma imagem
      const downloadImage = (url: string, filename: string) => {
        return new Promise<void>((resolve, reject) => {
          try {
            // Se for uma data URL (base64), usar diretamente
            if (url.startsWith('data:')) {
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              resolve();
            } else {
              // Se for uma URL externa, fazer fetch primeiro
              fetch(url)
                .then(response => response.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = filename;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                  resolve();
                })
                .catch(reject);
            }
          } catch (error) {
            reject(error);
          }
        });
      };

      const studentName = certificate.studentName.replace(/\s+/g, '_');
      
      // Baixar primeira página
      await downloadImage(
        certificate.certificateUrl, 
        `certificado-${studentName}-pagina1.png`
      );

      // Se houver segunda página, baixar também
      if (certificate.secondPageUrl) {
        // Pequeno delay para evitar conflitos de download
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await downloadImage(
          certificate.secondPageUrl, 
          `certificado-${studentName}-pagina2.png`
        );
      }
      
      // Feedback para o usuário
      if (certificate.secondPageUrl) {
        alert('Download concluído! Ambas as páginas foram baixadas.');
      } else {
        alert('Download concluído!');
      }
      
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      alert('Erro ao baixar certificado. Tente novamente.');
    } finally {
      setIsDownloading(false);
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
                disabled={!certificate.certificateUrl || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                    {certificate.secondPageUrl && " (2 páginas)"}
                  </>
                )}
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
              {certificate.secondPageUrl && (
                <span className="text-sm font-normal ml-2">
                  (Página {currentPage} de 2)
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Navegação entre páginas */}
            {certificate.secondPageUrl && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  className={currentPage === 1 ? "bg-blue-600 text-white" : "bg-white/15 border-white/30 text-blue-200"}
                >
                  Página 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(2)}
                  className={currentPage === 2 ? "bg-blue-600 text-white" : "bg-white/15 border-white/30 text-blue-200"}
                >
                  Página 2
                </Button>
              </div>
            )}

            <div className="text-center">
              {currentPage === 1 && certificate.certificateUrl ? (
                <Image
                  src={certificate.certificateUrl}
                  alt="Primeira página do certificado"
                  width={800}
                  height={600}
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                />
              ) : currentPage === 2 && certificate.secondPageUrl ? (
                <Image
                  src={certificate.secondPageUrl}
                  alt="Segunda página do certificado"
                  width={800}
                  height={600}
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Página não disponível</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={!certificate.certificateUrl || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Certificado
                    {certificate.secondPageUrl && " (Ambas as páginas)"}
                  </>
                )}
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
