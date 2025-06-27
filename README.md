# 🏋️ Gym AI MVP

헬스장 관리용 AI 에이전트 시스템 - **30분 안에 실행 가능한 MVP**

## 📋 목차

1. [개요](#개요)
2. [빠른 시작](#빠른-시작)
3. [기능 정의](#기능-정의)
4. [기술 스택](#기술-스택)
5. [프로젝트 구조](#프로젝트-구조)
6. [개발 컨벤션](#개발-컨벤션)
7. [테스트](#테스트)
8. [문제 해결](#문제-해결)

## 📖 개요

Gym AI MVP는 헬스장 운영에 필요한 4가지 AI 에이전트를 제공하는 관리 시스템입니다.

### 🤖 AI 에이전트
- **회원관리 AI**: 회원 등록, 출석 관리, 결제 확인, 멤버십 추천
- **직원관리 AI**: 스케줄링, 근태 관리, 업무 배치
- **인사관리 AI**: 급여 계산, 휴가 관리, 교육 일정
- **재고관리 AI**: 재고 조회, 입출고 관리, 발주 알림

## 🚀 빠른 시작

### 1. 환경 요구사항
- Python 3.11+
- Node.js 18+
- Git

### 2. 프로젝트 클론
```bash
git clone <repository-url>
cd mvp
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
```

### 4. 의존성 설치
```bash
make install
```

### 5. 샘플 데이터 생성
```bash
make seed
```

### 6. 서버 실행 (터미널 2개 필요)

**터미널 1 - 백엔드:**
```bash
make dev-backend
```

**터미널 2 - 프론트엔드:**
```bash
make dev-frontend
```

### 7. 접속 및 테스트
- 🌐 **웹사이트**: http://localhost:3000
- 🔧 **API 문서**: http://localhost:8000/docs
- 🔑 **로그인**: admin / admin123

## 💡 기능 정의

### 회원관리 AI (`/api/v1/members/chat`)
```
사용 예시:
- "김철수님 정보 알려줘"
- "회원 목록 보여줘"
- "신규 회원 등록 도와줘"
- "이번 달 만료 예정 회원 알려줘"
```

### 직원관리 AI (`/api/v1/staff/chat`)
```
사용 예시:
- "오늘 근무자 알려줘"
- "이번 주 스케줄 보여줘"
- "휴가 신청 처리해줘"
- "근태 이상 직원 확인해줘"
```

### 인사관리 AI (`/api/v1/hr/chat`)
```
사용 예시:
- "이번 달 급여 계산해줘"
- "휴가 신청 승인해줘"
- "교육 일정 잡아줘"
- "직원 평가 도와줘"
```

### 재고관리 AI (`/api/v1/inventory/chat`)
```
사용 예시:
- "프로틴 재고 확인해줘"
- "재고 부족 물품 알려줘"
- "발주 필요한 물품 추천해줘"
- "운동기구 재고 현황"
```

## 🛠️ 기술 스택

### 백엔드
- **Framework**: FastAPI 0.110.0
- **Database**: SQLite (경량화)
- **ORM**: SQLAlchemy 2.0.25
- **Authentication**: JWT + bcrypt
- **AI**: OpenAI API 1.12.0
- **Data**: Pandas, openpyxl

### 프론트엔드
- **Framework**: React 18.2.0 + TypeScript
- **Build**: Vite 4.4.5
- **Routing**: React Router 6.15.0
- **State**: Zustand 4.4.0
- **HTTP**: Axios 1.5.0
- **Styling**: Utility CSS

### 개발 도구
- **Testing**: pytest (백엔드), Jest (프론트엔드)
- **Linting**: Black, Flake8 (백엔드), ESLint (프론트엔드)

## 📁 프로젝트 구조

```
mvp/
├─ backend/                    # FastAPI 서버
│   ├─ app/
│   │   ├─ main.py            # 메인 애플리케이션
│   │   ├─ api/v1/endpoints/  # API 엔드포인트
│   │   ├─ core/              # 설정, 보안, DB
│   │   ├─ models/            # SQLAlchemy 모델
│   │   ├─ schemas/           # Pydantic 스키마
│   │   ├─ services/ai_agents/ # AI 에이전트 로직
│   │   ├─ data/              # 샘플 데이터 & 룰
│   │   └─ utils/             # 유틸리티 함수
│   ├─ requirements.txt       # 파이썬 의존성
│   └─ gym_ai.db             # SQLite 데이터베이스
├─ frontend/                   # React SPA
│   ├─ src/
│   │   ├─ components/        # 재사용 컴포넌트
│   │   ├─ pages/            # 페이지 컴포넌트
│   │   ├─ services/         # API 호출
│   │   └─ types/            # TypeScript 타입
│   ├─ package.json          # Node.js 의존성
│   └─ vite.config.ts        # Vite 설정
└─ tests/                     # 테스트 파일
```

## 📐 개발 컨벤션

### 백엔드 (Python)
- **스타일**: PEP8 + Black 포매터
- **린팅**: Flake8
- **타입 힌트**: 모든 함수에 타입 힌트 사용
- **문서화**: Docstring 필수

### 프론트엔드 (TypeScript/React)
- **스타일**: Airbnb 스타일 가이드
- **린팅**: ESLint + Prettier
- **컴포넌트**: 함수형 컴포넌트 + Hooks
- **타입**: 모든 props와 state에 타입 정의

### API 설계
- **REST**: RESTful API 원칙 준수
- **응답**: 일관된 JSON 응답 형식
- **오류**: HTTP 상태 코드 + 의미있는 오류 메시지
- **문서**: FastAPI 자동 문서화 활용

## 🧪 테스트

### 백엔드 테스트
```bash
cd backend
python -m pytest tests/ -v --cov=app
```

### 프론트엔드 테스트
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

### 통합 테스트
```bash
make test
```

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. OpenAI API 키 오류
```bash
# .env 파일 확인
OPENAI_API_KEY=your_actual_api_key_here
```

#### 2. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :8000  # 백엔드
lsof -i :3000  # 프론트엔드
```

#### 3. 데이터베이스 오류
```bash
# 데이터베이스 초기화
make clean
make seed
```

#### 4. 패키지 설치 오류
```bash
# 가상환경 사용 권장
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
make install
```

### 로그 확인
- **백엔드 로그**: 터미널에서 직접 확인
- **프론트엔드 로그**: 브라우저 개발자 도구 Console 탭
- **API 호출**: 브라우저 개발자 도구 Network 탭

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **환경 변수**: `.env` 파일이 올바르게 설정되어 있는지
2. **의존성**: `make install`이 성공적으로 실행되었는지
3. **포트**: 8000번, 3000번 포트가 사용 가능한지
4. **API 키**: OpenAI API 키가 유효한지

---

## 🎯 MVP 목표 달성

✅ **30분 안에 실행 가능**  
✅ **4개 AI 에이전트 구현**  
✅ **실시간 채팅 인터페이스**  
✅ **데이터베이스 연동**  
✅ **RESTful API**  
✅ **반응형 웹 UI**  

**즐거운 개발 되세요! 🚀** 