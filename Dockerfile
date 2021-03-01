FROM node:14-alpine as base

WORKDIR /src
COPY package*.json ./
EXPOSE 3500

FROM base as production
ENV NODE_ENV=production
RUN npm ci
# RUN yarn install --frozen-lockfile
RUN npm run build
COPY . ./
CMD ["node", "./dist/server.js"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install

RUN npm run build

COPY . ./
CMD ["nodemon", "./dist/server.js"]