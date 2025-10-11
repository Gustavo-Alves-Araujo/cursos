export type CertificateTemplate = {
  id: string;
  courseId: string;
  backgroundImageUrl: string;
  textConfig: {
    studentName: {
      x: number;
      y: number;
      fontSize: number;
      fontFamily: string;
      color: string;
      textAlign: 'left' | 'center' | 'right';
    };
    completionDate: {
      x: number;
      y: number;
      fontSize: number;
      fontFamily: string;
      color: string;
      textAlign: 'left' | 'center' | 'right';
    };
  };
  secondPageConfig?: {
    showSecondPage: boolean;
    programmaticContent: string;
    includeCpf: boolean;
    includeCourseName: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type Certificate = {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  completionDate: string;
  certificateUrl: string;
  secondPageUrl?: string;
  templateId: string;
  createdAt: string;
};

export type CertificateGenerationData = {
  studentName: string;
  completionDate: string;
  template: CertificateTemplate;
  studentCpf?: string;
  courseName?: string;
};

export type CertificateConfig = {
  width: number;
  height: number;
  defaultFontFamily: string;
  defaultFontSize: number;
  defaultTextColor: string;
};
