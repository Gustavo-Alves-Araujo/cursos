'use client';

import { SupportMaterial } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, FileText, Image, Archive, Presentation, Table } from 'lucide-react';

interface SupportMaterialsProps {
  materials: SupportMaterial[];
  title?: string;
}

export function SupportMaterials({ materials, title = "Materiais de Apoio" }: SupportMaterialsProps) {
  if (!materials || materials.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" aria-hidden="true" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5 text-blue-500" aria-hidden="true" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <Table className="w-5 h-5 text-green-500" aria-hidden="true" />;
    if (type.includes('powerpoint') || type.includes('presentation')) return <Presentation className="w-5 h-5 text-orange-500" aria-hidden="true" />;
    if (type.includes('image')) return <Image className="w-5 h-5 text-purple-500" aria-hidden="true" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5 text-gray-500" aria-hidden="true" />;
    return <File className="w-5 h-5 text-gray-500" aria-hidden="true" />;
  };

  const getFileTypeName = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'Word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PowerPoint';
    if (type.includes('image')) return 'Imagem';
    if (type.includes('zip') || type.includes('rar')) return 'Arquivo';
    return 'Documento';
  };

  const downloadMaterial = (material: SupportMaterial) => {
    const link = document.createElement('a');
    link.href = material.url;
    link.download = material.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <File className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(material.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {material.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <span>{getFileTypeName(material.type)}</span>
                    <span>•</span>
                    <span>{formatFileSize(material.size)}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadMaterial(material)}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
