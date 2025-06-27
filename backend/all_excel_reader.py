#!/usr/bin/env python3
"""
통합 Excel 데이터 리더 모듈
회원, 직원, 인사, 재고 관리 Excel 파일을 읽어서 API 데이터로 변환
"""

import pandas as pd
import os
import glob
from datetime import datetime

def get_latest_excel_file(category):
    """특정 카테고리의 가장 최신 Excel 파일 반환"""
    # 현재 스크립트의 디렉토리를 기준으로 상대 경로 설정
    script_dir = os.path.dirname(os.path.abspath(__file__))
    excel_dir = os.path.join(script_dir, f"app/data/excel/{category}")
    patterns = {
        'members': f"{excel_dir}/회원관리_*.xlsx",
        'staff': f"{excel_dir}/직원관리_*.xlsx", 
        'hr': f"{excel_dir}/인사관리_*.xlsx",
        'inventory': f"{excel_dir}/재고관리_*.xlsx"
    }
    
    pattern = patterns.get(category)
    if not pattern:
        return None
        
    files = glob.glob(pattern)
    if not files:
        return None
    
    # 가장 최신 파일 반환
    latest_file = max(files, key=os.path.getctime)
    return latest_file

def read_members_data():
    """회원 관리 Excel 데이터 읽기"""
    try:
        excel_file = get_latest_excel_file('members')
        if not excel_file:
            return [], {}
        
        print(f"📖 회원 데이터 읽는 중: {excel_file}")
        
        # 회원 목록 읽기
        members_df = pd.read_excel(excel_file, sheet_name='회원목록')
        
        members_list = []
        for _, row in members_df.iterrows():
            member = {
                "id": int(row['회원번호']),
                "name": str(row['이름']),
                "phone": str(row['전화번호']),
                "email": str(row['이메일']),
                "membership_type": str(row['멤버십타입']),
                "start_date": str(row['가입일']),
                "end_date": str(row['만료일']),
                "payment_status": "paid" if row['결제상태'] == "완료" else "unpaid",
                "emergency_contact": str(row['비상연락처']),
                "medical_notes": str(row['특이사항']),
                "age": int(row['나이']) if str(row['나이']) != 'nan' else 0,
                "gender": str(row['성별']),
                "address": str(row['주소']),
                "occupation": str(row['직업']),
                "monthly_fee": int(row['월회비']) if str(row['월회비']) != 'nan' else 0
            }
            members_list.append(member)
        
        # 통계 계산
        total_count = len(members_list)
        premium_count = len([m for m in members_list if m['membership_type'] == '프리미엄'])
        regular_count = len([m for m in members_list if m['membership_type'] == '일반'])
        vip_count = len([m for m in members_list if m['membership_type'] == 'VIP'])
        male_count = len([m for m in members_list if m['gender'] == '남'])
        female_count = len([m for m in members_list if m['gender'] == '여'])
        paid_count = len([m for m in members_list if m['payment_status'] == 'paid'])
        total_revenue = sum([m['monthly_fee'] for m in members_list])
        
        summary = {
            "총회원수": total_count,
            "활성회원": paid_count,
            "프리미엄": premium_count,
            "일반": regular_count,
            "VIP": vip_count,
            "남성": male_count,
            "여성": female_count,
            "총월매출": total_revenue
        }
        
        return members_list, summary
        
    except Exception as e:
        print(f"❌ 회원 데이터 읽기 오류: {e}")
        return [], {}

