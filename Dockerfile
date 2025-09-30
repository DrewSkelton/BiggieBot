FROM node:alpine AS build
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install

COPY src/ src/
COPY tsconfig.json .
RUN npm run build

# Production stage
FROM node:alpine
ENV NODE_ENV production

# Change the timezone to central
ENV TZ US/Central
RUN apk add --no-cache tzdata

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist dist/
COPY package*.json .

COPY drizzle/ drizzle/
COPY drizzle.config.js .

RUN npm clean-install --only=production
CMD ["npm", "run", "start"]