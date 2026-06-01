pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // Jenkins, arayüzde girdiğin Git reposunu buraya indirecek
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Eski önbellek temizleniyor ve yeni imajlar derleniyor...'
                sh 'docker compose build --no-cache'
            }
        }

        stage('Deploy (Ayağa Kaldırma)') {
            steps {
                echo 'Uygulama Docker Compose ile arka planda güncelleniyor...'
                sh 'docker compose up -d'
            }
        }
    }
}