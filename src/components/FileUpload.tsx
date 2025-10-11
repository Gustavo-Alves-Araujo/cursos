'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { SupportMaterial } from '@/types/course';
import { Upload, File, Download, Trash2 } from 'lucide-react';
import { useNotification } from '@/components/Notification';

interface FileUploadProps {
  lessonId: string;
  existingMaterials?: SupportMaterial[];
  onMaterialsChange: (materials: SupportMaterial[]) => void;
  maxFiles?: number;
  maxSize?: number; // em MB
}

export function FileUpload({ 
  lessonId, 
  existingMaterials = [], 
  onMaterialsChange, 
  maxFiles = 10,
  maxSize = 50 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification, NotificationContainer } = useNotification();

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'image/png',
    'image/jpeg',
    'image/gif'
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('image')) return '🖼️';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📄';
  };

  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      showNotification({
        type: 'error',
        title: 'Tipo de arquivo não permitido',
        message: `O arquivo ${file.name} não é um tipo de arquivo permitido.`
      });
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      showNotification({
        type: 'error',
        title: 'Arquivo muito grande',
        message: `O arquivo ${file.name} é maior que ${maxSize}MB.`
      });
      return false;
    }

    if (existingMaterials.length >= maxFiles) {
      showNotification({
        type: 'error',
        title: 'Limite de arquivos atingido',
        message: `Você pode fazer upload de no máximo ${maxFiles} arquivos.`
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${lessonId}/${timestamp}_${cleanName}`;

      console.log('📤 Iniciando upload:', fileName);

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('support-materials')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Erro no upload:', error);
        throw error;
      }

      console.log('✅ Upload realizado com sucesso:', data);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('support-materials')
        .getPublicUrl(fileName);

      // Criar objeto do material de apoio
      const newMaterial: SupportMaterial = {
        id: `${lessonId}_${timestamp}`,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };

      // Atualizar lista de materiais
      const updatedMaterials = [...existingMaterials, newMaterial];
      onMaterialsChange(updatedMaterials);

      showNotification({
        type: 'success',
        title: 'Upload realizado!',
        message: `O arquivo ${file.name} foi enviado com sucesso.`
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      showNotification({
        type: 'error',
        title: 'Erro no upload',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (validateFile(file)) {
        await uploadFile(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeMaterial = (materialId: string) => {
    const updatedMaterials = existingMaterials.filter(m => m.id !== materialId);
    onMaterialsChange(updatedMaterials);
    
    showNotification({
      type: 'info',
      title: 'Material removido',
      message: 'O material foi removido da lista.'
    });
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
    <div className="space-y-4">
      <NotificationContainer />
      
      {/* Área de Upload */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
        <CardContent className="p-6">
          <div
            className={`text-center space-y-4 ${
              dragActive ? 'bg-blue-50' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium ">
                  Arraste arquivos aqui ou{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 underline"
                    disabled={isUploading}
                  >
                    clique para selecionar
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Máximo {maxFiles} arquivos, {maxSize}MB cada
                </p>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600">Enviando arquivo...</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      {existingMaterials.length > 0 && (
        <div className="space-y-2 truncate">
          <h4 className="text-sm font-medium text-">
            Materiais de Apoio ({existingMaterials.length})
          </h4>
          <div className="space-y-2">
            {existingMaterials.map((material) => (
              <Card key={material.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(material.type)}</span>
                    <div className="flex-1 max-w-full min-w-0">
                      <p className="text-sm font-medium truncate">
                        {material.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(material.size)}
                      </p>
                    </div>
                  </div>

                </div>
                <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadMaterial(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMaterial(material.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
