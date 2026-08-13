# IAM Role for App Runner
resource "aws_iam_role" "app_runner_role" {
  name = "${var.project_name}-app-runner-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

# AWS App Runner Service for NestJS REST API
resource "aws_apprunner_service" "backend" {
  service_name = "${var.project_name}-backend"

  source_configuration {
    auto_deployments_enabled = false

    code_repository {
      repository_url = "https://github.com/aadieng100/AI_Evaluation_Task_Manager"
      target_directory = "backend"

      source_code_version {
        type  = "BRANCH"
        value = "main"
      }

      code_configuration {
        configuration_source = "API"

        code_configuration_values {
          build_command = "npm install && npx prisma generate && npm run build"
          start_command = "npm run start:prod"
          port          = "3000"
          runtime       = "NODEJS_18"

          runtime_environment_variables = {
            NODE_ENV     = "production"
            PORT         = "3000"
            DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}?schema=public"
          }
        }
      }
    }
  }

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }

  tags = {
    Name = "${var.project_name}-apprunner-backend"
  }
}
