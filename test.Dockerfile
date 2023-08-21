FROM node:14.18.1-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN ls
COPY package*.json ./
COPY patches ./patches

RUN yarn install
COPY . .
EXPOSE 3000
CMD [ "npm", "test" ]
