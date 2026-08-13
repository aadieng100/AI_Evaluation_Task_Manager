variable "aws_region" {
  description = "AWS region for internal platform resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment identifier (e.g. production, staging, sandbox)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name identifier"
  type        = string
  default     = "ai-evaluation-task-manager"
}

variable "db_name" {
  description = "PostgreSQL Database Name"
  type        = string
  default     = "ai_evaluation_db"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
  default     = "SuperSecurePassword123!"
}
