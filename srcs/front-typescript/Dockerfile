# syntax=docker/dockerfile:1

FROM node:16.10
# Latest stable version at the time of the defence. Fixed to avoid bugs
# ENV NODE_ENV=production
ARG REACT_APP_API_UID
ENV REACT_APP_API_UID $REACT_APP_API_UID

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

RUN npm install -g serve

COPY . .

RUN npm run build

CMD [ "serve", "-s", "build", "-l", "3000"]
