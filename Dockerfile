FROM node:alpine
WORKDIR /usr/src

VOLUME /var/local
RUN ln -s /var/local data

COPY package.json .
RUN npm install

COPY commands commands
COPY data data
COPY features features
COPY utils utils
COPY config.js .
COPY index.js .

CMD ["npm", "start"]