pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "${tool 'SonarScanner'}/bin/sonar-scanner"
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t fleet-management-frontend:latest .'
                sh "docker tag fleet-management-frontend:latest ghcr.io/waliddev91/fleet-management-frontend:build-${env.BUILD_NUMBER}"
                sh 'docker tag fleet-management-frontend:latest ghcr.io/waliddev91/fleet-management-frontend:latest'
            }
        }
        stage('Push to GHCR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-ghcr',
                    usernameVariable: 'GHCR_USERNAME',
                    passwordVariable: 'GHCR_TOKEN'
                )]) {
                    retry(3) {
                        sh '''
                            echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
                            docker push ghcr.io/waliddev91/fleet-management-frontend:build-${BUILD_NUMBER}
                        '''
                    }
                    retry(3) {
                        sh '''
                            echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
                            docker push ghcr.io/waliddev91/fleet-management-frontend:latest
                        '''
                    }
                    sh 'docker logout ghcr.io'
                }
            }
        }
    }
    post {
        success {
            echo 'Frontend CI completed successfully and Docker images were pushed to GHCR.'
        }
        failure {
            echo 'Frontend CI failed.'
        }
    }
}