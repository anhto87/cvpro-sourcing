#!/bin/bash

docker-compose -p cvpro down
docker-compose -p cvpro -f nginx-proxy.yml down
