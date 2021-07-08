FROM node:14-slim as base

WORKDIR /home/node/app

FROM base as production

COPY package.json .
COPY yarn.lock .
COPY .yarn .yarn
COPY .yarnrc.yml .
COPY packages/core packages/core
COPY .pnp.js .

ENV NODE_ENV=development
ENV NODE_PATH=./dist
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

CMD [ "yarn", "workspace", "@plugsy/core", "exec", "node", "./dist/index.js" ]
