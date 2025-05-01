FROM node:alpine

# Set up the environment
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . ./
RUN mkdir -p ./data
CMD ["node", "index.js"]

