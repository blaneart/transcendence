
if command -v qterminal &> /dev/null
then
	terminal_used=qterminal
fi

if command -v xterm &> /dev/null
then
	terminal_used=xterm
fi

if command -v konsole &> /dev/null
then
	terminal_used=konsole
fi

printf '\nLaunching DataBase...\n\n'

cd ./database
sudo docker-compose down
$terminal_used -e "sudo docker-compose up"&
printf '\n\nLaunching Backend...\n\n'

sleep 10
cd ../pong-backend
$terminal_used -e "npm run start:dev"&
printf '\n\nLaunching Frontend...\n\n'

sleep 10
cd ../front-typescript
$terminal_used -e "npm start"
