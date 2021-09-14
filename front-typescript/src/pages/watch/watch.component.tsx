import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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

    console.log(listOfRooms);
    return (
        <div> {listOfRooms.map((room) => {
            console.log(room);
            return(

            <div key={room}> {room} </div>
        )})}
        </div>
    )
}

export default Watch;