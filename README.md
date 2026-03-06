# Jenkins CI/CD Lab

Jenkins를 활용한 CI/CD 파이프라인 구축 실습입니다.
Todo 앱(Backend + Frontend)을 대상으로 파이프라인을 처음부터 끝까지 구축합니다.

---

## 사전 준비

- GitHub 계정 (Codespaces 사용)
- Telegram 앱 설치 (알림 실습용)

---

## STEP 0: 환경 셋업

### 0-1. 레포지토리 Fork

1. **https://github.com/frentis-ai-study/jenkins-cicd-lab** 에 접속합니다
2. 우측 상단 **Fork** 버튼을 클릭합니다
3. Owner가 본인 계정인지 확인하고 **Create fork**를 클릭합니다
4. Fork가 완료되면 `https://github.com/<본인계정>/jenkins-cicd-lab` 으로 이동됩니다

> 이후 모든 작업은 **Fork한 본인 레포**에서 진행합니다.

### 0-2. Codespaces 시작

1. Fork한 레포에서 초록색 **Code** 버튼을 클릭합니다
2. **Codespaces** 탭을 선택합니다
3. **Create codespace on main**을 클릭합니다
4. 약 2~3분 후 VS Code가 브라우저에서 열립니다

### 0-3. Jenkins 접속

Codespaces가 시작되면 터미널에 초기 비밀번호가 자동으로 표시됩니다.
표시되지 않으면 아래 명령으로 확인합니다:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

1. Codespaces 하단 **PORTS** 탭에서 포트 **8080**을 클릭합니다 (또는 브라우저 팝업)
2. Jenkins 초기 비밀번호를 붙여넣고 **Continue**를 클릭합니다
3. **Install suggested plugins**를 선택하고 설치를 기다립니다 (약 3~5분)
4. 관리자 계정을 생성합니다:
   - Username: `admin`
   - Password: `admin`
   - Full name: 본인 이름
5. Jenkins URL은 기본값 그대로 두고 **Save and Finish**를 클릭합니다
6. **Start using Jenkins**를 클릭하면 대시보드가 표시됩니다

---

## STEP 1: Freestyle Job (Jenkins 첫 경험)

Jenkins에서 가장 간단한 Job을 만들어봅니다.

### 1-1. Job 생성

1. 대시보드에서 **New Item**을 클릭합니다
2. 이름: `hello-cicd`
3. **Freestyle project**를 선택하고 **OK**를 클릭합니다

### 1-2. 셸 스크립트 추가

1. **Build Steps** 섹션에서 **Add build step** 클릭
2. **Execute shell**을 선택합니다
3. 아래 스크립트를 입력합니다:

```bash
echo "Hello, CI/CD!"
echo "Build Number: $BUILD_NUMBER"
echo "Workspace: $WORKSPACE"
date
```

4. **Save**를 클릭합니다

### 1-3. 빌드 실행

1. 좌측 **Build Now**를 클릭합니다
2. Build History에 **#1**이 나타납니다
3. **#1**을 클릭하고 **Console Output**을 확인합니다

---

## STEP 2: Backend CI 파이프라인

Jenkinsfile을 작성하여 Backend 코드를 자동으로 검증합니다.

### 2-1. Jenkinsfile 작성

