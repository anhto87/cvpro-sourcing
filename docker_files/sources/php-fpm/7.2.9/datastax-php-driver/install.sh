#!/bin/bash

set -eux
cd lib/cpp-driver
mkdir -p build
pushd build
cmake ..
make && make install
popd

cd /usr/src/php-driver/
pushd ext
phpize
popd
mkdir -p build
pushd build
../ext/configure
make && make install
popd

cp /usr/local/lib/x86_64-linux-gnu/libcassandra.so* /usr/lib/x86_64-linux-gnu/
echo 'extension=cassandra.so' > /usr/local/etc/php/conf.d/cassandra.ini;