import React, { useState, useEffect, useCallback } from 'react';
import type { FileInfo, FilePreview } from '../services/fileManager';
import { fileManagerApi } from '../services/fileManager';

// 📊 타입 정의 개선
interface SheetData {
  data: (string | number | null)[][];
  total_rows: number;
  total_cols: number;
}

interface OptimizedFilePreview extends Omit<FilePreview, 'sheets'> {
  sheets: Record<string, SheetData>;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [preview, setPreview] = useState<OptimizedFilePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeSheetName, setActiveSheetName] = useState<string>('');
  const [editingCell, setEditingCell] = useState<{sheetName: string, rowIndex: number, colIndex: number} | null>(null);
  const [editedData, setEditedData] = useState<Record<string, SheetData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempInputValue, setTempInputValue] = useState('');
  const [originalRowCount, setOriginalRowCount] = useState<Record<string, number>>({});

  // 🔄 useCallback으로 함수 최적화
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/v1/files');
      if (!response.ok) {
        throw new Error('파일 목록을 불러올 수 없습니다');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handlePreview = useCallback(async (file: FileInfo) => {
    try {
      setPreviewLoading(true);
      setSelectedFile(file);
      setError(null);
      
      const previewData = await fileManagerApi.previewFile(file.path);
      setPreview(previewData as OptimizedFilePreview);
      
      // 원본 행 수 기록
      const originalCounts: Record<string, number> = {};
      Object.entries(previewData.sheets).forEach(([sheetName, sheet]) => {
        originalCounts[sheetName] = sheet.total_rows;
      });
      setOriginalRowCount(originalCounts);
      
      // 첫 번째 시트를 기본 활성 시트로 설정
      if (previewData.sheet_names.length > 0) {
        setActiveSheetName(previewData.sheet_names[0]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '파일 미리보기에 실패했습니다.';
      alert(errorMessage);
      console.error('미리보기 오류:', err);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleDownload = useCallback(async (file: FileInfo) => {
    try {
      const blob = await fileManagerApi.downloadFile(file.path);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '파일 다운로드에 실패했습니다.';
      alert(errorMessage);
      console.error('다운로드 오류:', err);
    }
  }, []);

  // 🔧 유틸리티 함수들 최적화
  const getCategoryInfo = useCallback((category: string) => {
    const categoryMap: Record<string, { name: string; icon: string; color: string; bgColor: string }> = {
      members: { 
        name: '회원관리', 
        icon: '👥', 
        color: 'text-blue-700', 
        bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
      },
      staff: { 
        name: '직원관리', 
        icon: '👨‍💼', 
        color: 'text-green-700', 
        bgColor: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
      },
      hr: { 
        name: '인사관리', 
        icon: '📋', 
        color: 'text-purple-700', 
        bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
      },
      inventory: { 
        name: '재고관리', 
        icon: '📦', 
        color: 'text-orange-700', 
        bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
      }
    };
    return categoryMap[category] || { 
      name: category, 
      icon: '📄', 
      color: 'text-gray-700', 
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
    };
  }, []);

  const closePreview = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setActiveSheetName('');
    setEditingCell(null);
    setEditedData({});
    setHasChanges(false);
    setEditMode(false);
    setTempInputValue('');
    setOriginalRowCount({});
  }, []);

  const handleAddRow = useCallback((sheetName: string) => {
    setEditedData(prev => {
      const currentSheet = editedData[sheetName] || preview?.sheets[sheetName];
      if (!currentSheet) return prev;

      const headers = currentSheet.data[0] || [];
      const newRow = headers.map(() => ''); // 빈 값으로 새 행 생성

      const updatedSheet = {
        ...currentSheet,
        data: [...currentSheet.data, newRow],
        total_rows: currentSheet.total_rows + 1
      };

      const newData = {
        ...prev,
        [sheetName]: updatedSheet
      };

      setHasChanges(true);
      return newData;
    });
  }, [editedData, preview]);

  const handleAddColumn = useCallback((sheetName: string) => {
    setEditedData(prev => {
      const currentSheet = editedData[sheetName] || preview?.sheets[sheetName];
      if (!currentSheet) return prev;

      const updatedData = currentSheet.data.map((row, index) => {
        if (index === 0) {
          // 헤더 행에 새 컬럼 추가
          return [...row, `새 컬럼 ${row.length + 1}`];
        } else {
          // 데이터 행에 빈 값 추가
          return [...row, ''];
        }
      });

      const updatedSheet = {
        ...currentSheet,
        data: updatedData,
        total_cols: currentSheet.total_cols + 1
      };

      const newData = {
        ...prev,
        [sheetName]: updatedSheet
      };

      setHasChanges(true);
      return newData;
    });
  }, [editedData, preview]);

  const handleDeleteRow = useCallback((sheetName: string, rowIndex: number) => {
    setEditedData(prev => {
      const currentSheet = editedData[sheetName] || preview?.sheets[sheetName];
      if (!currentSheet || currentSheet.data.length <= 2) return prev; // 헤더 + 최소 1개 데이터 행 유지

      const updatedData = currentSheet.data.filter((_, index) => index !== rowIndex);

      const updatedSheet = {
        ...currentSheet,
        data: updatedData,
        total_rows: currentSheet.total_rows - 1
      };

      const newData = {
        ...prev,
        [sheetName]: updatedSheet
      };

      setHasChanges(true);
      return newData;
    });
  }, [editedData, preview]);

  const handleDeleteColumn = useCallback((sheetName: string, colIndex: number) => {
    setEditedData(prev => {
      const currentSheet = editedData[sheetName] || preview?.sheets[sheetName];
      if (!currentSheet || (currentSheet.data[0]?.length || 0) <= 1) return prev; // 최소 1개 컬럼 유지

      const updatedData = currentSheet.data.map(row => 
        row.filter((_, index) => index !== colIndex)
      );

      const updatedSheet = {
        ...currentSheet,
        data: updatedData,
        total_cols: currentSheet.total_cols - 1
      };

      const newData = {
        ...prev,
        [sheetName]: updatedSheet
      };

      setHasChanges(true);
      return newData;
    });
  }, [editedData, preview]);

  const handleCellEdit = useCallback((sheetName: string, rowIndex: number, colIndex: number, newValue: string) => {
    setEditedData(prev => {
      const currentSheet = editedData[sheetName] || preview?.sheets[sheetName];
      if (!currentSheet) return prev;

      const updatedSheet = {
        ...currentSheet,
        data: currentSheet.data.map((row, rIdx) => 
          rIdx === rowIndex 
            ? row.map((cell, cIdx) => cIdx === colIndex ? newValue : cell)
            : row
        )
      };

      const newData = {
        ...prev,
        [sheetName]: updatedSheet
      };

      setHasChanges(true);
      return newData;
    });
  }, [editedData, preview]);



  const handleSaveChanges = useCallback(async () => {
    if (!selectedFile || !hasChanges) return;

    setSaving(true);
    try {
      const dataToSave = Object.keys(editedData).length > 0 ? editedData : preview?.sheets || {};

      const response = await fetch(`/api/v1/files/save/${encodeURIComponent(selectedFile.path)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheets: dataToSave
        })
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다');
      }

      await response.json();
      alert('✅ 파일이 성공적으로 저장되었습니다!');
      setHasChanges(false);  
      setEditedData({});
      
      setPreview(prev => prev ? {
        ...prev,
        sheets: dataToSave
      } : null);
      
      const newOriginalCounts: Record<string, number> = {};
      Object.entries(dataToSave).forEach(([sheetName, sheet]) => {
        newOriginalCounts[sheetName] = sheet.total_rows;
      });
      setOriginalRowCount(newOriginalCounts);
      
      loadFiles();
      
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ 저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  }, [selectedFile, hasChanges, editedData, preview, loadFiles]);

  // 🎯 렌더링 컴포넌트들
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700">로딩 중...</p>
        <p className="text-sm text-gray-500 mt-1">파일을 불러오고 있습니다</p>
      </div>
    </div>
  );

  const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">❌</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">문제가 발생했습니다</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <span className="mr-2">🔄</span>
        다시 시도
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
        <span className="text-6xl">📂</span>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">파일이 없습니다</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        아직 업로드된 Excel 파일이 없습니다.<br />
        파일을 업로드하면 여기에 표시됩니다.
      </p>
    </div>
  );

  // 🎨 파일 카드 컴포넌트 - 심플하고 단정한 디자인
  const FileCard: React.FC<{ file: FileInfo; onPreview: (file: FileInfo) => void; onDownload: (file: FileInfo) => void }> = ({ 
    file, 
    onPreview, 
    onDownload 
  }) => {
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'members': return '👥';
        case 'staff': return '👨‍💼';
        case 'hr': return '📋';
        case 'inventory': return '📦';
        default: return '📄';
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'members': return 'from-blue-500 to-blue-600';
        case 'staff': return 'from-green-500 to-green-600';
        case 'hr': return 'from-purple-500 to-purple-600';
        case 'inventory': return 'from-orange-500 to-orange-600';
        default: return 'from-gray-500 to-gray-600';
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(file.category)} rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0`}>
              {getCategoryIcon(file.category)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(file.modified).toLocaleDateString('ko-KR', {
                  year: '2-digit',
                  month: '2-digit', 
                  day: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2 ml-4 flex-shrink-0">
            <button
              onClick={() => onPreview(file)}
              className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>미리보기</span>
            </button>
            <button
              onClick={() => onDownload(file)}
              className="group relative px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>다운로드</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 📋 테이블 데이터 렌더링 컴포넌트 - 편집 가능
  const TablePreview = ({ sheetData, sheetName }: { sheetData: SheetData; sheetName: string }) => {
    const currentData = editedData[sheetName] || sheetData;
    
    if (!currentData || !currentData.data || currentData.data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500">데이터가 없습니다.</p>
        </div>
      );
    }

    const headers = currentData.data[0] || [];
    const rows = currentData.data.slice(1);

    return (
      <div>
        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
          <div className="text-sm text-gray-600">
            📊 총 {currentData.total_rows}개 행, {currentData.total_cols}개 열
            {hasChanges && <span className="ml-2 text-orange-600 font-medium">● 변경사항 있음</span>}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 편집 모드 토글 버튼 */}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                editMode 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{editMode ? '편집 종료' : '편집 모드'}</span>
            </button>

            {/* 열 추가 버튼 */}
            {editMode && (
              <button
                onClick={() => handleAddColumn(sheetName)}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>열 추가</span>
              </button>
            )}

            {/* 새 행 추가 버튼 */}
            {editMode && (
              <button
                onClick={() => handleAddRow(sheetName)}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>행 추가</span>
              </button>
            )}

            {/* 저장 버튼 */}
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>저장</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* 가로 스크롤 컨테이너 */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {editMode && (
                  <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                    작업
                  </th>
                )}
                {headers.map((header, index) => (
                  <th key={`header-${index}-${String(header)}`} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left border-r border-gray-200 relative group">
                    <div className="flex items-center justify-between">
                      {editingCell?.sheetName === sheetName && editingCell?.rowIndex === 0 && editingCell?.colIndex === index ? (
                        <input
                          type="text"
                          value={tempInputValue}
                          onChange={(e) => setTempInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(sheetName, 0, index, tempInputValue);
                              setEditingCell(null);
                              setTempInputValue('');
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                              setTempInputValue('');
                            }
                          }}
                          onBlur={() => {
                            handleCellEdit(sheetName, 0, index, tempInputValue);
                            setEditingCell(null);
                            setTempInputValue('');
                          }}
                          className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span 
                          onClick={() => {
                            if (editMode) {
                              setEditingCell({ sheetName, rowIndex: 0, colIndex: index });
                              setTempInputValue(String(header));
                            }
                          }}
                          className={editMode ? "cursor-pointer hover:bg-gray-100 px-1 rounded" : ""}
                        >
                          {header ? String(header) : `컬럼 ${index + 1}`}
                        </span>
                      )}
                      {editMode && (
                        <button
                          onClick={() => handleDeleteColumn(sheetName, index)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                          title="열 삭제"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIndex) => {
                const actualRowIndex = rowIndex + 1;
                const isNewRow = actualRowIndex >= (originalRowCount[sheetName] || 0);
                
                return (
                  <tr key={`row-${rowIndex}`} className={`hover:bg-gray-50 ${isNewRow ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}>
                    {editMode && (
                      <td className="px-2 py-2 text-center border-r border-gray-200">
                        <button
                          onClick={() => handleDeleteRow(sheetName, actualRowIndex)}
                          className="text-red-500 hover:text-red-700 font-bold"
                          title="행 삭제"
                        >
                          ×
                        </button>
                      </td>
                    )}
                    {row.map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {editingCell?.sheetName === sheetName && editingCell?.rowIndex === actualRowIndex && editingCell?.colIndex === cellIndex ? (
                          <input
                            type="text"
                            value={tempInputValue}
                            onChange={(e) => setTempInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellEdit(sheetName, actualRowIndex, cellIndex, tempInputValue);
                                setEditingCell(null);
                                setTempInputValue('');
                              } else if (e.key === 'Escape') {
                                setEditingCell(null);
                                setTempInputValue('');
                              }
                            }}
                            onBlur={() => {
                              handleCellEdit(sheetName, actualRowIndex, cellIndex, tempInputValue);
                              setEditingCell(null);
                              setTempInputValue('');
                            }}
                            className="w-32 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => {
                              if (editMode) {
                                setEditingCell({ sheetName, rowIndex: actualRowIndex, colIndex: cellIndex });
                                setTempInputValue(String(cell || ''));
                              }
                            }}
                            className={editMode ? "cursor-pointer hover:bg-gray-100 px-1 rounded min-h-[20px] block" : ""}
                          >
                            {cell !== null && cell !== undefined && cell !== '' ? String(cell) : (
                              isNewRow ? (
                                <span className="text-gray-400 italic">새 데이터 입력</span>
                              ) : '-'
                            )}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 편집 도움말 */}
        {editMode && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            💡 <strong>편집 팁:</strong> 셀을 클릭하여 편집, Enter로 저장, Esc로 취소 | 행/열 삭제는 ×버튼 클릭
          </div>
        )}
      </div>
    );
  };

  // 🎭 메인 렌더링
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto p-6">
          <ErrorDisplay message={error} onRetry={loadFiles} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 섹션 - 개선된 디자인 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl text-white">📁</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            파일 관리 시스템
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Excel 파일을 쉽고 빠르게 관리하세요. 미리보기와 다운로드 기능을 제공합니다.
          </p>
        </div>

        {files.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <FileCard
                key={`${file.category}-${file.name}-${file.modified}`}
                file={file}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* 🔍 미리보기 모달 */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedFile.name}</h2>
                  <p className="text-sm text-gray-600">{getCategoryInfo(selectedFile.category).name}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500">
                    💡 편집 모드를 활성화하여 데이터를 수정하고 새 행을 추가할 수 있습니다
                  </div>
                  <button
                    onClick={closePreview}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="미리보기 닫기"
                  >
                    ❌
                  </button>
                </div>
              </div>
              
              <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
                {previewLoading ? (
                  <LoadingSpinner />
                ) : preview ? (
                  <div>
                    {/* 📑 시트 탭 */}
                    {preview.sheet_names.length > 1 && (
                      <div className="mb-4 border-b">
                        <div className="flex space-x-4">
                          {preview.sheet_names.map((sheetName) => (
                            <button
                              key={`sheet-${sheetName}`}
                              onClick={() => setActiveSheetName(sheetName)}
                              className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeSheetName === sheetName
                                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                              }`}
                            >
                              {sheetName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 📊 활성 시트 데이터 표시 */}
                    {(() => {
                      const currentSheetName = activeSheetName || preview.sheet_names[0];
                      const currentSheet = preview.sheets[currentSheetName];
                      
                      if (!currentSheet) {
                        return (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-gray-500">시트 데이터를 찾을 수 없습니다.</p>
                          </div>
                        );
                      }
                      
                      return <TablePreview sheetData={currentSheet} sheetName={currentSheetName} />;
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-gray-500">미리보기를 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager; 