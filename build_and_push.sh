#!/bin/bash

# Variables
AWS_REGION="ca-central-1"  # e.g., us-east-1
ECR_REPO_NAME="personal-web"  # e.g., my-nextjs-app
IMAGE_TAG="1.0.1"  # You can change this to a specific version if needed
AWS_ACCOUNT_ID="182491688958"  # Replace with your actual AWS account ID
OPENAI_API_KEY="sk-proj-123"  # Add your OpenAI API key here

# Login to AWS ECR
echo "Logging in to AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build the Docker image
echo "Building the Docker image..."
docker build --platform=linux/amd64 --build-arg OPENAI_API_KEY=$OPENAI_API_KEY -t $ECR_REPO_NAME .

# Tag the Docker image
echo "Tagging the Docker image..."
docker tag $ECR_REPO_NAME:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# Push the Docker image to ECR
echo "Pushing the Docker image to ECR..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

echo "Docker image pushed successfully!"