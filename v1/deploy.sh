#!/bin/bash

# AWS Configuration
AWS_REGION="us-west-2"  # or your preferred region
ECR_REPO_NAME="v1-app"
ECS_CLUSTER_NAME="v1-cluster"
ECS_SERVICE_NAME="v1-service"

# Login to AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the production image
docker-compose -f docker-compose.prod.yml build

# Tag and push to ECR
docker tag v1-app:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# Update ECS service
aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --force-new-deployment 