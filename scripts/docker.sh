#!/bin/bash
# Improvements: Toggle commands from args, pass in and override flags.
SESSION_SECRET="my-secret"
PORTS=8080:8080
TAG=my-fat-senator

docker build -t $TAG .
docker run -it -p $PORTS --env SESSION_SECRET=$SESSION_SECRET $TAG
