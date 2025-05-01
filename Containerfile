FROM node:alpine

VOLUME /var/local

WORKDIR /usr/src

COPY package.json .
RUN npm install

COPY index.js .

RUN ln -s /var/local data

CMD ["node", "index.js"]