Codespaces VS Code에서 루트의 `Jenkinsfile`을 열고 아래 내용으로 교체합니다:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                dir('apps/backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('apps/backend') {
                    sh 'npx eslint src/'
                }
            }
        }

        stage('Test') {
            steps {
                dir('apps/backend') {
                    sh 'npm test'
                }
            }
        }
    }
}
```

### 2-2. Git Push

Codespaces 터미널에서 다음 명령을 실행합니다:

```bash
git add Jenkinsfile
git commit -m "feat: Backend CI pipeline"
git push
```

> `git push`를 하면 코드가 본인의 Fork 레포(GitHub)에 올라갑니다.
> Jenkins는 이 GitHub 레포에서 코드를 가져와 빌드합니다.

### 2-3. Pipeline Job 생성

1. Jenkins 대시보드에서 **New Item**을 클릭합니다
2. 이름: `backend-ci`
3. **Pipeline**을 선택하고 **OK**를 클릭합니다
4. **Pipeline** 섹션으로 스크롤합니다
5. Definition: **Pipeline script from SCM**을 선택합니다
6. SCM: **Git**을 선택합니다
7. Repository URL에 **본인 Fork 레포의 HTTPS URL**을 입력합니다:

```
https://github.com/<본인계정>/jenkins-cicd-lab.git
```

8. Branch Specifier: `*/main`
9. Script Path: `Jenkinsfile`
10. **Save**를 클릭합니다

### 2-4. 빌드 실행 및 확인

1. 좌측 **Build Now**를 클릭합니다
2. Jenkins가 GitHub에서 코드를 clone하고 Jenkinsfile을 실행합니다
3. **Stage View**에서 각 스테이지의 성공/실패를 확인합니다

### 2-5. 실패 체험

일부러 린트 에러를 만들어서 CI가 코드를 지키는 것을 체험합니다:

```bash
# 린트 에러 추가
echo "const unused = 'lint error';" >> apps/backend/src/index.js
git add .
git commit -m "feat: intentional lint error"
git push
```

Jenkins에서 **Build Now**를 클릭하면 Lint 스테이지에서 빨간색(실패)이 됩니다.

에러를 되돌립니다:

```bash
git checkout -- apps/backend/src/index.js
git add .
git commit -m "fix: revert lint error"
git push
```

다시 **Build Now**를 클릭하면 녹색(성공)으로 돌아옵니다.

> 참고: `solutions/01-ci-backend.Jenkinsfile`에 완성된 코드가 있습니다.

---

## STEP 3: Frontend CI 파이프라인

### 3-1. Jenkinsfile 수정

Backend CI에 Frontend 스테이지를 추가합니다.
`Jenkinsfile`을 아래처럼 수정합니다:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend CI') {
            steps {
                dir('apps/backend') {
                    sh 'npm ci'
                    sh 'npx eslint src/'
                    sh 'npm test'
                }
            }
        }

        stage('Frontend CI') {
            steps {
                dir('apps/frontend') {
                    sh 'npm ci'
                    sh 'npx eslint src/'
                    sh 'npm run build'
                    sh 'npm test'
                }
            }
        }
    }
}
```

### 3-2. Push 및 빌드

```bash
git add Jenkinsfile
git commit -m "feat: add Frontend CI"
git push
```

Jenkins에서 **Build Now**를 클릭하여 Backend와 Frontend 모두 통과하는지 확인합니다.

> 참고: `solutions/02-ci-frontend.Jenkinsfile`

---

## STEP 4: 품질 게이트

커버리지 임계값을 설정하여 "테스트가 부족하면 빌드 실패"를 구현합니다.

### 4-1. Jenkinsfile에 커버리지 추가

Test 스테이지에서 커버리지를 측정하고, post 블록으로 결과를 보관합니다.
상세 코드는 `solutions/03-ci-quality-gate.Jenkinsfile`을 참고합니다.

### 4-2. Push 및 빌드

```bash
git add Jenkinsfile
git commit -m "feat: quality gate with coverage"
git push
```

> 참고: `solutions/03-ci-quality-gate.Jenkinsfile`

---

## STEP 5: Docker 이미지 빌드

CI를 통과한 코드를 Docker 이미지로 패키징합니다.

### 5-1. Docker 소켓 권한 설정

Codespaces 터미널에서 Jenkins가 Docker를 사용할 수 있도록 권한을 설정합니다:

```bash
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

### 5-2. Jenkinsfile에 Docker Build 추가

CI 스테이지 뒤에 Docker Build 스테이지를 추가합니다:

```groovy
        stage('Docker Build') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        sh 'docker build -t backend:${BUILD_NUMBER} ./apps/backend'
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        sh 'docker build -t frontend:${BUILD_NUMBER} ./apps/frontend'
                    }
                }
            }
        }
