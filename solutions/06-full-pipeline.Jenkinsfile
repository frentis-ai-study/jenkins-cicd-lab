pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        TELEGRAM_BOT_TOKEN = credentials('telegram-bot-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Parallel CI
        stage('CI') {
            parallel {
                stage('Backend CI') {
                    stages {
                        stage('Backend - Install') {
                            steps {
                                dir('apps/backend') {
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Backend - Lint') {
                            steps {
                                dir('apps/backend') {
                                    sh 'npm run lint'
                                }
                            }
                        }
                        stage('Backend - Test') {
                            steps {
                                dir('apps/backend') {
                                    sh 'npm test'
                                }
                            }
                        }
                    }
                }

                stage('Frontend CI') {
                    stages {
                        stage('Frontend - Install') {
                            steps {
                                dir('apps/frontend') {
                                    sh 'npm ci'
                                }
                            }
                        }
                        stage('Frontend - Lint') {
                            steps {
                                dir('apps/frontend') {
                                    sh 'npm run lint'
                                }
                            }
                        }
                        stage('Frontend - Build') {
                            steps {
                                dir('apps/frontend') {
                                    sh 'npm run build'
                                }
                            }
                        }
                        stage('Frontend - Test') {
                            steps {
                                dir('apps/frontend') {
                                    sh 'npm test'
                                }
                            }
                        }
                    }
                }
            }
        }

        // Quality Gate
        stage('Coverage Check') {
            steps {
                script {
                    def coverageFile = readFile('apps/backend/coverage/coverage-summary.json')
                    def coverage = readJSON text: coverageFile
                    def lineCoverage = coverage.total.lines.pct

                    echo "Backend Line Coverage: ${lineCoverage}%"

                    if (lineCoverage < 60) {
                        error "Coverage ${lineCoverage}% is below the 60% threshold"
                    }
                }
            }
        }

        // Docker Build
        stage('Docker Build') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('apps/backend') {
                            sh "docker build -t todo-backend:${BUILD_NUMBER} ."
                            sh "docker tag todo-backend:${BUILD_NUMBER} todo-backend:latest"
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('apps/frontend') {
                            sh "docker build -t todo-frontend:${BUILD_NUMBER} ."
                            sh "docker tag todo-frontend:${BUILD_NUMBER} todo-frontend:latest"
                        }
                    }
                }
            }
        }

        // Deploy to Staging
        stage('Deploy to Staging') {
            steps {
                sh "docker compose -f docker-compose.staging.yml down || true"
                sh "BUILD_NUMBER=${BUILD_NUMBER} docker compose -f docker-compose.staging.yml up -d"
                echo "Staging 배포 완료"
            }
        }

        // Manual Approval
        stage('Production 배포 승인') {
            steps {
                input message: 'Staging 검증 완료 후 Production에 배포하시겠습니까?',
                      ok: '배포',
                      submitter: 'admin'
            }
        }

        // Deploy to Production
        stage('Deploy to Production') {
            steps {
                sh "docker compose -f docker-compose.prod.yml down || true"
                sh "BUILD_NUMBER=${BUILD_NUMBER} docker compose -f docker-compose.prod.yml up -d"
                echo "Production 배포 완료"
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: '**/test-results.xml'
            archiveArtifacts artifacts: '**/coverage/**', allowEmptyArchive: true
        }
        success {
            sh '''
                curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                  --data-urlencode "parse_mode=HTML" \
                  --data-urlencode "text=<b>Jenkins CI/CD</b>
<b>Build:</b> #${BUILD_NUMBER}
<b>Status:</b> SUCCESS
<b>Staging:</b> http://localhost:3000
<b>Production:</b> http://localhost:4000"
            '''
        }
        failure {
            sh '''
                curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                  --data-urlencode "parse_mode=HTML" \
                  --data-urlencode "text=<b>Jenkins CI/CD</b>
<b>Build:</b> #${BUILD_NUMBER}
<b>Status:</b> FAILED
<b>Check:</b> ${BUILD_URL}"
            '''
        }
    }
}
