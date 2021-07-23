# syntax = docker/dockerfile:experimental

##
## Base
##
FROM node:14-alpine as install-prep

ARG BUILD_DIR=packages/agent

WORKDIR /opt/demo

##
## Only include non stateful files from yarn
## If your set has files elsewhere you may need to change this
## to include or exclude yarn files as needed.
##
## .yarn/*
## !.yarn/cache
## !.yarn/releases
## !.yarn/plugins
##

COPY ${BUILD_DIR}/package.json ${BUILD_DIR}/
COPY package.json yarn.lock .yarnrc.yml .pnp.js codegen.yml tsconfig.base.json .
COPY .yarn/ /opt/demo/.yarn/

##
## If your workspace depends on any other workspace
## include them here also
## ie: COPY packages/requiredbydemo/ /opt/demo/packages/requiredbydemo/
## You could optionly run the install out of docker however if you do
## have compiled binaries that depend on system libaries you should
## compile them with in your docker to ensure they are compatable
##
## You should also install any compile-time system libaries not included
## by defautl from your base image.
##

COPY packages/common /opt/demo/packages/common
COPY packages/connectors /opt/demo/packages/connectors
COPY packages/agent /opt/demo/packages/agent

##
## Install prod dependencies
##
FROM install-prep as install
ARG BUILD_DIR=packages/agent

WORKDIR /opt/demo

##
## This is needed as the install state will be invalid otherwise
##
RUN yarn install

RUN yarn gen

RUN yarn build packages/agent

RUN yarn workspaces focus -A --production

##
## Final Image
##
FROM node:14-alpine
ARG BUILD_DIR=packages/agent
WORKDIR /opt/demo

##
## The installing of gosu, dumb-init and the use of --chown are optional
## This is just showing a best practice docker
## It will run as a non root account the user `node` is provided by the node base image
## gosu proformes the stepdown from root
## dumb-init handles pid 0 signal handling
##

##
## Any run-time system libaries should be installed now
##

RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
  --mount=type=cache,target=/var/lib/apt\
  apk update && apk add \
  su-exec \
  dumb-init \
  && su-exec node true

##
## This includes our yarn install (like grabbing node_modules of old)
## Then includes the built code
##
COPY --chown=node:node --from=install /opt/demo/ /opt/prod/

##
## How you start and build your app is up to you this is just an example
##
WORKDIR /opt/prod/packages/agent

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD su-exec ${PUID}:${PGID} yarn node dist/server.js
