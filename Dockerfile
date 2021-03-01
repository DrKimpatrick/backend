FROM node:14-alpine as base

WORKDIR /src
COPY package*.json ./
COPY yarn.lock ./
EXPOSE 3500

FROM base as production
ENV NODE_ENV=production
# RUN npm ci
RUN yarn install --frozen-lockfile
RUN npm tsc
COPY . ./
CMD ["node", "./dist/server.js"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && yarn install

RUN npm run build-ts

COPY . ./
CMD ["nodemon", "./dist/server.js"]