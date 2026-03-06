pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                dir('apps/frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('apps/frontend') {
                    sh 'npx eslint src/'
                }
            }
        }

        stage('Build') {
            steps {
                dir('apps/frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('apps/frontend') {
                    sh 'npm test'
                }
            }
            post {
                always {
                    junit 'apps/frontend/test-results.xml'
                }
            }
        }
    }

    post {
        failure {
            echo 'Frontend CI 실패!'
        }
        success {
            echo 'Frontend CI 성공!'
        }
    }
}
