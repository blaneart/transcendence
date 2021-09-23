import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
const ENDPOINT = process.env.REACT_APP_SOCKET_BASE + ":" + process.env.REACT_APP_PORT_ONE;

const Watch = () => {
    const [socket] = useState<Socket>(() => {
        const initialState = io(ENDPOINT);
        return initialState;
      });

    const [listOfRooms, setListOfRooms] = useState<string[]>([]);
    useEffect(() => {

        socket.on('getListOfRooms', (rooms: string[]) => {
            setListOfRooms(rooms);
        })
        socket.emit('getListOfRooms');
        return () => {
            socket.disconnect();
        }
    }, [socket])
    console.log(listOfRooms.length)
    if (listOfRooms.length)
        return (
            <div> 
                {listOfRooms.map((room) => {
                return(

                <Link  to={{
                        pathname: `/watch/${room}`,
                }}> {room} </Link>
            )})}
            </div>
        )
    else
            return(
                <div>NO ACTIVE ROOMS</div>
            )
}

export default Watch;