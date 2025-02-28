#!/bin/bash

# Create a deployment package
echo "Creating deployment package..."
mkdir -p deployment

# Install packages directly in the deployment directory
pip install --target ./deployment numpy pandas scikit-learn joblib

# Copy model files and lambda code
cp -r models ./deployment/
cp lambda_function.py ./deployment/

# Create zip properly
cd deployment
zip -r ../lambda_deployment.zip .
cd ..

# Verify zip contents
echo "Verifying zip contents..."
unzip -l lambda_deployment.zip | grep -E 'joblib|numpy|pandas|scikit'

echo "Deployment package created: lambda_deployment.zip" 