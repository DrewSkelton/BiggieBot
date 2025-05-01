FROM node:alpine

VOLUME /usr/src/app/data

# Set up the environment
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . ./
CMD ["node", "index.js"]