```

### 5-3. Push 및 빌드

```bash
git add Jenkinsfile
git commit -m "feat: Docker image build"
git push
```

Jenkins에서 빌드 후 `docker images` 명령으로 이미지가 생성되었는지 확인합니다:

```bash
docker images | grep -E "backend|frontend"
```

> 참고: `solutions/04-cd-docker-build.Jenkinsfile`

---

## STEP 6: 통합 배포

Docker 이미지를 Staging/Production 환경에 배포합니다.

### 6-1. Staging 배포 스테이지 추가

```groovy
        stage('Deploy to Staging') {
            steps {
                sh '''
                    BUILD_NUMBER=${BUILD_NUMBER} docker compose -f docker-compose.staging.yml down || true
                    BUILD_NUMBER=${BUILD_NUMBER} docker compose -f docker-compose.staging.yml up -d
                '''
            }
        }
```

### 6-2. Production 배포 (수동 승인)

```groovy
        stage('Approval') {
            steps {
                input message: 'Production에 배포하시겠습니까?', ok: '배포 승인'
            }
        }

        stage('Deploy to Production') {
            steps {
                sh '''
                    BUILD_NUMBER=${BUILD_NUMBER} docker compose -f docker-compose.prod.yml down || true
                    BUILD_NUMBER=${BUILD_NUMBER} docker compose -f docker-compose.prod.yml up -d
                '''
            }
        }
