.PHONY: install dev dev-backend dev-frontend test seed clean help

# 기본 도움말
help:
	@echo "🏋️ Gym AI MVP - 사용 가능한 명령어:"
	@echo ""
	@echo "📦 설치:"
	@echo "  make install        - 백엔드, 프론트엔드 의존성 설치"
	@echo ""
	@echo "🚀 개발 서버:"
	@echo "  make dev-backend    - 백엔드 서버 실행 (http://localhost:8000)"
	@echo "  make dev-frontend   - 프론트엔드 서버 실행 (http://localhost:3000)"
	@echo "  make dev            - 개발 가이드 출력"
	@echo ""
	@echo "🗄️ 데이터:"
	@echo "  make seed           - 샘플 데이터 생성"
	@echo ""
	@echo "🧪 테스트:"
	@echo "  make test           - 백엔드, 프론트엔드 테스트 실행"
	@echo ""
	@echo "🧹 정리:"
	@echo "  make clean          - 데이터베이스 및 캐시 정리"

# 의존성 설치
install:
	@echo "📦 의존성 설치를 시작합니다..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ 의존성 설치 완료!"

# 백엔드 개발 서버
dev-backend:
	@echo "🚀 백엔드 서버를 시작합니다..."
	@echo "📖 API 문서: http://localhost:8000/docs"
	cd backend && python app/main.py

# 프론트엔드 개발 서버
dev-frontend:
	@echo "🚀 프론트엔드 서버를 시작합니다..."
	@echo "🌐 웹 사이트: http://localhost:3000"
	cd frontend && npm run dev

# 개발 가이드
dev:
	@echo "🏋️ Gym AI MVP 개발 서버 실행 가이드"
	@echo ""
	@echo "터미널 2개를 열어서 다음 명령어를 각각 실행하세요:"
	@echo ""
	@echo "📟 터미널 1 (백엔드):"
	@echo "  make dev-backend"
	@echo ""
	@echo "📟 터미널 2 (프론트엔드):"
	@echo "  make dev-frontend"
	@echo ""
	@echo "🌐 접속 주소:"
	@echo "  - 프론트엔드: http://localhost:3000"
	@echo "  - 백엔드 API: http://localhost:8000"
	@echo "  - API 문서: http://localhost:8000/docs"
	@echo ""
	@echo "🔑 로그인 정보:"
	@echo "  - 사용자명: admin"
	@echo "  - 비밀번호: admin123"

# 샘플 데이터 생성
seed:
	@echo "🗄️ 샘플 데이터를 생성합니다..."
	cd backend && python -c "from app.utils.seed_data import create_sample_data; create_sample_data()"
	@echo "✅ 샘플 데이터 생성 완료!"

# 테스트 실행
test:
	@echo "🧪 테스트를 실행합니다..."
	cd backend && python -m pytest tests/ -v
	cd frontend && npm test
	@echo "✅ 테스트 완료!"

# 정리
clean:
	@echo "🧹 정리를 시작합니다..."
	rm -f backend/gym_ai.db
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -rf frontend/node_modules/.cache
	@echo "✅ 정리 완료!" 