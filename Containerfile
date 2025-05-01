FROM node:alpine
VOLUME data

WORKDIR /usr/src/biggerbot

COPY package.json .
RUN npm install

COPY index.js .

CMD ["node", "index.js"]