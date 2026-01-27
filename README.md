# Development-of-Big-Data-Pipeline-for-Healthcare-Analytics-using-Python
Healthcare Analytics Platform

End-to-End Data Pipeline using MongoDB, Apache Airflow, AWS & Streamlit

📌 Project Overview

This project implements a full-stack healthcare analytics system that enables data ingestion, automated ETL, and analytical visualization.

The system consists of:

A web interface for uploading patient and visit data

A batch analytics pipeline orchestrated using Apache Airflow

AWS-based storage and processing

An interactive Streamlit dashboard for insights and monitoring

The goal is to demonstrate production-style data engineering practices including orchestration, cloud storage, automation, and analytics.

🧱 Repository Structure
├── interface-main/        # Frontend interface (Render + Vercel)
├── airflow/               # Airflow DAGs and ETL logic
├── dashboard/             # Streamlit analytics dashboard
├── .gitignore
└── README.md

🏗️ High-Level Architecture
Interface (Vercel / Render)
        ↓
MongoDB (Operational Data Store)
        ↓
Apache Airflow (EC2 – Ubuntu)
        ↓
AWS S3 (Raw + Processed Data)
        ↓
AWS Glue (ETL & Aggregations)
        ↓
Streamlit Dashboard

🧑‍💻 Interface Layer (interface-main/)

Provides Admin and Doctor panels

Used to upload:

Patient data

Visit records

Prescription information

Data is stored in MongoDB

Deployed using:

Render (backend)

Vercel (frontend)

This layer acts as the data producer for the analytics pipeline.

⚙️ Airflow & ETL Pipeline (airflow/)
🔹 Infrastructure

Ubuntu Server on AWS EC2

Apache Airflow installed using pip

Airflow runs as a standalone orchestrator

🔹 Airflow Responsibilities

Extract data from MongoDB

Upload raw batches to AWS S3

Trigger AWS Glue jobs for:

Data cleaning

Fact table generation

Aggregations

🔹 DAG Setup

DAGs are located inside airflow/dags/

DAGs are time-based (scheduled) and manually triggerable

DAG configuration (S3 paths, Glue job names, etc.) is handled directly in code using:

Airflow Variables

Environment-based constants

🔹 Airflow Setup (Ubuntu EC2)

High-level steps:

# System setup
sudo apt update
sudo apt install python3-pip -y

# Airflow installation
pip install apache-airflow

# Initialize Airflow
airflow db init
airflow users create
airflow standalone


Runtime files like logs and metadata DB are intentionally excluded from version control.

☁️ AWS Involvement

AWS is used as the analytics backbone:

Amazon EC2
Hosts Apache Airflow on Ubuntu

Amazon S3

data-raw/ → raw batch uploads from MongoDB

data-processed/ → cleaned & aggregated outputs

AWS Glue

ETL jobs for cleaning healthcare data

Fact table and aggregation generation

Airflow orchestrates AWS services using scheduled DAGs.

📊 Analytics Dashboard (dashboard/)
🔹 Technology

Built using Streamlit

Reads processed data from AWS S3

Displays:

Visit trends

Patient metrics

Aggregated healthcare insights

🔹 Dashboard Setup
pip install -r requirements.txt
streamlit run app.py

🔹 AWS Connectivity

Uses AWS credentials via:

IAM Role (recommended on EC2)

or environment variables for local testing

export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=...

🔐 Configuration & Security

Sensitive files are excluded via .gitignore

AWS credentials are never committed

Runtime artifacts (logs, cache, DB files) are ignored

🎯 Key Highlights

End-to-end data engineering workflow

Production-style Airflow orchestration

Cloud-native analytics using AWS

Clean separation of interface, pipeline, and analytics

GitHub-ready, reproducible setup

🚀 Future Enhancements

Real-time ingestion using Kafka/Kinesis

Role-based dashboard access

Integration with real EHR systems
