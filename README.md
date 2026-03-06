# Jenkins CI/CD Workshop

Jenkins를 활용한 CI/CD 파이프라인 구축 실습 워크샵입니다.

## 과정 소개

Todo 앱(Backend + Frontend)을 대상으로 Jenkins 파이프라인을 단계별로 구축합니다.

| 단계 | 내용 | Jenkinsfile |
|------|------|-------------|
| 1교시 | Backend CI (Lint, Test) | `solutions/01-ci-backend.Jenkinsfile` |
| 2교시 | Frontend CI (Lint, Build, Test) | `solutions/02-ci-frontend.Jenkinsfile` |
| 3교시 | 통합 CI + 품질 게이트 (Coverage) | `solutions/03-ci-quality-gate.Jenkinsfile` |
| 4교시 | Docker 이미지 빌드 | `solutions/04-cd-docker-build.Jenkinsfile` |
| 5교시 | Staging/Production 배포 | `solutions/05-cd-deploy.Jenkinsfile` |
| 6교시 | 풀 파이프라인 (pollSCM, Telegram) | `solutions/06-full-pipeline.Jenkinsfile` |

## 사전 준비

- GitHub 계정 (Codespaces 사용)
- Telegram 앱 설치 (6교시 알림 실습용)

## 시작 방법

1. 이 레포지토리를 Fork합니다.
2. **Code** 버튼에서 **Codespaces** 탭을 선택합니다.
3. **Create codespace on main**을 클릭합니다.
4. 환경이 준비되면 Jenkins가 자동으로 시작됩니다.
5. 포트 8080으로 Jenkins에 접속합니다.

### Jenkins 초기 비밀번호 확인

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 레포 구조

```
jenkins-cicd-workshop/
├── .devcontainer/          # Codespaces 설정
│   ├── devcontainer.json
│   └── docker-compose.yml
├── apps/
│   ├── backend/            # Express.js Todo API
│   └── frontend/           # React Todo 앱
├── solutions/              # 단계별 Jenkinsfile 정답
│   ├── 01-ci-backend.Jenkinsfile
│   ├── 02-ci-frontend.Jenkinsfile
│   ├── 03-ci-quality-gate.Jenkinsfile
│   ├── 04-cd-docker-build.Jenkinsfile
│   ├── 05-cd-deploy.Jenkinsfile
│   └── 06-full-pipeline.Jenkinsfile
├── docker-compose.staging.yml
├── docker-compose.prod.yml
├── Jenkinsfile             # 학생이 작성할 파일
└── README.md
```

## 포트 안내

| 포트 | 용도 |
|------|------|
| 8080 | Jenkins 대시보드 |
| 3000 | Backend (Staging) |
| 3001 | Frontend (Staging) |
| 4000 | Backend (Production) |
| 4001 | Frontend (Production) |

## 문제 해결

### Jenkins가 시작되지 않을 때

```bash
docker ps -a
docker logs jenkins
```

### Docker 소켓 권한 오류

```bash
sudo chmod 666 /var/run/docker.sock
```

### Pipeline Utility Steps 플러그인

3교시 품질 게이트에서 `readJSON`을 사용합니다. Jenkins 관리 > Plugins에서 **Pipeline Utility Steps** 플러그인을 설치합니다.

### NodeJS 도구를 찾을 수 없을 때

Jenkins 관리 > Tools > NodeJS installations에서 `node20` 이름으로 Node.js 20.x를 추가합니다.

### Telegram 알림이 오지 않을 때

Jenkins 관리 > Credentials에서 `telegram-bot-token`과 `telegram-chat-id`를 등록했는지 확인합니다.
