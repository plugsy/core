# syntax = docker/dockerfile:experimental

##
## Base
##
FROM node:14 as install-prep

ARG BUILD_DIR=packages/agent

WORKDIR /opt/demo

COPY ${BUILD_DIR}/package.json ${BUILD_DIR}/
COPY package.json .
COPY yarn.lock .

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
COPY .yarn/ /opt/demo/.yarn/
COPY .yarnrc.yml /opt/demo/.yarnrc.yml
COPY .pnp.js /opt/demo/.pnp.js

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
# CMD ["ls", "-lash" ,"/opt/demo/packages/"]

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

WORKDIR /opt/demo

##
## Copy the workspace we are building here
## include any files outside of the workspace that maybe needed to build also
## ie. a project root tsconfig.json
##
COPY tsconfig.base.json tsconfig.base.json
COPY packages/agent /opt/demo/packages/agent

RUN yarn build packages/agent

##
## This is our secret weapon
## Our nice plugin creates a yarn install just for us
## Your workspace should have a `prepack` script if you need to make sure that everything is built before
##
RUN yarn workspaces focus @plugsy/agent --production

##
## Final Image
##
FROM node:14
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
  apt-get update && apt-get install -y \
  gosu \
  dumb-init \
  && gosu node true

##
## This includes our yarn install (like grabbing node_modules of old)
## Then includes the built code
##
COPY --chown=node:node --from=install /opt/demo/ /opt/prod/

##
## How you start and build your app is up to you this is just an example
##
WORKDIR /opt/prod

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# CMD ["gosu", "node", "yarn", "workspace", "@plugsy/agent", "run", "start"]
CMD ls -lash /opt/prod /opt/prod/.yarn /opt/prod/.yarn/cache