FROM node:alpine
WORKDIR /usr/src/

VOLUME /var/local/
RUN ln -s /var/local data

COPY package.json .
RUN npm install

COPY config.js index.js .
COPY commands commands
COPY data data
COPY features features
COPY utils utils

CMD ["npm", "start"]