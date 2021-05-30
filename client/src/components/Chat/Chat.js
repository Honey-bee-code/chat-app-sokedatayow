import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import "./Chat.css";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import TextContainer from "../TextContainer/TextContainer";

let socket;

const Chat = ({ location }) => {
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [users, setUsers] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    // const connectionOptions = {
    //     "force new connection": true,
    //     reconnectionAttempts: "Infinity",
    //     timeout: 10000,
    //     transports: ["websocket", "polling", "flashsocket"],
    // };
    const ENDPOINT = "https://joinroomchat.herokuapp.com/";
    // const ENDPOINT = "http://localhost:5000";

    socket = io(ENDPOINT);

    useEffect(() => {
        let { name, room } = queryString.parse(location.search);

        setName(name.trim().toLowerCase());
        setRoom(room.trim().toLowerCase());

        socket.emit("join", { name, room }, () => {});

        return () => {
            socket.emit("disconnect");

            socket.off();
        };
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.on("message", (message) => {
            setMessages((messages) => [...messages, message]);
        });

        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });
    }, []);

    // function for sendeng messages
    const sendMessage = (event) => {
        event.preventDefault();
        let { name, room } = queryString.parse(location.search);

        setName(name);
        setRoom(room);

        if (message) {
            socket.emit("sendMessage", { message, name }, () => setMessage(""));
        }
    };

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    );
};

export default Chat;
