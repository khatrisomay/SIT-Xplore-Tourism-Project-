terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1" # Mumbai region
}

# Future EKS (Elastic Kubernetes Service) Cluster definition
resource "aws_eks_cluster" "sitxplore_cluster" {
  name     = "sitxplore-production-cluster"
  role_arn = "arn:aws:iam::123456789012:role/eks-service-role-dummy"

  vpc_config {
    subnet_ids = ["subnet-0123456789abcdef0", "subnet-0123456789abcdef1"]
  }

  tags = {
    Environment = "production"
    Project     = "SIT-Xplore"
  }
}
