output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "rds_endpoint" {
  description = "The connection endpoint for PostgreSQL RDS"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_database_name" {
  description = "The PostgreSQL database name"
  value       = aws_db_instance.postgres.db_name
}

output "app_runner_service_url" {
  description = "The public URL of the deployed NestJS Backend on AWS App Runner"
  value       = aws_apprunner_service.backend.service_url
}
