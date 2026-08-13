# AI Evaluation Task Manager

> **Internal Platforms Engineering Benchmark Application**  
> Built as a demonstration project for the **Software Engineer, Internal Platforms** role at **micro1**.

---

## 🚀 Overview

The **AI Evaluation Task Manager** is a high-performance internal platform designed for AI Trainers and Model Evaluation Specialists to benchmark, compare side-by-side, and score large language model (LLM) outputs (e.g., Claude 3.5 Sonnet vs. GPT-4o vs. Llama 3 70B).

It enforces strict task assignment governance (`PENDING` -> `ASSIGNED` -> `IN_REVIEW` -> `COMPLETED`), multi-criteria evaluation metrics (stored flexibly in PostgreSQL `JSONB`), and end-to-end type safety across NestJS, Prisma ORM, and React 18.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend API** | **Node.js (NestJS)** | Enterprise REST API with modular architecture (`Users`, `Tasks`, `Evaluations`), Dependency Injection, DTO validation via `class-validator`, and native Swagger/OpenAPI documentation (`/api/docs`). |
| **Database** | **PostgreSQL + Prisma ORM** | Relational data integrity with UUID primary keys, transactional evaluation submissions (`$transaction`), and flexible JSONB column (`metrics`) for evolving LLM criteria. |
| **Frontend Dashboard** | **React 18 (Vite + TS)** | Modern Dark Mode Glassmorphism UI with Tailwind CSS, Lucide Icons, Side-by-Side LLM Output Comparer, Star Ratings, and Offline-First API fallback. |
| **Infrastructure as Code** | **Terraform (AWS)** | Modular IaC scripts provisioning AWS VPC, Public Subnets, Security Groups, RDS PostgreSQL Instance (`db.t4g.micro`), and AWS App Runner service. |

---

## 📁 Repository Structure

```
AI_Evaluation_Task Manager/
├── backend/                  # NestJS REST API Server & Prisma Schema
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL Schema Definition
│   │   └── seed.ts           # Database Seeding Script (Users, Tasks, Results)
│   └── src/                  # NestJS Modules (Users, Tasks, Evaluations, Prisma)
├── frontend/                 # React 18 + Vite SPA Dashboard
│   └── src/
│       ├── components/       # UI Components (TaskCard, Side-by-Side Modal, Navbar, Metrics)
│       └── services/api.ts   # Backend API Client + Offline Fallback Mock
├── terraform/                # Infrastructure as Code (AWS RDS, App Runner, VPC)
│   ├── main.tf               # Provider & Networking
│   ├── rds.tf                # AWS RDS PostgreSQL Instance
│   ├── app_runner.tf         # AWS App Runner Deployment
│   ├── variables.tf          # Configurable Input Variables
│   └── outputs.tf            # Deployment Outputs
└── README.md
```

---

## 💻 Local Setup & Execution

### 1. Backend Setup (NestJS + Prisma)

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# (Optional) Seed Mock Data into local PostgreSQL
npm run prisma:seed

# Start NestJS REST API Server (runs on http://localhost:3000)
npm run start:dev
```
> 📖 Interactive Swagger API Documentation is accessible at **`http://localhost:3000/api/docs`**

### 2. Frontend Setup (React 18 + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Launch Vite Dev Server (runs on http://localhost:5173)
npm run dev
```

---

## ☁️ AWS Infrastructure as Code (Terraform)

The `terraform/` directory contains complete, production-ready IaC scripts for AWS provisioning:

```bash
cd terraform

# Initialize Terraform AWS provider
terraform init

# Validate execution plan
terraform plan

# (Optional Deployment) Deploy to AWS Cloud
# terraform apply

# Tear down all cloud resources in 1-command
# terraform destroy
```

---

## 🎯 Key Internal Platform Features

- **Side-by-Side Model Comparison**: Inspect outputs from Model A vs Model B with code formatting and 1-click clipboard copy.
- **Atomic Evaluation Submissions**: Transactional state transition using `prisma.$transaction` ensuring that submitting a review automatically marks the task `COMPLETED` atomically.
- **Dynamic JSONB Metrics**: Flexible evaluation criteria (Accuracy, Safety, Latency, Conciseness) stored dynamically without schema migration overhead.
- **Strict Payload Validation**: Global NestJS `ValidationPipe` with `whitelist: true` preventing unwanted or malformed payload injection.
