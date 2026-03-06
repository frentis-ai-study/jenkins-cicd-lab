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
            post {
                always {
                    junit 'apps/backend/test-results.xml'
                }
            }
        }
    }

    post {
        failure {
            echo 'Backend CI 실패!'
        }
        success {
            echo 'Backend CI 성공!'
        }
    }
}
