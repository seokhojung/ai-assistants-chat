import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, Modal, ModalHeader, ModalBody } from '../components/ui';
import api from '../services/api';

interface FileData {
  id: string;
  name: string;
  type: string;
  icon: string;
  size: string;
  lastModified: string;
  records: number;
  agent: string;
  status: string;
  description: string;
}

interface ExcelData {
  headers: string[];
  rows: (string | number)[][];
  sheets?: string[];
  currentSheet?: string;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  
  // Undo/Redo 히스토리 관리
  const [history, setHistory] = useState<ExcelData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    if (showPreviewModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPreviewModal, currentHistoryIndex, history.length]);

  // 파일 목록 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const excelFiles = [
      {
        id: 'members',
        name: '회원관리_20250624.xlsx',
        type: '회원관리',
        icon: '👥',
        size: '2.3 MB',
        lastModified: '2024-06-24 14:30',
        records: 5,
        agent: 'member',
        status: 'active',
        description: '회원 정보, 멤버십, 결제내역 관리'
      },
      {
        id: 'staff',
        name: '직원관리_20250624.xlsx',
        type: '직원관리',
        icon: '👷',
        size: '1.8 MB',
        lastModified: '2024-06-24 09:15',
        records: 3,
        agent: 'staff',
        status: 'active',
        description: '직원 정보, 스케줄, 근태 관리'
      },
      {
        id: 'hr',
        name: '인사관리_20250624.xlsx',
        type: '인사관리', 
        icon: '💼',
        size: '3.1 MB',
        lastModified: '2024-06-24 11:45',
        records: 89,
        agent: 'hr',
        status: 'active',
        description: '급여, 휴가, 교육, 평가 관리'
      },
      {
        id: 'inventory',
        name: '재고관리_20250624.xlsx',
        type: '재고관리',
        icon: '📦',
        size: '1.2 MB',
        lastModified: '2024-06-24 16:20',
        records: 356,
        agent: 'inventory',
        status: 'active',
        description: '장비, 보충제, 용품 재고 관리'
      }
    ];
    setFiles(excelFiles);
  }, []);

  // 파일 미리보기 데이터 로드
  const loadFilePreview = async (file: FileData) => {
    setLoading(true);
    try {
      const response = await api.get(`/files/preview?path=${encodeURIComponent(file.name)}`);
      
      if (response.data.data) {
        // 백엔드에서 받은 데이터를 테이블 형태로 변환
        const headers = response.data.data.length > 0 ? Object.keys(response.data.data[0]) : [];
        const rows = response.data.data.map((item: any) => headers.map(header => item[header]));
        
        const newExcelData = {
          headers,
          rows,
          sheets: ['데이터'], // 실제 API에서는 시트 정보도 받아와야 함
          currentSheet: '데이터'
        };
        setExcelData(newExcelData);
        setSelectedSheet('데이터');
        
        // 초기 데이터를 히스토리에 저장
        setHistory([JSON.parse(JSON.stringify(newExcelData))]);
        setCurrentHistoryIndex(0);
      } else {
        // 샘플 데이터 (백엔드 연결 실패 시)
        const sampleData = getSampleData(file.type, selectedSheet);
        setExcelData(sampleData);
        setSelectedSheet(sampleData.currentSheet || '');
        setHistory([JSON.parse(JSON.stringify(sampleData))]);
        setCurrentHistoryIndex(0);
      }
    } catch (error) {
      console.error('파일 미리보기 로드 실패:', error);
      // 샘플 데이터로 폴백
      const sampleData = getSampleData(file.type, selectedSheet);
      setExcelData(sampleData);
      setSelectedSheet(sampleData.currentSheet || '');
      setHistory([JSON.parse(JSON.stringify(sampleData))]);
      setCurrentHistoryIndex(0);
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 생성 (실제 Excel 구조 반영)
  const getSampleData = (fileType: string, sheetName?: string): ExcelData => {
    switch (fileType) {
      case '회원관리':
        const memberSheets = ['회원목록', '통계'];
        const currentMemberSheet = sheetName || memberSheets[0];
        
        if (currentMemberSheet === '회원목록') {
          return {
            headers: ['회원번호', '이름', '나이', '성별', '전화번호', '이메일', '주소', '직업', '멤버십타입', '월회비', '가입일', '만료일', '결제상태', '비상연락처', '특이사항'],
            rows: [
              [1, '김철수', 28, '남', '010-1234-5678', 'kim@email.com', '서울시 강남구', '직장인', '프리미엄', 120000, '2024-01-15', '2025-01-15', '완료', '010-1234-9999', '없음'],
              [2, '이영희', 25, '여', '010-2345-6789', 'lee@email.com', '서울시 서초구', '학생', '일반', 80000, '2024-02-01', '2025-02-01', '완료', '010-2345-9999', '없음'],
              [3, '박민수', 32, '남', '010-3456-7890', 'park@email.com', '서울시 송파구', '자영업', 'VIP', 200000, '2024-03-10', '2025-03-10', '완료', '010-3456-9999', '개인 트레이너 희망'],
              [4, '최지은', 29, '여', '010-4567-8901', 'choi@email.com', '서울시 관악구', '회사원', '프리미엄', 120000, '2024-04-05', '2025-04-05', '지연', '010-4567-9999', '무릎 수술 이력'],
              [5, '정대호', 35, '남', '010-5678-9012', 'jung@email.com', '서울시 마포구', '의사', 'VIP', 200000, '2024-05-20', '2025-05-20', '완료', '010-5678-9999', '새벽 운동 선호']
            ],
            sheets: memberSheets,
            currentSheet: currentMemberSheet
          };
        } else {
          return {
            headers: ['항목', '값'],
            rows: [
              ['총회원수', 5],
              ['활성회원', 5],
              ['프리미엄', 2],
              ['일반', 1],
              ['VIP', 2],
              ['남성', 3],
              ['여성', 2],
              ['총월매출', 720000]
            ],
            sheets: memberSheets,
            currentSheet: currentMemberSheet
          };
        }
        
      case '직원관리':
        return {
          headers: ['직원번호', '이름', '나이', '성별', '전화번호', '이메일', '직책', '부서', '입사일', '근무상태', '자격증', '특이사항', '월급여'],
          rows: [
            [1, '홍길동', 30, '남', '010-1111-2222', 'hong@gym.com', '트레이너', '헬스', '2023-01-10', '활성', '생활스포츠지도사', '없음', 3500000],
            [2, '김영수', 27, '남', '010-3333-4444', 'kim@gym.com', '수영강사', '수영', '2023-03-15', '활성', '수영지도자', '없음', 3200000],
            [3, '박지훈', 35, '남', '010-5555-6666', 'park@gym.com', '매니저', '관리', '2022-06-01', '활성', '경영학사', '없음', 4500000],
            [4, '이미영', 28, '여', '010-7777-8888', 'lee@gym.com', '트레이너', '헬스', '2023-09-20', '활성', '생활스포츠지도사', '없음', 3500000],
            [5, '최순이', 45, '여', '010-9999-0000', 'choi@gym.com', '청소원', '시설', '2024-01-05', '활성', '없음', '없음', 2200000]
          ],
          sheets: ['직원목록'],
          currentSheet: '직원목록'
        };
        
      case '인사관리':
        return {
          headers: ['직원번호', '이름', '부서', '연차사용', '총연차', '잔여연차', '월근무시간', '초과근무', '야간근무', '평가점수', '상벌내역', '교육이수'],
          rows: [
            [1, '홍길동', '헬스', 5, 15, 10, 160, 20, 0, 4.5, '우수직원상', 'CPR 교육 완료'],
            [2, '김영수', '수영', 3, 15, 12, 160, 15, 8, 4.2, '없음', '안전교육 완료'],
            [3, '박지훈', '관리', 10, 15, 5, 168, 30, 0, 4.8, '모범직원상', '관리자 교육 완료'],
            [4, '이미영', '헬스', 7, 15, 8, 160, 18, 0, 4.3, '없음', 'CPR 교육 완료'],
            [5, '최순이', '시설', 2, 15, 13, 160, 5, 16, 4.0, '없음', '안전교육 완료']
          ],
          sheets: ['인사현황'],
          currentSheet: '인사현황'
        };
        
      case '재고관리':
        return {
          headers: ['품목코드', '품목명', '카테고리', '현재재고', '최소재고', '단위', '단가', '총가치', '공급업체', '최종입고일', '상태'],
          rows: [
            ['EQ001', '덤벨 20kg', '운동기구', 15, 10, '개', 150000, 2250000, '피트니스월드', '2024-05-15', '정상'],
            ['SP001', '프로틴 파우더', '보충제', 25, 20, '통', 45000, 1125000, '뉴트리온', '2024-06-10', '정상'],
            ['CL001', '수건', '청소용품', 80, 50, '개', 5000, 400000, '클린텍스', '2024-06-20', '정상'],
            ['EQ002', '러닝머신 벨트', '운동기구', 3, 5, '개', 200000, 600000, '러닝텍', '2024-04-20', '부족'],
            ['SP002', 'BCAA', '보충제', 12, 15, '병', 35000, 420000, '뉴트리온', '2024-05-25', '부족']
          ],
          sheets: ['재고현황'],
          currentSheet: '재고현황'
        };
        
      default:
        return {
          headers: ['항목', '값'],
          rows: [
            ['데이터1', '100'],
            ['데이터2', '200']
          ],
          sheets: ['기본'],
          currentSheet: '기본'
        };
    }
  };

  // 파일 편집 모달 열기
  const handleEditFile = async (file: FileData) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
    setHasChanges(false);
    await loadFilePreview(file);
  };

  // 히스토리에 현재 상태 저장
  const saveToHistory = (data: ExcelData) => {
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(data))); // 깊은 복사
    
    // 히스토리 크기 제한 (최대 50개)
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setCurrentHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  };

  // Undo 기능
  const undo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1);
      setExcelData(history[currentHistoryIndex - 1]);
      setHasChanges(true);
    }
  };

  // Redo 기능
  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(prev => prev + 1);
      setExcelData(history[currentHistoryIndex + 1]);
      setHasChanges(true);
    }
  };

  // 셀 편집 시작
  const startCellEdit = (rowIndex: number, colIndex: number, value: string | number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditValue(String(value));
  };

  // 헤더 편집 시작
  const startHeaderEdit = (headerIndex: number, value: string) => {
    setEditingHeader(headerIndex);
    setEditValue(value);
  };

  // 셀 편집 완료
  const finishCellEdit = () => {
    if (editingCell && excelData) {
      // 변경 전 상태를 히스토리에 저장
      saveToHistory(excelData);
      
      const newRows = [...excelData.rows];
      newRows[editingCell.row][editingCell.col] = editValue;
      const newExcelData = { ...excelData, rows: newRows };
      setExcelData(newExcelData);
      setHasChanges(true);
    }
    setEditingCell(null);
    setEditValue('');
  };

  // 헤더 편집 완료
  const finishHeaderEdit = () => {
    if (editingHeader !== null && excelData) {
      // 변경 전 상태를 히스토리에 저장
      saveToHistory(excelData);
      
      const newHeaders = [...excelData.headers];
      newHeaders[editingHeader] = editValue;
      const newExcelData = { ...excelData, headers: newHeaders };
      setExcelData(newExcelData);
      setHasChanges(true);
    }
    setEditingHeader(null);
    setEditValue('');
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditingCell(null);
    setEditingHeader(null);
    setEditValue('');
  };

  // 변경사항 저장
  const saveChanges = async () => {
    if (!selectedFile || !excelData) return;

    setLoading(true);
    try {
      // 백엔드가 기대하는 형식으로 데이터 변환
      const currentSheetName = selectedSheet || excelData.currentSheet || '시트1';
      
      // 헤더와 데이터를 하나의 배열로 합치기
      const sheetData = [
        excelData.headers,  // 첫 번째 행은 헤더
        ...excelData.rows   // 나머지 행은 데이터
      ];
      
      const dataToSave = {
        sheets: {
          [currentSheetName]: {
            data: sheetData
          }
        }
      };

      console.log('📤 저장할 데이터:', dataToSave);

      // API 경로를 백엔드 형식에 맞게 수정 
      const encodedFileName = encodeURIComponent(selectedFile.name);
      
      // baseURL이 /api/v1이므로 /files/save 로 호출하면 /api/v1/files/save가 됨
      const response = await api.post(`/files/save/${encodedFileName}`, dataToSave);

      console.log('✅ 저장 응답:', response.data);
      
      setHasChanges(false);
      alert('변경사항이 저장되었습니다! 🎉');
    } catch (error: any) {
      console.error('❌ 저장 실패:', error);
      if (error.response) {
        console.error('응답 데이터:', error.response.data);
        console.error('응답 상태:', error.response.status);
      }
      alert(`저장에 실패했습니다: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 시트 변경
  const changeSheet = (sheetName: string) => {
    if (!selectedFile) return;
    
    setSelectedSheet(sheetName);
    const newData = getSampleData(selectedFile.type, sheetName);
    setExcelData(newData);
    setHistory([JSON.parse(JSON.stringify(newData))]);
    setCurrentHistoryIndex(0);
    setHasChanges(false);
  };

  // 행 추가
  const addRow = () => {
    if (!excelData) return;
    
    // 변경 전 상태를 히스토리에 저장
    saveToHistory(excelData);
    
    const newRow = excelData.headers.map(() => '');
    const newRows = [...excelData.rows, newRow];
    setExcelData({ ...excelData, rows: newRows });
    setHasChanges(true);
  };

  // 행 삭제
  const deleteRow = (rowIndex: number) => {
    if (!excelData || excelData.rows.length <= 1) return;
    
    if (confirm('이 행을 정말 삭제하시겠습니까?')) {
      // 변경 전 상태를 히스토리에 저장
      saveToHistory(excelData);
      
      const newRows = excelData.rows.filter((_, index) => index !== rowIndex);
      setExcelData({ ...excelData, rows: newRows });
      setHasChanges(true);
    }
  };

  // 열 추가
  const addColumn = () => {
    if (!excelData) return;
    
    const columnName = prompt('새 열의 이름을 입력하세요:', `새 컬럼${excelData.headers.length + 1}`);
    if (!columnName) return;
    
    // 변경 전 상태를 히스토리에 저장
    saveToHistory(excelData);
    
    const newHeaders = [...excelData.headers, columnName];
    const newRows = excelData.rows.map(row => [...row, '']);
    setExcelData({ headers: newHeaders, rows: newRows });
    setHasChanges(true);
  };

  // 열 삭제
  const deleteColumn = (colIndex: number) => {
    if (!excelData || excelData.headers.length <= 1) return;
    
    if (confirm(`'${excelData.headers[colIndex]}' 열을 정말 삭제하시겠습니까?`)) {
      // 변경 전 상태를 히스토리에 저장
      saveToHistory(excelData);
      
      const newHeaders = excelData.headers.filter((_, index) => index !== colIndex);
      const newRows = excelData.rows.map(row => row.filter((_, index) => index !== colIndex));
      setExcelData({ headers: newHeaders, rows: newRows });
      setHasChanges(true);
    }
  };

  // 파일 다운로드
  const handleDownload = async (file: FileData) => {
    try {
      const response = await api.get(`/files/download?path=${encodeURIComponent(file.name)}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('다운로드에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'updating': return 'warning';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 상단 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-display-lg font-bold text-gray-900 mb-2">
                📁 Excel 파일 관리
              </h1>
              <p className="text-body-lg text-gray-600">
                헬스장 운영 데이터를 실시간으로 편집하고 관리합니다
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                className="btn-secondary"
              >
                {viewMode === 'grid' ? '📋 표 보기' : '🔲 격자 보기'}
              </Button>
              <Button className="btn-primary">
                📊 전체 백업
              </Button>
            </div>
          </div>
          
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-elevated">
              <CardBody className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-title-md font-bold text-primary-600">
                  {files.length}
                </div>
                <div className="text-body-sm text-gray-600">활성 파일</div>
              </CardBody>
            </Card>
            
            <Card className="card-elevated">
              <CardBody className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-title-md font-bold text-success-600">
                  {files.reduce((sum, file) => sum + file.records, 0).toLocaleString()}
                </div>
                <div className="text-body-sm text-gray-600">총 레코드</div>
              </CardBody>
            </Card>

            <Card className="card-elevated">
              <CardBody className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-title-md font-bold text-gym-orange">
                  LIVE
                </div>
                <div className="text-body-sm text-gray-600">실시간 편집</div>
              </CardBody>
            </Card>

            <Card className="card-elevated">
              <CardBody className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-title-md font-bold text-warning-600">
                  AUTO
                </div>
                <div className="text-body-sm text-gray-600">자동 백업</div>
              </CardBody>
            </Card>
          </div>
        </div>
        
        {/* 파일 목록 - 그리드 뷰 */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {files.map((file) => (
              <Card key={file.id} className="card-elevated">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{file.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-title-md font-semibold mb-1">
                        {file.type}
                      </h3>
                      <p className="text-body-sm text-gray-600">
                        {file.description}
                      </p>
                    </div>
                    <Badge className={`badge-${getStatusColor(file.status)}`}>
                      {file.status === 'active' ? '활성' : '대기'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-body-sm">
                      <div>
                        <div className="text-gray-500">파일명</div>
                        <div className="font-medium truncate">{file.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">크기</div>
                        <div className="font-medium">{file.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">레코드</div>
                        <div className="font-medium">{file.records.toLocaleString()}개</div>
                      </div>
                      <div>
                        <div className="text-gray-500">수정일</div>
                        <div className="font-medium">{file.lastModified.split(' ')[0]}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditFile(file)}
                        className="btn-primary flex-1"
                      >
                        ✏️ 편집
                      </Button>
                      <Button
                        onClick={() => handleDownload(file)}
                        className="btn-secondary"
                      >
                        📥
                      </Button>
                      <Link to={`/chat/${file.agent}`}>
                        <Button className="btn-gym">
                          🤖
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* 파일 목록 - 테이블 뷰 */}
        {viewMode === 'table' && (
          <Card className="card-elevated">
            <CardHeader>
              <h3 className="text-title-lg font-semibold">파일 상세 목록</h3>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-900">파일</th>
                      <th className="text-left p-3 font-medium text-gray-900">타입</th>
                      <th className="text-left p-3 font-medium text-gray-900">크기</th>
                      <th className="text-left p-3 font-medium text-gray-900">레코드</th>
                      <th className="text-left p-3 font-medium text-gray-900">수정일</th>
                      <th className="text-left p-3 font-medium text-gray-900">상태</th>
                      <th className="text-left p-3 font-medium text-gray-900">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{file.icon}</span>
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-body-sm text-gray-500">
                                {file.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className="badge-primary">
                            {file.type}
                          </Badge>
                        </td>
                        <td className="p-3">{file.size}</td>
                        <td className="p-3">{file.records.toLocaleString()}개</td>
                        <td className="p-3">{file.lastModified}</td>
                        <td className="p-3">
                          <Badge className={`badge-${getStatusColor(file.status)}`}>
                            {file.status === 'active' ? '활성' : '대기'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEditFile(file)}
                              className="btn-ghost btn-sm"
                            >
                              ✏️
                            </Button>
                            <Button
                              onClick={() => handleDownload(file)}
                              className="btn-ghost btn-sm"
                            >
                              📥
                            </Button>
                            <Link to={`/chat/${file.agent}`}>
                              <Button className="btn-ghost btn-sm">
                                🤖
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 파일 편집 미리보기 모달 */}
        {showPreviewModal && selectedFile && (
          <Modal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            size="full"
          >
            <ModalHeader onClose={() => setShowPreviewModal(false)}>
              <h2 className="text-title-lg font-semibold">📝 {selectedFile.name} 편집</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
              {/* 시트 탭 */}
              {excelData?.sheets && excelData.sheets.length > 1 && (
                <div className="border-b border-gray-200">
                  <div className="flex space-x-1">
                    {excelData.sheets.map((sheetName) => (
                      <button
                        key={sheetName}
                        onClick={() => changeSheet(sheetName)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                          selectedSheet === sheetName
                            ? 'text-blue-600 border-blue-600 bg-blue-50'
                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📊 {sheetName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 상단 도구 모음 */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{selectedFile.icon}</div>
                  <div>
                    <h4 className="font-semibold">{selectedFile.type}</h4>
                    <p className="text-body-sm text-gray-600">{selectedFile.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <Badge className="badge-warning">
                      변경됨
                    </Badge>
                  )}
                  <Button
                    onClick={saveChanges}
                    disabled={!hasChanges || loading}
                    className="btn-gym"
                  >
                    {loading ? '저장 중...' : '💾 저장'}
                  </Button>
                  <Button
                    onClick={() => setShowPreviewModal(false)}
                    className="btn-secondary"
                  >
                    닫기
                  </Button>
                </div>
              </div>

                              {/* Excel 데이터 테이블 */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="spinner"></div>
                    <p className="mt-2">데이터를 불러오는 중...</p>
                  </div>
                ) : excelData ? (
                  <div className="space-y-4">
                    {/* 테이블 조작 버튼 */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      {/* Undo/Redo 버튼 */}
                      <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
                        <Button
                          onClick={undo}
                          disabled={currentHistoryIndex <= 0}
                          className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="실행 취소 (Ctrl+Z)"
                        >
                          ↶ 되돌리기
                        </Button>
                        <Button
                          onClick={redo}
                          disabled={currentHistoryIndex >= history.length - 1}
                          className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="다시 실행 (Ctrl+Y)"
                        >
                          ↷ 다시하기
                        </Button>
                      </div>
                      
                      <Button
                        onClick={addColumn}
                        className="btn-primary btn-sm"
                      >
                        ➕ 열 추가
                      </Button>
                      <Button
                        onClick={addRow}
                        className="btn-primary btn-sm"
                      >
                        ➕ 행 추가
                      </Button>
                      <div className="text-body-sm text-gray-600 ml-auto flex items-center gap-4">
                        <span>
                          총 {excelData.rows.length}행 × {excelData.headers.length}열
                        </span>
                        {history.length > 1 && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            히스토리: {currentHistoryIndex + 1}/{history.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg" style={{maxWidth: '100%'}}>
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-gray-100 z-10 shadow-md border-b-2 border-gray-300">
                                                      <tr>
                                                              <th className="border border-gray-300 p-2 w-12 text-center bg-gray-100 sticky top-0 z-20" style={{backgroundColor: '#f3f4f6'}}>
                                  #
                                </th>
                                {excelData.headers.map((header, index) => (
                                                                    <th key={index} className="border border-gray-300 p-2 text-left font-medium relative group min-w-20 max-w-40 bg-gray-100 sticky top-0 z-20" style={{backgroundColor: '#f3f4f6'}}>
                                    <div className="flex items-center justify-between">
                                      {editingHeader === index ? (
                                        <input
                                          type="text"
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="w-full border-none outline-none bg-transparent font-medium text-sm"
                                          onBlur={finishHeaderEdit}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') finishHeaderEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                          }}
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="cursor-pointer hover:bg-blue-100 px-1 py-0.5 rounded text-sm"
                                          onClick={() => startHeaderEdit(index, header)}
                                          title="클릭하여 편집"
                                        >
                                          {header}
                                        </span>
                                      )}
                                      <button
                                        onClick={() => deleteColumn(index)}
                                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
                                        title="열 삭제"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </th>
                            ))}
                                                          <th className="border border-gray-300 p-2 w-12 text-center bg-gray-100 sticky top-0 z-20" style={{backgroundColor: '#f3f4f6'}}>
                                <button
                                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                                  title="전체 행 삭제 모드"
                                >
                                  🗑️
                                </button>
                              </th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 group">
                              <td className="border border-gray-300 p-2 text-center text-gray-500 font-mono text-sm">
                                {rowIndex + 1}
                              </td>
                              {row.map((cell, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="border border-gray-300 p-2 cursor-pointer hover:bg-blue-50 relative min-w-20 max-w-40"
                                  onClick={() => startCellEdit(rowIndex, colIndex, cell)}
                                >
                                  {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={finishCellEdit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') finishCellEdit();
                                        if (e.key === 'Escape') cancelEdit();
                                      }}
                                      className="w-full p-1 border border-blue-500 rounded"
                                      autoFocus
                                    />
                                  ) : (
                                    <span className="block w-full h-full">{cell || '-'}</span>
                                  )}
                                </td>
                              ))}
                              <td className="border border-gray-300 p-2 text-center">
                                <button
                                  onClick={() => deleteRow(rowIndex)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded"
                                  title="행 삭제"
                                  disabled={excelData.rows.length <= 1}
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    데이터를 불러올 수 없습니다.
                  </div>
                )}

              {/* 편집 도움말 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">💡 편집 가이드</h5>
                <ul className="text-body-sm text-gray-600 space-y-1">
                  <li>• 테이블 헤더(컬럼명)를 클릭하여 이름을 변경할 수 있습니다</li>
                  <li>• 데이터 셀을 클릭하여 직접 편집할 수 있습니다</li>
                  <li>• Enter 키로 편집 완료, ESC 키로 편집 취소가 가능합니다</li>
                  <li>• 변경사항은 '저장' 버튼을 눌러야 실제로 저장됩니다</li>
                  <li>• 실시간으로 AI 에이전트가 변경된 데이터를 활용합니다</li>
                </ul>
              </div>
            </div>
            </ModalBody>
           </Modal>
         )}
      </div>
    </div>
  );
};

export default FileManager; 