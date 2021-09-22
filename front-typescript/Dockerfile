# syntax=docker/dockerfile:1

FROM node:16.9.1
# Latest stable version at the time of the defence. Fixed to avoid bugs
# ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]
