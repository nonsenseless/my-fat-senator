#!/bin/bash
# Improvements: Toggle commands from args, pass in and override flags.
SESSION_SECRET="my-secret"
PORTS=8080:8080
TAG=my-fat-senator

docker build -t $TAG .
# dotenv only works in dev; docker is set to production 
# so we need to manually set a value for the container
# The value for local dev is irrelevant
docker run -it -p $PORTS --env SESSION_SECRET=$SESSION_SECRET $TAG
