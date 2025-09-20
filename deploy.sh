#!/bin/bash

set -e


cd /home/ubuntu/federal/nc-onboarding

file_path="package.json"

sleep 2

#Step-1 upating code
#echo "Step-1 Updating the code (pulling changes from 'UAT' branch)"
sudo git pull "https://dhananjayakumar.n:glpat-aasEJmvcS4HY9UsuypsS@gitlab.loan2pal.com/nm-core-web-application/nc-onboarding.git" FEDERAL-18-MARCH-24
#if sudo git pull "https://dhananjayakumar.n:glpat-aasEJmvcS4HY9UsuypsS@gitlab.loan2pal.com/nm-core-web-application/nc-onboarding.git" UAT| grep -q 'Already up to date'; then
#    echo "No changes to pull. Exiting script."
#    exit 0
#fi 

echo "Change homepage in package.json"
sudo sed -i '2i\    "homepage": "/nconboarding/",' "$file_path"


# Define the path to store the build counter
BUILD_COUNTER_FILE="build_counter.txt"

# Check if the build counter file exists
if [ ! -f "$BUILD_COUNTER_FILE" ]; then
    echo "0" > "$BUILD_COUNTER_FILE"
fi

# Read the current build number from the file
CURRENT_BUILD=$(<"$BUILD_COUNTER_FILE")

# Increment the build number
NEW_BUILD=$((CURRENT_BUILD + 1))

# Update the build counter file with the new build number
echo "$NEW_BUILD" > "$BUILD_COUNTER_FILE"

# Build the Docker image and tag it with a specific version
IMAGE_TAG=$(date +%Y%m%d)-$NEW_BUILD



#Step-2
echo "Step-2 Login in to ECR"
aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 935253607420.dkr.ecr.ap-south-1.amazonaws.com


#Step-3
echo "Step-3 Build and tagging image"
sudo docker build -t 935253607420.dkr.ecr.ap-south-1.amazonaws.com/federal-prod-nconboarding:$IMAGE_TAG .

#Step-4
echo "Step-4 Pushing Imags to ECR"
sudo docker push 935253607420.dkr.ecr.ap-south-1.amazonaws.com/federal-prod-nconboarding:$IMAGE_TAG

echo "Revert back homepage in package.json"
sudo sed -i '/"homepage": "\/nconboarding\/",/d' "$file_path"


echo "Script Completed"


