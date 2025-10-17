'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImportStudents, ImportResult } from '@/hooks/useImportStudents';
import { Upload, FileText, CheckCircle, XCircle, Download, AlertCircle } from 'lucide-react';

interface ImportStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportStudentsDialog({ isOpen, onClose, onSuccess }: ImportStudentsDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importStudents, isLoading } = useImportStudents();

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    onClose();
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV válido.');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const result = await importStudents(selectedFile);
    setImportResult(result);

    if (result.success) {
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Nome,Email,CPF,Curso\nJoão Silva,joao@exemplo.com,123.456.789-01,Curso de React\nMaria Santos,maria@exemplo.com,987.654.321-00,Curso de Node.js';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_alunos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Alunos via CSV
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com os dados dos alunos para importação em lote.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Formato do Arquivo</h4>
                <p className="text-sm text-blue-700 mt-1">
                  O arquivo CSV deve conter as colunas: <strong>Nome, Email, CPF, Curso</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Nome</strong> e <strong>Email</strong> são obrigatórios</li>
                  <li><strong>CPF</strong> é opcional</li>
                  <li><strong>Curso</strong> é opcional - se informado e o curso existir, o aluno será matriculado automaticamente</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          {!importResult && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remover Arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Arraste e solte seu arquivo CSV aqui
                    </p>
                    <p className="text-gray-500">ou</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Selecione um arquivo
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Apenas arquivos .csv são aceitos
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                      <strong>{importResult.message}</strong>
                      {importResult.success && (
                        <p className="mt-1">
                          {importResult.imported} aluno(s) importado(s) com sucesso!
                        </p>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Erros encontrados:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Details */}
              {importResult.success && importResult.details && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Detalhes da importação:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>✅ {importResult.details.successful.length} aluno(s) importado(s) com sucesso</p>
                    {importResult.details.failed.length > 0 && (
                      <p>❌ {importResult.details.failed.length} aluno(s) falharam na importação</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {importResult ? 'Fechar' : 'Cancelar'}
            </Button>
            
            {!importResult && selectedFile && (
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? 'Importando...' : 'Importar Alunos'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
