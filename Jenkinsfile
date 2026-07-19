pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        booleanParam(name: 'DEPLOY_CONTAINERS', defaultValue: true, description: 'Build and start the Docker Compose services.')
        booleanParam(name: 'FORCE_RECREATE', defaultValue: true, description: 'Recreate containers during docker compose up.')
        string(name: 'COMPOSE_PROJECT_NAME', defaultValue: 'sitxplore', description: 'Docker Compose project name.')
        string(name: 'BACKEND_ENV_CREDENTIALS_ID', defaultValue: '', description: 'Optional Jenkins Secret File credential containing backend/.env contents.')
        string(name: 'LOCAL_PROJECT_PATH', defaultValue: 'C:\\Users\\somay\\.gemini\\antigravity\\scratch\\sitxplore-tours', description: 'Local project path on the Jenkins machine when not using SCM checkout.')
    }

    environment {
        COMPOSE_FILE_PATH = 'docker-compose.yml'
        BACKEND_ENV_PATH = 'backend/.env'
        BACKEND_URL = 'http://localhost:5000/'
        FRONTEND_URL = 'http://localhost:5173/'
        ADMIN_URL = 'http://localhost:5174/'
    }

    stages {
        stage('Prepare Workspace') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"

                    $sourcePath = "${params.LOCAL_PROJECT_PATH}"
                    if ([string]::IsNullOrWhiteSpace($sourcePath)) {
                        $sourcePath = "C:\\Users\\somay\\.gemini\\antigravity\\scratch\\sitxplore-tours"
                    }

                    if (-not (Test-Path -LiteralPath $sourcePath)) {
                        throw "Project path not found: $sourcePath"
                    }

                    Copy-Item -Path (Join-Path $sourcePath '*') -Destination $PWD -Recurse -Force

                    if (-not (Test-Path -LiteralPath $env:COMPOSE_FILE_PATH)) {
                        throw "docker-compose.yml was not copied into the Jenkins workspace."
                    }

                    Write-Host "Project copied from $sourcePath into Jenkins workspace."
                '''
            }
        }

        stage('Verify Tooling') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"

                    docker version
                    docker compose version
                '''
            }
        }

        stage('Prepare Backend Env') {
            steps {
                script {
                    if (params.BACKEND_ENV_CREDENTIALS_ID?.trim()) {
                        withCredentials([file(credentialsId: params.BACKEND_ENV_CREDENTIALS_ID.trim(), variable: 'BACKEND_ENV_FILE')]) {
                            powershell '''
                                $ErrorActionPreference = "Stop"

                                Copy-Item -LiteralPath $env:BACKEND_ENV_FILE -Destination $env:BACKEND_ENV_PATH -Force
                                Write-Host "Injected backend environment file from Jenkins credentials."
                            '''
                        }
                    } else {
                        powershell '''
                            $ErrorActionPreference = "Stop"

                            if (-not (Test-Path -LiteralPath $env:BACKEND_ENV_PATH)) {
                                throw "backend/.env is missing. Commit a non-sensitive env file for local builds or provide BACKEND_ENV_CREDENTIALS_ID in Jenkins."
                            }

                            Write-Host "Using repository backend/.env file."
                        '''
                    }
                }
            }
        }

        stage('Build Images') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"
                    $env:COMPOSE_PROJECT_NAME = "${params.COMPOSE_PROJECT_NAME}"

                    docker compose -f $env:COMPOSE_FILE_PATH build --pull
                '''
            }
        }

        stage('Deploy Containers') {
            when {
                expression { return params.DEPLOY_CONTAINERS }
            }
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"
                    $env:COMPOSE_PROJECT_NAME = "${params.COMPOSE_PROJECT_NAME}"

                    $containerNames = @(
                        "sitxplore-backend",
                        "sitxplore-frontend",
                        "sitxplore-admin"
                    )

                    foreach ($containerName in $containerNames) {
                        $existingId = docker ps -aq --filter "name=^${containerName}$"
                        if ($existingId) {
                            Write-Host "Removing existing container $containerName"
                            docker rm -f $containerName
                        }
                    }

                    docker compose -f $env:COMPOSE_FILE_PATH down --remove-orphans

                    $upArgs = @("compose", "-f", $env:COMPOSE_FILE_PATH, "up", "-d")
                    if ("${params.FORCE_RECREATE}" -eq "true") {
                        $upArgs += "--force-recreate"
                    }

                    docker @upArgs
                '''
            }
        }

        stage('Health Checks') {
            when {
                expression { return params.DEPLOY_CONTAINERS }
            }
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"

                    function Wait-ForHttp200 {
                        param(
                            [Parameter(Mandatory = $true)]
                            [string] $Url,
                            [Parameter(Mandatory = $true)]
                            [string] $Name
                        )

                        $maxAttempts = 20
                        for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
                            try {
                                $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
                                if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                                    Write-Host "$Name is healthy at $Url"
                                    return
                                }
                            } catch {
                                Write-Host ("Attempt {0}/{1}: waiting for {2} at {3}" -f $attempt, $maxAttempts, $Name, $Url)
                            }

                            Start-Sleep -Seconds 5
                        }

                        throw "$Name did not become healthy at $Url"
                    }

                    Wait-ForHttp200 -Url $env:BACKEND_URL -Name "Backend"
                    Wait-ForHttp200 -Url $env:FRONTEND_URL -Name "Frontend"
                    Wait-ForHttp200 -Url $env:ADMIN_URL -Name "Admin"
                '''
            }
        }
    }

    post {
        always {
            powershell '''
                $ErrorActionPreference = "Continue"
                $env:COMPOSE_PROJECT_NAME = "${params.COMPOSE_PROJECT_NAME}"

                if (Test-Path -LiteralPath $env:COMPOSE_FILE_PATH) {
                    docker compose -f $env:COMPOSE_FILE_PATH ps
                } else {
                    Write-Host "Skipping docker compose ps because docker-compose.yml is not present in the workspace."
                }
            '''
        }

        failure {
            powershell '''
                $ErrorActionPreference = "Continue"
                $env:COMPOSE_PROJECT_NAME = "${params.COMPOSE_PROJECT_NAME}"

                if (Test-Path -LiteralPath $env:COMPOSE_FILE_PATH) {
                    docker compose -f $env:COMPOSE_FILE_PATH logs --no-color --tail 200
                } else {
                    Write-Host "Skipping docker compose logs because docker-compose.yml is not present in the workspace."
                }
            '''
        }

        cleanup {
            script {
                if (params.BACKEND_ENV_CREDENTIALS_ID?.trim()) {
                    powershell '''
                        $ErrorActionPreference = "Continue"

                        if (Test-Path -LiteralPath $env:BACKEND_ENV_PATH) {
                            Remove-Item -LiteralPath $env:BACKEND_ENV_PATH -Force
                        }
                    '''
                }
            }
        }
    }
}
