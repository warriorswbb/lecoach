#!/bin/bash

# Create a deployment package
echo "Creating deployment package..."
mkdir -p deployment
pip install --target ./deployment numpy pandas scikit-learn joblib
cp -r models ./deployment/
cp lambda_function.py ./deployment/
cd deployment
zip -r ../lambda_deployment.zip .
cd ..
echo "Deployment package created: lambda_deployment.zip" 