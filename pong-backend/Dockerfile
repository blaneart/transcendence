# syntax=docker/dockerfile:1

FROM node:16.6.2
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production
RUN npm install -g @nestjs/cli
RUN mkdir /images

COPY . .
COPY ./audio_files /audio_files

CMD [ "npm", "run", "start:dev" ]
