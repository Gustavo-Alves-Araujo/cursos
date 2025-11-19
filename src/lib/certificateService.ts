import { supabase } from './supabase';
import { CertificateTemplate, Certificate, CertificateGenerationData } from '../types/certificate';

export class CertificateService {
  // Configurações padrão para certificados
  private static readonly DEFAULT_CONFIG = {
    width: 800,
    height: 600,
    defaultFontFamily: 'Arial',
    defaultFontSize: 32,
    defaultTextColor: '#000000'
  };

  /**
   * Cria um template de certificado para um curso
   */
  static async createTemplate(
    courseId: string,
    backgroundImageUrl: string,
    textConfig?: Record<string, unknown>,
    secondPageConfig?: Record<string, unknown>
  ): Promise<CertificateTemplate> {
    const defaultTextConfig = {
      studentName: {
        x: 400,
        y: 300,
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'center' as const
      },
      completionDate: {
        x: 400,
        y: 400,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#666666',
        textAlign: 'center' as const
      }
    };

    const { data, error } = await supabase
      .from('certificate_templates')
      .insert({
        course_id: courseId,
        background_image_url: backgroundImageUrl,
        text_config: textConfig || defaultTextConfig,
        second_page_config: secondPageConfig || null
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar template: ${error.message}`);
    }

    if (!data) {
      throw new Error('Erro ao criar template: dados não retornados');
    }

    // Transformar dados do banco para o formato esperado
    return {
      id: data.id,
      courseId: data.course_id,
      backgroundImageUrl: data.background_image_url,
      textConfig: data.text_config,
      secondPageConfig: data.second_page_config,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Obtém o template de certificado de um curso
   */
  static async getTemplateByCourseId(courseId: string): Promise<CertificateTemplate | null> {
    console.log('🔍 Buscando template para curso:', courseId);
    
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('course_id', courseId)
      .single();

    console.log('📊 Resultado da busca:', { data, error });

    if (error) {
      console.log('❌ Erro na busca:', error);
      if (error.code === 'PGRST116') {
        console.log('📝 Template não encontrado para o curso');
        return null; // Template não encontrado
      }
      throw new Error(`Erro ao buscar template: ${error.message}`);
    }

    if (!data) {
      console.log('📝 Nenhum dado retornado');
      return null;
    }

    console.log('✅ Template encontrado:', data);

    // Transformar dados do banco para o formato esperado
    return {
      id: data.id,
      courseId: data.course_id,
      backgroundImageUrl: data.background_image_url,
      textConfig: data.text_config,
      secondPageConfig: data.second_page_config,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Atualiza um template de certificado
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<Pick<CertificateTemplate, 'backgroundImageUrl' | 'textConfig' | 'secondPageConfig'>>
  ): Promise<CertificateTemplate> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.backgroundImageUrl) {
      updateData.background_image_url = updates.backgroundImageUrl;
    }
    
    if (updates.textConfig) {
      updateData.text_config = updates.textConfig;
    }
    
    if (updates.secondPageConfig !== undefined) {
      updateData.second_page_config = updates.secondPageConfig;
    }

    const { data, error } = await supabase
      .from('certificate_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar template: ${error.message}`);
    }

    if (!data) {
      throw new Error('Erro ao atualizar template: dados não retornados');
    }

    // Transformar dados do banco para o formato esperado
    return {
      id: data.id,
      courseId: data.course_id,
      backgroundImageUrl: data.background_image_url,
      textConfig: data.text_config,
      secondPageConfig: data.second_page_config,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Deleta um template de certificado
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('certificate_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      throw new Error(`Erro ao deletar template: ${error.message}`);
    }
  }

  /**
   * Gera um certificado para um usuário
   */
  static async generateCertificate(
    userId: string,
    courseId: string,
    studentName: string,
    completionDate: string,
    studentCpf?: string,
    courseName?: string
  ): Promise<Certificate> {
    console.log('🎓 Gerando certificado:', { userId, courseId, studentName, completionDate });
    
    // Busca o template do curso
    const template = await this.getTemplateByCourseId(courseId);
    console.log('📋 Template encontrado:', template);
    
    if (!template) {
      console.log('❌ Template não encontrado para o curso:', courseId);
      throw new Error('Template de certificado não encontrado para este curso');
    }

    console.log('🎨 Iniciando geração da imagem do certificado...');
    
    // Gera a primeira página do certificado
    const certificateImageUrl = await this.generateCertificateImage({
      studentName,
      completionDate,
      template,
      studentCpf,
      courseName
    });

    console.log('✅ Primeira página gerada com sucesso:', certificateImageUrl);

    // Gera a segunda página se configurada
    let secondPageImageUrl: string | null = null;
    if (template.secondPageConfig?.showSecondPage) {
      console.log('🎨 Gerando segunda página...');
      console.log('📋 Configuração da segunda página:', template.secondPageConfig);
      secondPageImageUrl = this.generateSecondPageImage({
        studentName,
        completionDate,
        template,
        studentCpf,
        courseName
      });
      console.log('✅ Segunda página gerada com sucesso:', secondPageImageUrl ? 'Sim' : 'Não');
    } else {
      console.log('❌ Segunda página não configurada no template');
    }

    // Salva o certificado no banco
    console.log('💾 Salvando certificado no banco de dados...');
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        template_id: template.id,
        student_name: studentName,
        completion_date: completionDate,
        certificate_url: certificateImageUrl,
        second_page_url: secondPageImageUrl
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar certificado:', error);
      throw new Error(`Erro ao salvar certificado: ${error.message}`);
    }

    console.log('✅ Certificado salvo com sucesso:', data);
    
    // Transformar dados do banco para o formato esperado
    const certificate: Certificate = {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      templateId: data.template_id,
      studentName: data.student_name,
      completionDate: data.completion_date,
      certificateUrl: data.certificate_url,
      secondPageUrl: data.second_page_url,
      createdAt: data.created_at
    };
    
    console.log('🔄 Certificado transformado:', certificate);
    return certificate;
  }

