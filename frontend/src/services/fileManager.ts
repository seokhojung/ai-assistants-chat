import api from './api';

export interface FileInfo {
  name: string;
  category: string;
  path: string;
  size: number;
  modified: string;
  type: string;
}

export interface FilePreview {
  filename: string;
  sheets: Record<string, {
    data: string[][];
    total_rows: number;
    total_cols: number;
  }>;
  sheet_names: string[];
}

export interface FileUploadData {
  filename: string;
  category: string;
  content: string; // base64 encoded
}

export interface FileSaveData {
  sheets: Record<string, {
    data: string[][];
  }>;
}

export const fileManagerApi = {
  // 파일 목록 조회
  async getFiles(): Promise<{ files: FileInfo[]; total: number }> {
    const response = await api.get('/files');
    return response.data;
  },

  // 파일 다운로드
  async downloadFile(filePath: string): Promise<Blob> {
    // 파일 경로에서 category/filename 형태로 변환
    const encodedPath = encodeURIComponent(filePath);
    // API 베이스 URL 가져오기
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:8000/api/v1' 
      : 'https://ai-assistants-chat.onrender.com/api/v1';
    const response = await fetch(`${baseUrl}/files/download/${encodedPath}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('다운로드 오류:', errorText);
      throw new Error(`파일 다운로드에 실패했습니다: ${response.status}`);
    }
    
    return response.blob();
  },

  // 파일 미리보기
  async previewFile(filePath: string): Promise<FilePreview> {
    // 파일 경로 인코딩
    const encodedPath = encodeURIComponent(filePath);
    const response = await api.get(`/files/preview/${encodedPath}`);
    return response.data;
  },

  // 파일 업로드
  async uploadFile(data: FileUploadData): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/files/upload', data);
    return response.data;
  },

  // 파일 저장 (수정된 데이터)
  async saveFile(filePath: string, data: FileSaveData): Promise<{ success: boolean; message: string }> {
    const encodedPath = encodeURIComponent(filePath);
    const response = await api.post(`/files/save/${encodedPath}`, data);
    return response.data;
  },

  // 파일을 base64로 변환
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // data:application/... 부분 제거하고 순수 base64만 반환
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
}; 