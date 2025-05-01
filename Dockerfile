FROM node:alpine
WORKDIR /usr/src/

VOLUME /var/local/
RUN ln -s /var/local/ data/

COPY package.json .
RUN npm install

COPY commands .
COPY data .
COPY features .
COPY utils .
COPY config.js .
COPY index.js .

CMD ["npm", "start"]