import { useState } from 'react';

export interface StudentImportData {
  name: string;
  email: string;
  cpf?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
  details?: {
    successful: StudentImportData[];
    failed: Array<{ data: StudentImportData; error: string }>;
  };
}

export function useImportStudents() {
  const [isLoading, setIsLoading] = useState(false);

  const parseCSV = (csvContent: string): StudentImportData[] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Arquivo CSV vazio');
    }

    // Verificar se tem cabeçalho
    const hasHeader = lines[0].toLowerCase().includes('nome') || 
                     lines[0].toLowerCase().includes('email') ||
                     lines[0].toLowerCase().includes('cpf');

    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    if (dataLines.length === 0) {
      throw new Error('Nenhum dado encontrado no CSV');
    }

    const students: StudentImportData[] = [];

    dataLines.forEach((line, index) => {
      const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      if (row.length < 2) {
        throw new Error(`Linha ${index + 1}: Dados insuficientes. Necessário pelo menos nome e email.`);
      }

      const [name, email, cpf] = row;

      if (!name || !email) {
        throw new Error(`Linha ${index + 1}: Nome e email são obrigatórios.`);
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(`Linha ${index + 1}: Email inválido: ${email}`);
      }

      students.push({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf ? cpf.trim() : undefined
      });
    });

    return students;
  };

  const importStudents = async (csvFile: File): Promise<ImportResult> => {
    setIsLoading(true);
    
    try {
      // Ler arquivo CSV
      const csvContent = await csvFile.text();
      
      // Parsear CSV
      const studentsData = parseCSV(csvContent);
      
      if (studentsData.length === 0) {
        return {
          success: false,
          message: 'Nenhum aluno válido encontrado no arquivo',
          imported: 0,
          errors: ['Arquivo vazio ou sem dados válidos']
        };
      }

      // Enviar para API
      const formData = new FormData();
      formData.append('students', JSON.stringify(studentsData));

      const response = await fetch('/api/admin/import-students', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Erro ao importar alunos',
          imported: 0,
          errors: [result.error || 'Erro desconhecido']
        };
      }

      return result;

    } catch (error) {
      console.error('Erro na importação:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar arquivo',
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    importStudents,
    isLoading
  };
}
