printf "\n\nInstalling BackEnd...\n\n"

cd ./pong-backend
npm install


printf "\n\nInstalling FrontEnd...\n\n"

cd ../front-typescript
npm install


printf "Checking environment variables...\n\n"

cd ..
if ([ -z "$API_UID" ] )
then
	printf "Please setup API_UID\n"
fi

if ([ -z "$API_SECRET" ] )
then
	printf "Please setup API_SECRET\n"
fi

if ([ -z "$APP_SECRET" ] )
then
	printf "Please setup APP_SECRET\n"
fi

if ([ -z "$REACT_APP_API_UID" ] )
then
	printf "Please setup REACT_APP_API_UID\n"
fi

if !([ -z "$REACT_APP_API_UID" ] ) && !([ -z "$APP_SECRET" ] ) && !([ -z "$API_SECRET" ] ) && !([ -z "$API_UID" ] )
then
	bash ./launcher.sh
fi
