pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // Kodunuzu Git'ten çeker
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Docker imajları oluşturuluyor...'
                sh 'docker-compose build'
            }
        }

        stage('Test') {
            steps {
                echo 'Testler çalıştırılıyor...'
                // Eğer testleriniz varsa yorum satırını kaldırarak buraya ekleyebilirsiniz:
                // sh 'docker-compose run --rm backend npm test'
                // sh 'docker-compose run --rm frontend npm test'
            }
        }

        stage('Deploy (Canlıya Alma)') {
            steps {
                echo 'Uygulama Docker Compose ile ayağa kaldırılıyor...'
                // Jenkins'in kendi içinden komutları çalıştırarak projeyi başlatır
                // Not: Jenkins docker içindeyse, ana makinenin docker'ına erişmesi gerekebilir
                // Şimdilik temel başlatma komutunu ekliyoruz:
                sh 'docker-compose up -d'
            }
        }
    }
}
