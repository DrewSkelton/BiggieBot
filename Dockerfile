FROM node:alpine

ENV NODE_ENV production

# Change the timezone to central
ENV TZ US/Central
RUN apk add --no-cache tzdata

# Set up the environment
WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD ["node", "index.js"]