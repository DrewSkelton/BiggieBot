FROM node:alpine

VOLUME /var/local

WORKDIR /usr/src

COPY . .
RUN npm install

RUN ln -s /var/local data

CMD ["npm", "start"]