  /**
   * Gera a segunda página do certificado
   */
  private static generateSecondPageImage(
    data: CertificateGenerationData
  ): string {
    const { studentName, completionDate, template, studentCpf, courseName } = data;

    if (!template.secondPageConfig?.showSecondPage) {
      throw new Error('Segunda página não configurada');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Não foi possível criar contexto do canvas');
    }

    canvas.width = this.DEFAULT_CONFIG.width;
    canvas.height = this.DEFAULT_CONFIG.height;

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurações de fonte
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';

    let yPosition = 50;
    const lineHeight = 25;
    const leftMargin = 50;

    // Primeira linha: Nome, CPF e Curso em uma linha só
    ctx.font = 'bold 16px Arial';
    let firstLineText = `Nome do aluno: ${studentName}`;
    
    if (template.secondPageConfig.includeCpf && studentCpf) {
      firstLineText += `, CPF: ${studentCpf}`;
    }
    
    if (template.secondPageConfig.includeCourseName && courseName) {
      firstLineText += `, Curso: ${courseName}`;
    }
    
    ctx.fillText(firstLineText, leftMargin, yPosition);
    yPosition += lineHeight + 20;

    // Conteúdo Programático
    yPosition += 10;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Conteúdo Programático:', leftMargin, yPosition);
    yPosition += lineHeight + 10;

    // Conteúdo programático
    if (template.secondPageConfig.programmaticContent) {
      ctx.font = '14px Arial';
      const lines = template.secondPageConfig.programmaticContent.split('\n');
      
      lines.forEach(line => {
        if (line.trim()) {
          ctx.fillText(line.trim(), leftMargin, yPosition);
          yPosition += lineHeight;
        } else {
          yPosition += lineHeight / 2; // Espaço menor para linhas vazias
        }
      });
    }

    // Data de emissão no canto direito
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    const emissionText = `Certificado emitido em: ${formatDate(completionDate)}`;
    const textWidth = ctx.measureText(emissionText).width;
    const rightMargin = canvas.width - 50;
    ctx.fillText(emissionText, rightMargin - textWidth, canvas.height - 50);

    return canvas.toDataURL();
  }

  /**
   * Gera a imagem do certificado usando Canvas
   */
  private static async generateCertificateImage(
    data: CertificateGenerationData
  ): Promise<string> {
    const { studentName, completionDate, template } = data;

    // Cria um canvas temporário
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Não foi possível criar contexto do canvas');
    }

    // Define as dimensões do certificado
    canvas.width = this.DEFAULT_CONFIG.width;
    canvas.height = this.DEFAULT_CONFIG.height;

