FROM node:14-alpine
RUN apk add g++ make py3-pip
RUN npm cache clean --force
RUN npm install -g sails
RUN npm install -g npm@9.7.2

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY config ./config
COPY api ./api
COPY test ./test
EXPOSE 1337
CMD ["sails", "lift"]