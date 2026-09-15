pipeline {
    agent any

    tools {
        nodejs 'Node 22'
    }

    environment {
        DATABASE_URL = credentials('nextapp-database-url')
        BETTER_AUTH_SECRET = credentials('nextapp-better-auth-secret')
        CLOUDINARY_CLOUD_NAME = credentials('nextapp-cloudinary-cloud-name')
    }

    stages {

        stage('Checkout') {
            steps {
                sh 'git config --global --add safe.directory /var/jenkins_home/workspace/next-match-prova'
                sh 'git fetch --all'
                sh 'git checkout main'
                sh 'git reset --hard origin/main'
            }
        }

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
                sh 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" -t next-match:ci .'
            }
        }

        stage('Docker Run') {
            steps {
                sh 'docker rm -f next-match || true'
                sh 'docker run -d --name next-match --network nextjs16_default -p 3000:3000 -e DATABASE_URL="$DATABASE_URL" -e BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" -e BETTER_AUTH_URL="http://localhost:3000" -e NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" next-match:ci'
            }
        }
    }
}