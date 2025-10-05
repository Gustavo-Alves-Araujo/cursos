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
    textConfig?: Record<string, unknown>
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
        text_config: textConfig || defaultTextConfig
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar template: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtém o template de certificado de um curso
   */
  static async getTemplateByCourseId(courseId: string): Promise<CertificateTemplate | null> {
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Template não encontrado
      }
      throw new Error(`Erro ao buscar template: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza um template de certificado
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<Pick<CertificateTemplate, 'backgroundImageUrl' | 'textConfig'>>
  ): Promise<CertificateTemplate> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.backgroundImageUrl) {
      updateData.background_image_url = updates.backgroundImageUrl;
    }
    
    if (updates.textConfig) {
      updateData.text_config = updates.textConfig;
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

    return data;
  }

  /**
   * Gera um certificado para um usuário
   */
  static async generateCertificate(
    userId: string,
    courseId: string,
    studentName: string,
    completionDate: string
  ): Promise<Certificate> {
    // Busca o template do curso
    const template = await this.getTemplateByCourseId(courseId);
    if (!template) {
      throw new Error('Template de certificado não encontrado para este curso');
    }

    // Gera a imagem do certificado
    const certificateImageUrl = await this.generateCertificateImage({
      studentName,
      completionDate,
      template
    });

    // Salva o certificado no banco
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        template_id: template.id,
        student_name: studentName,
        completion_date: completionDate,
        certificate_url: certificateImageUrl
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao salvar certificado: ${error.message}`);
    }

    return data;
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
        
        // Desenha a data
        ctx.fillText(completionDate, dateConfig.x, dateConfig.y);

        // Converte para blob e faz upload
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Erro ao gerar imagem do certificado'));
            return;
          }

          try {
            // Upload para o Supabase Storage
            const fileName = `certificates/${studentName.replace(/\s+/g, '_')}_${Date.now()}.png`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('certificates')
              .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: false
              });

            if (uploadError) {
              reject(new Error(`Erro no upload: ${uploadError.message}`));
              return;
            }

            // Obtém a URL pública
            const { data: urlData } = supabase.storage
              .from('certificates')
              .getPublicUrl(fileName);

            resolve(urlData.publicUrl);
          } catch (error) {
            reject(error);
          }
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
      throw new Error(`Erro ao buscar certificados: ${error.message}`);
    }

    return data || [];
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

    return data;
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
