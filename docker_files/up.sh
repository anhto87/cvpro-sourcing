#!/bin/bash

docker-compose -p cvpro up -d
docker-compose -p cvpro -f nginx-proxy.yml up -d
