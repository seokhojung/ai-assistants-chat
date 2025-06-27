import api from './api';

export interface DashboardStats {
  totalMembers: number;
  activeStaff: number;
  lowStockItems: number;
  todayAttendance: number;
}

export interface RecentActivity {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // 실제 API 호출 (Excel 데이터 기반)
      const [members, staff, inventory] = await Promise.all([
        api.get('/members/').catch(() => {
          return { data: { members: [], summary: {} } };
        }),
        api.get('/staff/').catch(() => {
          return { data: { staff: [], summary: {} } };
        }),
        api.get('/inventory/low-stock').catch(() => {
          return { data: { low_stock_items: [] } };
        })
      ]);

      // Excel 데이터 구조에 맞게 수정
      const totalMembers = members.data?.members?.length || members.data?.summary?.총회원수 || 0;
      const activeStaff = staff.data?.staff?.filter((s: { status?: string }) => s.status === 'active' || s.status === '활성')?.length || staff.data?.summary?.활성직원 || 0;
      const lowStockItems = inventory.data?.low_stock_items?.length || inventory.data?.alert_count || 0;

      return {
        totalMembers,
        activeStaff,
        lowStockItems,
        todayAttendance: Math.floor(Math.random() * 50) + 30, // 임시 데이터
      };
    } catch (error) {
      // API 오류 시 기본값 반환
      return {
        totalMembers: 0,
        activeStaff: 0,
        lowStockItems: 0,
        todayAttendance: 0,
      };
    }
  },

  getRecentActivities: async (): Promise<RecentActivity[]> => {
    // 임시 데이터 (추후 백엔드에서 실제 활동 로그 구현)
    return [
      {
        id: '1',
        message: '김철수님이 프리미엄 회원권을 연장했습니다.',
        type: 'success',
        timestamp: '5분 전'
      },
      {
        id: '2',
        message: '최트레이너님의 오늘 근무가 시작되었습니다.',
        type: 'info',
        timestamp: '30분 전'
      },
      {
        id: '3',
        message: '운동 타올 재고가 부족합니다. (현재: 15개)',
        type: 'warning',
        timestamp: '1시간 전'
      }
    ];
  }
}; 