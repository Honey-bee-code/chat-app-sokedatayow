import React from "react";

import scrollToBottom from "react-scroll-to-bottom";

import "./Messages.css";

const Messages = ({ messages, name }) => (
    <scrollToBottom>
        {messages.map((message, i) => (
            <div key={i}>
                <Message message={message} name={name} />
            </div>
        ))}
    </scrollToBottom>
);

export default Messages;
