provider "aws" {
  region = "ap-south-1" # Mumbai region for India-based startup SIT Xplore
}

# Create a VPC
resource "aws_vpc" "sitxplore_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "sitxplore-vpc"
  }
}

# Create a Subnet
resource "aws_subnet" "sitxplore_subnet" {
  vpc_id                  = aws_vpc.sitxplore_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "sitxplore-subnet"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "sitxplore_gw" {
  vpc_id = aws_vpc.sitxplore_vpc.id

  tags = {
    Name = "sitxplore-gateway"
  }
}

# Create a Route Table
resource "aws_route_table" "sitxplore_rt" {
  vpc_id = aws_vpc.sitxplore_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.sitxplore_gw.id
  }

  tags = {
    Name = "sitxplore-route-table"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "sitxplore_rta" {
  subnet_id      = aws_subnet.sitxplore_subnet.id
  route_table_id = aws_route_table.sitxplore_rt.id
}

# Create Security Group
resource "aws_security_group" "sitxplore_sg" {
  name        = "sitxplore-security-group"
  description = "Allow inbound web traffic and SSH"
  vpc_id      = aws_vpc.sitxplore_vpc.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Express Backend API
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Client Frontend Web
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Admin Dashboard Panel
  ingress {
    from_port   = 5174
    to_port     = 5174
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sitxplore-security-group"
  }
}

# Deploy an EC2 Instance
resource "aws_instance" "sitxplore_server" {
  ami                    = "ami-053b0d53c279acc90" # Ubuntu Server 22.04 LTS Mumbai
  instance_type          = "t3.medium" # Enough resources for backend + 2 React builds
  subnet_id              = aws_subnet.sitxplore_subnet.id
  vpc_security_group_ids = [aws_security_group.sitxplore_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io docker-compose
              sudo systemctl start docker
              sudo systemctl enable docker
              EOF

  tags = {
    Name = "sitxplore-prod-server"
  }
}

output "public_ip" {
  value       = aws_instance.sitxplore_server.public_ip
  description = "The public IP address of the EC2 deployment server."
}
