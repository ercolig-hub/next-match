pipeline {
    agent any

    tools {
        nodejs 'Node 22'
    }

    environment {
        DATABASE_URL = credentials('nextapp-database-url')
    }

    stages {

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Prisma Generate') {
            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}