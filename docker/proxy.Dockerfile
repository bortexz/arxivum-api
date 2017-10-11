FROM jwilder/nginx-proxy:latest
RUN mkdir /etc/nginx/vhost.d
RUN { \
      echo 'client_max_body_size 0;'; \
    } > /etc/nginx/vhost.d/arxivum-api.bertofer.me
