FROM debian:latest

MAINTAINER ANH TO

# nginx version check here "http://nginx.org/download/" for available versions
ENV NGINX_VERSION 1.11.0
ENV NGINX_PUSH_STREAM_MODULE_PATH /Sources/nginx-push-stream-module
ENV LUAJIT_VERSION 2.0
ENV LUAJIT_LIB /usr/local/lib
ENV LUAJIT_INC /usr/local/include/luajit-${LUAJIT_VERSION}

RUN apt-get update \ 
    && apt-get install -y \ 
       wget \ 
       git \ 
       gcc \
       build-essential \ 
       libc6 \ 
       libpcre3 \ 
       libpcre3-dev \ 
       libssl-dev \ 
       zlib1g \
       zlib1g-dev \ 
       lsb-base

RUN git clone https://github.com/wandenberg/nginx-push-stream-module.git \
    && git clone http://luajit.org/git/luajit-${LUAJIT_VERSION}.git  \
    && cd luajit-${LUAJIT_VERSION} \
    && make \
    && make install \
    && cd / && git clone https://github.com/openresty/lua-nginx-module.git \
    && mv /lua-nginx-module /usr/local/src/lua-nginx-module \
    && git clone https://github.com/simplresty/ngx_devel_kit.git \
    && mv /ngx_devel_kit /usr/local/src/ngx-devel-kit \
    && wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && tar xzvf nginx-${NGINX_VERSION}.tar.gz \
    && cd nginx-${NGINX_VERSION} \
    && ./configure --add-module=../nginx-push-stream-module --with-http_secure_link_module --with-ld-opt="-Wl,-rpath,$LUAJIT_LIB" --add-module=/usr/local/src/lua-nginx-module --add-module=/usr/local/src/ngx-devel-kit \
    && make \
    && make install

# ADD Command copy the files from source on the host to destination on the container's file system
# Usage: ADD source destination
ADD ./conf/nginx-original.conf /nginx.conf

RUN apt-get purge -y \
    wget \
    git \
    gcc \
    && apt-get clean

# Usage: EXPOSE [port]
EXPOSE 9080
CMD ["/usr/local/nginx/sbin/nginx", "-c", "/nginx.conf"]

