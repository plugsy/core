FROM node:14-slim as base

WORKDIR /home/node/app

FROM base as production

COPY . .

ENV NODE_ENV=production
ENV NODE_PATH=./dist
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

CMD [ "yarn", "node", "./dist/index.js" ]