```

### 6-3. Push 및 빌드

```bash
git add Jenkinsfile
git commit -m "feat: staging and production deploy"
git push
```

빌드 후 Staging 확인:
- Backend: Codespaces PORTS 탭에서 포트 **3000** 클릭
- Frontend: 포트 **3001** 클릭

Jenkins에서 "배포 승인" 버튼을 클릭하면 Production에도 배포됩니다:
- Backend: 포트 **4000**
- Frontend: 포트 **4001**

> 참고: `solutions/05-cd-deploy.Jenkinsfile`

---

## STEP 7: 자동 트리거 (SCM 폴링)

코드를 Push하면 Jenkins가 자동으로 빌드를 시작하도록 설정합니다.

### 7-1. Jenkinsfile에 triggers 추가

pipeline 블록 안에 triggers를 추가합니다:

```groovy
pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')  // 2분마다 Git 변경 감지
    }

    stages {
        // ... 기존 스테이지
    }
}
```

### 7-2. Push 및 확인

```bash
git add Jenkinsfile
git commit -m "feat: SCM polling trigger"
git push
```

**중요**: Jenkins에서 한 번은 수동으로 **Build Now**를 클릭해야 triggers가 활성화됩니다.

이후 코드를 수정하고 Push하면 약 2분 이내에 자동으로 빌드가 시작됩니다:

```bash
# 테스트: 아무 파일이나 수정 후 Push
echo "// auto trigger test" >> apps/backend/src/index.js
git add .
git commit -m "test: auto trigger"
git push
```

약 2분 후 Jenkins Build History에 새 빌드가 자동으로 나타납니다.

변경 되돌리기:
```bash
git checkout -- apps/backend/src/index.js
git add .
git commit -m "fix: revert trigger test"
git push
```

---

## STEP 8: Telegram 알림

빌드 성공/실패 시 Telegram으로 알림을 받습니다.

### 8-1. Telegram 봇 생성

1. Telegram에서 `@BotFather`를 검색하여 대화를 시작합니다
2. `/newbot` 명령을 입력합니다
3. 봇 이름을 입력합니다 (예: `Jenkins CI Bot`)
4. 봇 사용자명을 입력합니다 (예: `my_jenkins_ci_bot` — `_bot`으로 끝나야 합니다)
5. BotFather가 **HTTP API 토큰**을 발급합니다 — 복사해둡니다

### 8-2. Chat ID 확인

1. 생성한 봇에게 아무 메시지를 보냅니다 (예: `/start`)
2. 브라우저에서 아래 URL에 접속합니다 (`<토큰>` 부분을 실제 토큰으로 교체):

```
https://api.telegram.org/bot<토큰>/getUpdates
```

3. 응답 JSON에서 `"chat":{"id": 123456789}` 값을 복사합니다

### 8-3. Jenkins Credentials 등록

1. Jenkins 대시보드 > **Manage Jenkins** > **Credentials**
2. **(global)** 도메인 > **Add Credentials**
3. Bot Token 등록:
   - Kind: **Secret text**
   - Secret: Bot API 토큰
   - ID: `telegram-bot-token`
4. 다시 **Add Credentials**로 Chat ID 등록:
   - Kind: **Secret text**
   - Secret: chat_id 값
   - ID: `telegram-chat-id`

### 8-4. Jenkinsfile에 알림 추가

pipeline 블록에 environment와 post를 추가합니다:

```groovy
pipeline {
    agent any

    environment {
        TELEGRAM_TOKEN = credentials('telegram-bot-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {
        // ... 기존 스테이지
    }

    post {
        success {
            sh """
                curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_TOKEN}/sendMessage \
                  -d chat_id=\${TELEGRAM_CHAT_ID} \
                  -d text="Build #${BUILD_NUMBER} 성공 - ${JOB_NAME}"
            """
        }
        failure {
            sh """
                curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_TOKEN}/sendMessage \
                  -d chat_id=\${TELEGRAM_CHAT_ID} \
                  -d text="Build #${BUILD_NUMBER} 실패 - ${JOB_NAME}"
            """
        }
    }
}
```

### 8-5. Push 및 알림 확인

```bash
git add Jenkinsfile
git commit -m "feat: Telegram notification"
git push
```

빌드가 완료되면 Telegram에 알림이 옵니다.

실패 알림도 테스트합니다:
```bash
echo "const unused = 'fail test';" >> apps/backend/src/index.js
git add .
git commit -m "test: failure notification"
git push
```

Telegram에 실패 알림을 확인한 후 되돌립니다:
```bash
git checkout -- apps/backend/src/index.js
git add .
git commit -m "fix: revert failure test"
git push
```

> 참고: `solutions/06-full-pipeline.Jenkinsfile`

---

## 실습 반복 사이클 요약

모든 실습은 동일한 사이클로 진행됩니다:

```
1. Jenkinsfile 수정 (VS Code)
2. git add → git commit → git push
3. Jenkins에서 Build Now (또는 SCM 폴링 자동 트리거)
4. Stage View에서 결과 확인
5. 실패 시 코드 수정 → 다시 2번부터
```

---

## 레포 구조

```
jenkins-cicd-lab/
├── .devcontainer/          # Codespaces 설정
│   ├── devcontainer.json
│   └── docker-compose.yml
├── apps/
│   ├── backend/            # Express.js Todo API
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/           # React/Vite Todo 앱
│       ├── src/
│       ├── test/
│       ├── Dockerfile
│       └── package.json
├── solutions/              # 단계별 Jenkinsfile 정답
│   ├── 01-ci-backend.Jenkinsfile
│   ├── 02-ci-frontend.Jenkinsfile
│   ├── 03-ci-quality-gate.Jenkinsfile
│   ├── 04-cd-docker-build.Jenkinsfile
│   ├── 05-cd-deploy.Jenkinsfile
│   └── 06-full-pipeline.Jenkinsfile
├── docker-compose.staging.yml
├── docker-compose.prod.yml
├── Jenkinsfile             # 여기에 파이프라인을 작성합니다
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

---

## 문제 해결

### Jenkins가 시작되지 않을 때

```bash
docker ps -a
docker logs jenkins
```

### Docker 명령이 permission denied일 때

```bash
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

### Pipeline에서 "checkout scm" 실패 시

Repository URL이 본인 Fork의 HTTPS URL인지 확인합니다:
```
https://github.com/<본인계정>/jenkins-cicd-lab.git
```

### npm ci 실패 시

Codespaces 터미널에서 직접 테스트합니다:
```bash
cd apps/backend && npm ci && cd ../..
cd apps/frontend && npm ci && cd ../..
```

### Telegram 알림이 오지 않을 때

1. Jenkins > Manage Jenkins > Credentials에 `telegram-bot-token`과 `telegram-chat-id`가 등록되어 있는지 확인합니다
2. 터미널에서 직접 테스트합니다:

```bash
curl -s -X POST "https://api.telegram.org/bot<토큰>/sendMessage" \
  -d chat_id=<chat_id> \
  -d text="test"
```
