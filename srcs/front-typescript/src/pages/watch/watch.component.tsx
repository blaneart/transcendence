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
    if (listOfRooms.length)
        return (
            <div className="bg-black bg-opacity-75 px-10 py-10 rounded-xl shadow-lg">
                <div className="flex flex-1">
                <div className="flex flex-1 flex-col ">
                    <div className="text-center" >Rooms :</div>
                    {listOfRooms.map((room) => {
                        return (
                            <div className="flex bg-purple-900 bg-opacity-50 hover:bg-opacity-75 text-black px-4 shadow rounded-lg py-2 mb-2 items-center">
                                <Link to={{
                                    pathname: `/watch/${room}`,
                                }}> {room} </Link>
                            </div>
                        )
                    })}
                    </div>
                </div>
            </div>
        )
    else
        return (
            <div className="text-center text-xl">NO ACTIVE ROOMS</div>
        )
}

export default Watch;