    // Carrega a imagem de fundo
    const backgroundImage = new Image();
    backgroundImage.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      backgroundImage.onload = () => {
        // Desenha a imagem de fundo
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // Configura o texto do nome do estudante
        const nameConfig = template.textConfig.studentName;
        ctx.font = `${nameConfig.fontSize}px ${nameConfig.fontFamily}`;
        ctx.fillStyle = nameConfig.color;
        ctx.textAlign = nameConfig.textAlign;
        ctx.textBaseline = 'middle';
        
        // Desenha o nome do estudante
        ctx.fillText(studentName, nameConfig.x, nameConfig.y);

        // Configura o texto da data
        const dateConfig = template.textConfig.completionDate;
        ctx.font = `${dateConfig.fontSize}px ${dateConfig.fontFamily}`;
        ctx.fillStyle = dateConfig.color;
        ctx.textAlign = dateConfig.textAlign;
        ctx.textBaseline = 'middle';
        
        // Formata a data para dd/mm/yyyy
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        
        // Desenha a data formatada
        ctx.fillText(formatDate(completionDate), dateConfig.x, dateConfig.y);

        // Converte para blob e faz upload
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Erro ao gerar imagem do certificado'));
            return;
          }

          // Upload para o Supabase Storage
          // Limpar nome do estudante para evitar caracteres inválidos
          const cleanStudentName = studentName
            .normalize('NFD') // Decompor caracteres acentuados
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^a-zA-Z0-9]/g, '_') // Remove caracteres especiais
            .replace(/_+/g, '_') // Remove underscores duplicados
            .replace(/^_|_$/g, '') // Remove underscores do início/fim
            .toLowerCase(); // Converter para minúsculas
          
          const fileName = `certificates/${cleanStudentName}_${Date.now()}.png`;
          console.log('📁 Nome original:', studentName);
          console.log('📁 Nome limpo:', cleanStudentName);
          console.log('📁 Nome do arquivo:', fileName);
          
          console.log('📤 Iniciando upload para:', fileName);
          console.log('📊 Tamanho do blob:', blob.size, 'bytes');
          console.log('📊 Tipo do blob:', blob.type);
          
          // Converter blob para base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;
              
              // Obter token de autenticação
              const { data: { session } } = await supabase.auth.getSession();
              
              if (!session) {
                reject(new Error('Usuário não autenticado'));
                return;
              }

              // Fazer upload através da API que usa service role
              const response = await fetch('/api/certificate-upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  fileName,
                  imageData: base64data
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro no upload:', errorData);
                reject(new Error(`Erro no upload: ${errorData.error || response.statusText}`));
                return;
              }

              const { url } = await response.json();
              console.log('✅ Upload realizado com sucesso:', url);
              resolve(url);
            } catch (error) {
              console.error('❌ Erro no processo de upload:', error);
              reject(error);
            }
          };
          
          reader.onerror = () => {
            console.error('❌ Erro ao ler blob');
            reject(new Error('Erro ao processar imagem'));
          };
          
          reader.readAsDataURL(blob);
        }, 'image/png');
      };

      backgroundImage.onerror = () => {
        reject(new Error('Erro ao carregar imagem de fundo'));
      };

      backgroundImage.src = template.backgroundImageUrl;
    });
  }

  /**
   * Obtém todos os certificados de um usuário
   */
  static async getUserCertificates(userId: string): Promise<Certificate[]> {
    console.log('🔍 Buscando certificados do usuário:', userId);
    
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses:course_id (
          title,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar certificados:', error);
      throw new Error(`Erro ao buscar certificados: ${error.message}`);
    }

    console.log('✅ Certificados encontrados:', data?.length || 0);
    console.log('📋 Dados dos certificados:', data);

    if (!data) {
      return [];
    }

    // Transformar dados do banco para o formato esperado
    const certificates = data.map(cert => {
      const transformed = {
        id: cert.id,
        userId: cert.user_id,
        courseId: cert.course_id,
        templateId: cert.template_id,
        studentName: cert.student_name,
        completionDate: cert.completion_date,
        certificateUrl: cert.certificate_url,
        secondPageUrl: cert.second_page_url,
        createdAt: cert.created_at
      };
      console.log('🔄 Certificado transformado:', transformed);
      return transformed;
    });
    
    console.log('✅ Certificados transformados:', certificates);
    return certificates;
  }

  /**
   * Obtém um certificado específico
   */
  static async getCertificate(certificateId: string): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses:course_id (
          title,
          description
        )
      `)
      .eq('id', certificateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar certificado: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Transformar dados do banco para o formato esperado
    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      templateId: data.template_id,
      studentName: data.student_name,
      completionDate: data.completion_date,
      certificateUrl: data.certificate_url,
      createdAt: data.created_at
    };
  }

  /**
   * Verifica se um usuário já possui certificado para um curso
   */
  static async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar certificado: ${error.message}`);
    }

    return !!data;
  }
}
