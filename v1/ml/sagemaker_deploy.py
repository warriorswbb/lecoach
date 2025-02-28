import boto3
import sagemaker
from sagemaker.sklearn import SKLearnModel
import os

# Set up SageMaker session
sagemaker_session = sagemaker.Session()
role = "YOUR_SAGEMAKER_ROLE_ARN"  # IAM role with SageMaker permissions

# Package your model
os.system("mkdir -p sagemaker_model/code")
os.system("cp -r models sagemaker_model/")
os.system("cp inference.py sagemaker_model/code/")
os.system("cd sagemaker_model && tar -czvf ../model.tar.gz * && cd ..")

# Create SageMaker model
model = SKLearnModel(
    model_data=f"file://{os.getcwd()}/model.tar.gz",
    role=role,
    entry_point="inference.py",
    framework_version="1.0-1",
    py_version="py3",
)

# Deploy to serverless endpoint
predictor = model.deploy(
    serverless_inference_config=sagemaker.ServerlessInferenceConfig(
        memory_size_in_mb=2048,
        max_concurrency=5,
    ),
    initial_instance_count=1,
    instance_type="ml.m5.large"  # Ignored for serverless
)

print(f"Model deployed to endpoint: {predictor.endpoint_name}") 