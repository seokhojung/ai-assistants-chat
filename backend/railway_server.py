#!/usr/bin/env python3
"""
Railway 배포용 서버 (환경변수 PORT 지원)
"""
import os
from basic_server import run_server

if __name__ == "__main__":
    # Railway에서 제공하는 PORT 환경변수 사용
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Railway 환경에서 서버 시작: 포트 {port}")
    run_server(port)
