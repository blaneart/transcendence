# syntax=docker/dockerfile:1

FROM node:16.10
# Latest stable version at the time of the defence. Fixed to avoid bugs
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production
RUN npm install -g @nestjs/cli
RUN mkdir /images

COPY . .
COPY ./audio_files /audio_files

CMD [ "npm", "run", "start" ]