def read_staff_data():
    """직원 관리 Excel 데이터 읽기"""
    try:
        excel_file = get_latest_excel_file('staff')
        if not excel_file:
            return [], {}
        
        print(f"📖 직원 데이터 읽는 중: {excel_file}")
        
        staff_df = pd.read_excel(excel_file, sheet_name='Sheet1')
        
        staff_list = []
        for _, row in staff_df.iterrows():
            staff = {
                "id": int(row['직원번호']),
                "name": str(row['이름']),
                "age": int(row['나이']) if str(row['나이']) != 'nan' else 0,
                "gender": str(row['성별']),
                "phone": str(row['전화번호']),
                "email": str(row['이메일']),
                "position": str(row['직책']),
                "department": str(row['부서']),
                "hire_date": str(row['입사일']),
                "status": str(row['근무상태']),
                "certification": str(row['자격증']),
                "notes": str(row['특이사항']),
                "monthly_salary": int(row['월급여']) if str(row['월급여']) != 'nan' else 0
            }
            staff_list.append(staff)
        
        # 직원 통계 계산
        total_staff = len(staff_list)
        trainer_count = len([s for s in staff_list if s['position'] == '트레이너'])
        manager_count = len([s for s in staff_list if s['position'] == '매니저'])
        cleaner_count = len([s for s in staff_list if s['position'] == '청소원'])
        instructor_count = len([s for s in staff_list if s['position'] == '수영강사'])
        active_count = len([s for s in staff_list if s['status'] == '활성'])
        total_payroll = sum([s['monthly_salary'] for s in staff_list])
        
        summary = {
            "총직원수": total_staff,
            "트레이너": trainer_count,
            "매니저": manager_count,
            "청소원": cleaner_count,
            "수영강사": instructor_count,
            "활성직원": active_count,
            "총인건비": total_payroll
        }
        
        return staff_list, summary
        
    except Exception as e:
        print(f"❌ 직원 데이터 읽기 오류: {e}")
        return [], {}

def read_hr_data():
    """인사 관리 Excel 데이터 읽기"""
    try:
        excel_file = get_latest_excel_file('hr')
        if not excel_file:
            return {}, {}
        
        print(f"📖 인사 데이터 읽는 중: {excel_file}")
        
        # 인사 관리 데이터 (Sheet1에서 읽기)
        hr_df = pd.read_excel(excel_file, sheet_name='Sheet1')
        
        hr_list = []
        for _, row in hr_df.iterrows():
            hr_record = {
                "employee_id": int(row['직원번호']),
                "name": str(row['이름']),
                "department": str(row['부서']),
                "used_vacation": int(row['연차사용']) if str(row['연차사용']) != 'nan' else 0,
                "total_vacation": int(row['총연차']) if str(row['총연차']) != 'nan' else 0,
                "remaining_vacation": int(row['잔여연차']) if str(row['잔여연차']) != 'nan' else 0,
                "monthly_hours": int(row['월근무시간']) if str(row['월근무시간']) != 'nan' else 0,
                "overtime_hours": int(row['초과근무']) if str(row['초과근무']) != 'nan' else 0,
                "night_hours": int(row['야간근무']) if str(row['야간근무']) != 'nan' else 0,
                "evaluation_score": float(row['평가점수']) if str(row['평가점수']) != 'nan' else 0,
                "rewards_penalties": str(row['상벌내역']),
                "training_completed": str(row['교육이수'])
            }
            hr_list.append(hr_record)
        
        # 인사 통계
        total_employees = len(hr_list)
        total_used_vacation = sum([h['used_vacation'] for h in hr_list])
        total_overtime = sum([h['overtime_hours'] for h in hr_list])
        avg_evaluation = sum([h['evaluation_score'] for h in hr_list]) / total_employees if total_employees > 0 else 0
        
        summary = {
            "총직원수": total_employees,
            "총사용연차": total_used_vacation,
            "총초과근무": total_overtime,
            "평균평가점수": round(avg_evaluation, 2),
            "연차완전사용자": len([h for h in hr_list if h['remaining_vacation'] == 0]),
            "교육완료자": len([h for h in hr_list if h['training_completed'] != ''])
        }
        
        hr_data = {
            "hr_records": hr_list
        }
        
        return hr_data, summary
        
    except Exception as e:
        print(f"❌ 인사 데이터 읽기 오류: {e}")
        return {}, {}

