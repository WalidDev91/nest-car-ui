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

        stage('Docker Build') {
            steps {
                sh 'docker build -t fleet-management-frontend:latest .'
            }
        }
    }

    post {
        success {
            echo 'Frontend CI completed successfully.'
        }

        failure {
            echo 'Frontend CI failed.'
        }
    }
}