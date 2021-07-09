FROM node:14-slim as base

WORKDIR /home/node/app

FROM base as production

COPY package.json yarn.lock .yarnrc.yml .pnp.js .
COPY .yarn .yarn
COPY packages/ packages/

ENV NODE_ENV=development
ENV NODE_PATH=./dist
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

CMD [ "yarn", "workspace", "@plugsy/core", "exec", "node", "./dist/index.js" ]
