import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Room from './components/room.component';
const ENDPOINT = "http://127.0.0.1:3002";

const Watch = () => {
    const [socket, setSocket] = useState<Socket>(() => {
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
    }, [])

    return (
        <div> {listOfRooms.map((room) => {
            return(

            <Link  to={{
                    pathname: `/watch/${room}`,
            }}> {room} </Link>
        )})}
        </div>
    )
}

export default Watch;