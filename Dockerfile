# 1. 사용할 자바 버전 (Java 17 기준, 다른 버전이면 숫자만 수정하세요)
FROM eclipse-temurin:17-jdk-alpine

# 2. 가상 환경 내부의 작업 폴더 지정
WORKDIR /app

# 3. 윈도우에서 빌드한 jar 파일을 가상 환경 안으로 복사
# (주의: 만약 jar 파일 이름이 다르면 app.jar 앞부분 경로를 수정해주세요)
COPY build/libs/*-SNAPSHOT.jar app.jar

# 4. 외부로 열어줄 포트
EXPOSE 8080

# 5. 가상 환경이 켜질 때 실행할 명령어 (기존 파워쉘 명령어와 동일하죠?)
ENTRYPOINT ["java", "-jar", "app.jar", "-Dspring.profiles.active=prod"]