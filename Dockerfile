FROM node:alpine

ENV NODE_ENV production

# Change the timezone to central
RUN apk add tzdata
RUN ln -s /usr/share/zoneinfo/US/Central /etc/localtime

# Set up the environment
WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD ["node", "index.js"]