printf '\nLaunching DataBase...\n\n'

cd ./database
sudo docker-compose down
qterminal -e "sudo docker-compose up"&
printf '\n\nLaunching Backend...\n\n'

sleep 10
cd ../pong-backend
qterminal -e "npm run start:dev"&
printf '\n\nLaunching Frontend...\n\n'

sleep 10
cd ../front-typescript
qterminal -e "npm start"
