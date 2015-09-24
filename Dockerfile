FROM ubuntu:14.04

## Install all dependencies
RUN apt-get update && apt-get install -y \
  default-jre \
  git \
  mongodb \
  nodejs

RUN sudo ln -s /usr/bin/nodejs /usr/bin/node
RUN apt-get install -y npm

RUN npm install -g bower gulp protractor
RUN webdriver-manager update

## Install the app
## See: http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
COPY bower.json /tmp/bower.json
RUN cd /tmp && bower --allow-root install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/ && cp -a /tmp/bower_components /app/

COPY . /app
WORKDIR /app

EXPOSE  8080

ENTRYPOINT ["./docker-entrypoint.sh"]
