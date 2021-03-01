FROM mhart/alpine-node:12

# USER node

RUN mkdir -p /home/node/app/node_modules && chown -R node /home/node/app

# Create app directory
# WORKDIR /src
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./


RUN npm install

# Bundle app source
COPY . .
# COPY --chown=node:node . .

RUN npm run build

# Make port 3500 available to the world outside this container
EXPOSE 3500

CMD [ "node", "./dist/server.js" ]
