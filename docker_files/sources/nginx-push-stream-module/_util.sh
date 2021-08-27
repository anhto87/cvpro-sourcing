#!/bin/bash

KEY=$1
APP_SECRET=$2

echo -n $KEY' '$APP_SECRET | openssl md5 -binary | openssl base64 | tr +/ -_ | tr -d =