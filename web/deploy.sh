#!/bin/bash

echo "🚀 [1/4] React 빌드 시작..."
npm run build

echo "🧹 [2/4] 기존 정적 파일 삭제..."
rm -rf ../api/src/main/resources/static/*

echo "🚚 [3/4] 새 빌드 파일 이관..."
cp -r build/* ../api/src/main/resources/static/

echo "📦 [4/4] Spring Boot JAR 생성..."
cd ../api
./gradlew clean bootJar

echo "✨ 모든 작업이 완료되었습니다! build/libs 폴더를 확인하세요."