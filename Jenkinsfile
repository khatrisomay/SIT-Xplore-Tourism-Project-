pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sitxplore-backend:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Image') {
            steps {
                echo 'Building Docker image for SIT Xplore...'
                // sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }
        stage('Test') {
            steps {
                echo 'Running automated tests...'
                // sh "npm test"
            }
        }
        stage('Deploy to K8s') {
            steps {
                echo 'Deploying to Kubernetes cluster...'
                // sh "kubectl apply -f k8s/"
            }
        }
    }
}
