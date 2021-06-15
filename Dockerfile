FROM node:14-slim as base

WORKDIR /home/node

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

ENV PATH /home/node/node_modules/.bin:$PATH

WORKDIR /home/node/app

FROM base as production

COPY . .

ENV NODE_ENV=production
ENV NODE_PATH=./dist

RUN yarn build

CMD [ "node", "./dist/index.js" ]