def read_inventory_data():
    """재고 관리 Excel 데이터 읽기"""
    try:
        excel_file = get_latest_excel_file('inventory')
        if not excel_file:
            return [], {}, []
        
        print(f"📖 재고 데이터 읽는 중: {excel_file}")
        
        inventory_df = pd.read_excel(excel_file, sheet_name='Sheet1')
        
        inventory_list = []
        for _, row in inventory_df.iterrows():
            # 총액 계산 (단가 * 현재재고)
            unit_price = int(row['단가']) if str(row['단가']) != 'nan' else 0
            current_stock = int(row['현재재고']) if str(row['현재재고']) != 'nan' else 0
            total_value = unit_price * current_stock
            
            item = {
                "id": int(row['품목번호']),
                "item_name": str(row['품목명']),
                "category": str(row['카테고리']),
                "current_stock": current_stock,
                "min_stock_level": int(row['최소재고']) if str(row['최소재고']) != 'nan' else 0,
                "max_stock_level": int(row['최대재고']) if str(row['최대재고']) != 'nan' else 0,
                "unit_price": unit_price,
                "total_value": total_value,
                "supplier": str(row['공급업체']),
                "location": str(row['위치']),
                "received_date": str(row['입고일']),
                "expiry_date": str(row['유통기한']),
                "status": str(row['상태']),
                "is_active": True
            }
            inventory_list.append(item)
        
        # 재고 통계
        total_items = len(inventory_list)
        normal_items = len([i for i in inventory_list if i['status'] == '정상'])
        low_stock_items = len([i for i in inventory_list if i['status'] == '부족'])
        critical_items = len([i for i in inventory_list if i['status'] == '긴급부족'])
        total_value = sum([i['total_value'] for i in inventory_list])
        
        # 부족 재고 아이템들 따로 추출
        low_stock_list = [i for i in inventory_list if i['status'] in ['부족', '긴급부족']]
        
        summary = {
            "총품목수": total_items,
            "정상재고": normal_items,
            "부족재고": low_stock_items,
            "긴급부족": critical_items,
            "총재고가치": total_value,
            "부족품목수": len(low_stock_list)
        }
        
        return inventory_list, summary, low_stock_list
        
    except Exception as e:
        print(f"❌ 재고 데이터 읽기 오류: {e}")
        return [], {}, []

def get_all_dashboard_data():
    """대시보드용 전체 데이터 통합"""
    try:
        # 모든 데이터 읽기
        members, member_stats = read_members_data()
        staff, staff_stats = read_staff_data()
        hr_data, hr_stats = read_hr_data()
        inventory, inventory_stats, low_stock = read_inventory_data()
        
        # 통합 대시보드 데이터
        dashboard_data = {
            "members": {
                "data": members,
                "stats": member_stats,
                "count": len(members)
            },
            "staff": {
                "data": staff,
                "stats": staff_stats,
                "count": len(staff)
            },
            "hr": {
                "data": hr_data,
                "stats": hr_stats
            },
            "inventory": {
                "data": inventory,
                "stats": inventory_stats,
                "low_stock": low_stock,
                "count": len(inventory)
            },
            "summary": {
                "총회원수": member_stats.get("총회원수", 0),
                "총직원수": staff_stats.get("총직원수", 0),
                "총품목수": inventory_stats.get("총품목수", 0),
                "부족재고": inventory_stats.get("부족품목수", 0),
                "월매출": member_stats.get("총월매출", 0),
                "인건비": staff_stats.get("총인건비", 0)
            }
        }
        
        return dashboard_data
        
    except Exception as e:
        print(f"❌ 대시보드 데이터 통합 오류: {e}")
        return {}

