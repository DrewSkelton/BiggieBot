FROM node:alpine

# Change the timezone to central
RUN apk add tzdata
RUN ln -s /usr/share/zoneinfo/US/Central /etc/localtime

# Set up the environment
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . ./
CMD ["node", "index.js"]