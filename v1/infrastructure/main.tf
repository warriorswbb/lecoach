provider "aws" {
  region = "us-west-2"
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier           = "v1-postgres"
  engine              = "postgres"
  engine_version      = "14"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  storage_type        = "gp2"
  username           = "postgres"
  password           = var.db_password
  skip_final_snapshot = true
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "v1-cluster"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "v1-app"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 256
  memory                  = 512

  container_definitions = jsonencode([
    {
      name  = "v1-app"
      image = "${aws_ecr_repository.app.repository_url}:latest"
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://postgres:${var.db_password}@${aws_db_instance.postgres.endpoint}/app"
        }
      ]
    }
  ])
}

# ECR Repository
resource "aws_ecr_repository" "app" {
  name = "v1-app"
} 