def update_member_data(member_name, field, new_value):
    """회원 데이터 수정"""
    try:
        excel_file = get_latest_excel_file('members')
        if not excel_file:
            return False, "회원 Excel 파일을 찾을 수 없습니다."
        
        print(f"📝 회원 데이터 수정 중: {member_name}의 {field}를 {new_value}로 변경")
        
        # Excel 파일 읽기
        df = pd.read_excel(excel_file, sheet_name='회원목록')
        
        # 해당 회원 찾기
        member_row = df[df['이름'] == member_name]
        if member_row.empty:
            return False, f"{member_name} 회원을 찾을 수 없습니다."
        
        # 필드명 매핑
        field_mapping = {
            '월회비': '월회비',
            '전화번호': '전화번호',
            '이메일': '이메일',
            '멤버십': '멤버십타입',
            '멤버십타입': '멤버십타입',
            '주소': '주소',
            '직업': '직업',
            '결제상태': '결제상태',
            '특이사항': '특이사항',
            '비상연락처': '비상연락처'
        }
        
        excel_field = field_mapping.get(field, field)
        if excel_field not in df.columns:
            return False, f"'{field}' 필드를 찾을 수 없습니다."
        
        # 데이터 타입 변환
        if excel_field == '월회비':
            try:
                # 15만원, 150000원, 150000 등 다양한 형태 처리
                if isinstance(new_value, str):
                    new_value = new_value.replace('만원', '0000').replace('원', '').replace(',', '')
                new_value = int(new_value)
            except:
                return False, "월회비는 숫자로 입력해주세요."
        
        # 데이터 수정
        df.loc[df['이름'] == member_name, excel_field] = new_value
        
        # Excel 파일 저장
        with pd.ExcelWriter(excel_file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df.to_excel(writer, sheet_name='회원목록', index=False)
        
        print(f"✅ {member_name} 회원의 {field} 수정 완료: {new_value}")
        return True, f"{member_name} 회원의 {field}가 {new_value}로 수정되었습니다."
        
    except Exception as e:
        print(f"❌ 회원 데이터 수정 오류: {e}")
        return False, f"데이터 수정 중 오류가 발생했습니다: {str(e)}"

def update_staff_data(staff_name, field, new_value):
    """직원 데이터 수정"""
    try:
        excel_file = get_latest_excel_file('staff')
        if not excel_file:
            return False, "직원 Excel 파일을 찾을 수 없습니다."
        
        print(f"📝 직원 데이터 수정 중: {staff_name}의 {field}를 {new_value}로 변경")
        
        # Excel 파일 읽기
        df = pd.read_excel(excel_file, sheet_name='직원목록')
        
        # 해당 직원 찾기
        staff_row = df[df['이름'] == staff_name]
        if staff_row.empty:
            return False, f"{staff_name} 직원을 찾을 수 없습니다."
        
        # 필드명 매핑
        field_mapping = {
            '월급여': '월급여',
            '시급': '시급',
            '전화번호': '전화번호',
            '이메일': '이메일',
            '직책': '직책',
            '부서': '부서',
            '근무상태': '근무상태',
            '담당구역': '담당구역'
        }
        
        excel_field = field_mapping.get(field, field)
        if excel_field not in df.columns:
            return False, f"'{field}' 필드를 찾을 수 없습니다."
        
        # 데이터 타입 변환
        if excel_field in ['월급여', '시급']:
            try:
                if isinstance(new_value, str):
                    new_value = new_value.replace('만원', '0000').replace('원', '').replace(',', '')
                new_value = int(new_value)
            except:
                return False, f"{field}는 숫자로 입력해주세요."
        
        # 데이터 수정
        df.loc[df['이름'] == staff_name, excel_field] = new_value
        
        # Excel 파일 저장
        with pd.ExcelWriter(excel_file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df.to_excel(writer, sheet_name='직원목록', index=False)
        
        print(f"✅ {staff_name} 직원의 {field} 수정 완료: {new_value}")
        return True, f"{staff_name} 직원의 {field}가 {new_value}로 수정되었습니다."
        
    except Exception as e:
        print(f"❌ 직원 데이터 수정 오류: {e}")
        return False, f"데이터 수정 중 오류가 발생했습니다: {str(e)}"

def update_inventory_data(item_name, field, new_value):
    """재고 데이터 수정"""
    try:
        excel_file = get_latest_excel_file('inventory')
        if not excel_file:
            return False, "재고 Excel 파일을 찾을 수 없습니다."
        
        print(f"📝 재고 데이터 수정 중: {item_name}의 {field}를 {new_value}로 변경")
        
        # Excel 파일 읽기
        df = pd.read_excel(excel_file, sheet_name='재고목록')
        
        # 해당 품목 찾기
        item_row = df[df['품목명'] == item_name]
        if item_row.empty:
            return False, f"{item_name} 품목을 찾을 수 없습니다."
        
        # 필드명 매핑
        field_mapping = {
            '현재재고': '현재재고',
            '재고': '현재재고',
            '최소재고': '최소재고',
            '최대재고': '최대재고',
            '단가': '단가',
            '가격': '단가',
            '공급업체': '공급업체',
            '위치': '위치',
            '상태': '상태'
        }
        
        excel_field = field_mapping.get(field, field)
        if excel_field not in df.columns:
            return False, f"'{field}' 필드를 찾을 수 없습니다."
        
        # 데이터 타입 변환
        if excel_field in ['현재재고', '최소재고', '최대재고', '단가']:
            try:
                if isinstance(new_value, str):
                    new_value = new_value.replace('개', '').replace('원', '').replace(',', '')
                new_value = int(new_value)
            except:
                return False, f"{field}는 숫자로 입력해주세요."
        
        # 데이터 수정
        df.loc[df['품목명'] == item_name, excel_field] = new_value
        
        # 재고 상태 자동 업데이트 (현재재고가 변경된 경우)
        if excel_field == '현재재고':
            min_stock = df.loc[df['품목명'] == item_name, '최소재고'].iloc[0]
            if new_value <= 0:
                df.loc[df['품목명'] == item_name, '상태'] = '품절'
            elif new_value <= min_stock:
                df.loc[df['품목명'] == item_name, '상태'] = '부족'
            else:
                df.loc[df['품목명'] == item_name, '상태'] = '정상'
        
        # 총액 재계산 (재고나 단가가 변경된 경우)
        if excel_field in ['현재재고', '단가']:
            current_stock = df.loc[df['품목명'] == item_name, '현재재고'].iloc[0]
            unit_price = df.loc[df['품목명'] == item_name, '단가'].iloc[0]
            df.loc[df['품목명'] == item_name, '총액'] = current_stock * unit_price
        
        # Excel 파일 저장
        with pd.ExcelWriter(excel_file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df.to_excel(writer, sheet_name='재고목록', index=False)
        
        print(f"✅ {item_name} 품목의 {field} 수정 완료: {new_value}")
        return True, f"{item_name} 품목의 {field}가 {new_value}로 수정되었습니다."
        
    except Exception as e:
        print(f"❌ 재고 데이터 수정 오류: {e}")
        return False, f"데이터 수정 중 오류가 발생했습니다: {str(e)}"

def add_new_member(member_data):
    """새 회원 추가"""
    try:
        excel_file = get_latest_excel_file('members')
        if not excel_file:
            return False, "회원 Excel 파일을 찾을 수 없습니다."
        
        print(f"📝 새 회원 추가 중: {member_data.get('이름', 'Unknown')}")
        
        # Excel 파일 읽기
        df = pd.read_excel(excel_file, sheet_name='회원목록')
        
        # 새 회원번호 생성 (기존 최대값 + 1)
        max_id = df['회원번호'].max() if not df.empty else 0
        new_id = max_id + 1
        
        # 기본값 설정
        new_member = {
            '회원번호': new_id,
            '이름': member_data.get('이름', ''),
            '전화번호': member_data.get('전화번호', ''),
            '이메일': member_data.get('이메일', ''),
            '멤버십타입': member_data.get('멤버십타입', '일반'),
            '가입일': member_data.get('가입일', pd.Timestamp.now().strftime('%Y-%m-%d')),
            '만료일': member_data.get('만료일', ''),
            '결제상태': member_data.get('결제상태', '미완료'),
            '비상연락처': member_data.get('비상연락처', ''),
            '특이사항': member_data.get('특이사항', ''),
            '나이': member_data.get('나이', 0),
            '성별': member_data.get('성별', ''),
            '주소': member_data.get('주소', ''),
            '직업': member_data.get('직업', ''),
            '월회비': member_data.get('월회비', 80000)
        }
        
        # 새 행 추가
        df = pd.concat([df, pd.DataFrame([new_member])], ignore_index=True)
        
        # Excel 파일 저장
        with pd.ExcelWriter(excel_file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df.to_excel(writer, sheet_name='회원목록', index=False)
        
        print(f"✅ 새 회원 추가 완료: {member_data.get('이름')} (회원번호: {new_id})")
        return True, f"{member_data.get('이름')} 회원이 성공적으로 추가되었습니다. (회원번호: {new_id})"
        
    except Exception as e:
        print(f"❌ 새 회원 추가 오류: {e}")
        return False, f"회원 추가 중 오류가 발생했습니다: {str(e)}"

if __name__ == "__main__":
    print("🏋️ 통합 Excel 데이터 리더 테스트")
    print("=" * 50)
    
    dashboard = get_all_dashboard_data()
    
    if dashboard:
        print(f"\n📊 읽어온 데이터:")
        print(f"   • 회원: {dashboard['members']['count']}명")
        print(f"   • 직원: {dashboard['staff']['count']}명")
        print(f"   • 재고: {dashboard['inventory']['count']}개")
        print(f"   • 부족재고: {dashboard['inventory']['stats'].get('부족품목수', 0)}개")
        
        print(f"\n💰 재정 현황:")
        print(f"   • 월 매출: {dashboard['summary']['월매출']:,}원")
        print(f"   • 인건비: {dashboard['summary']['인건비']:,}원")
    else:
        print("❌ 데이터를 읽을 수 없습니다.") 