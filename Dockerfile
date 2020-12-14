FROM mhart/alpine-node:slim-14

ENV APP_WORKDIR=/builds/bloxapp/blox-staking-web

RUN apk update && apk upgrade && \
    apk add --virtual build-deps git gcc make g++ py-pip curl --no-cache \
        nodejs \
        yarn

COPY . $APP_WORKDIR
WORKDIR $APP_WORKDIR
RUN yarn build

#RUN sleep 1000000000
