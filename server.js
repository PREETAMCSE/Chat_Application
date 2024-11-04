import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { connect } from "./config.js";
import { chatModel } from "./chat.schema.js";

const app = express();

// 1. Create server using http
const server = http.createServer(app);
// 2. Create socket server
const io = new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
});

// 3. Use socket events

io.on('connection', (socket)=>{
    console.log("Connection is established");


    socket.on("join-chat", (data)=>{
        socket.userName=data;
        // Here we can send old messages to the client on authentication : 
        chatModel.find().sort({timestamp:1}).limit(50)
        .then(messages=>{
            socket.emit('load_messages', messages);
        }).catch(err=>{
            console.log(err);
        })
    })



    socket.on('new_message', (message)=>{
        let userMessage = {
            userName : socket.userName,
            message : message
        }

        const newChat = new chatModel({
            userName : socket.userName,
            message : message,
            timestamp : new Date()
        });
        newChat.save();
        // broadcast this message to all the clients without request from client
        socket.broadcast.emit('broadcast_message', userMessage);
    })
    socket.on('disconnect', ()=>{
    console.log("Connection is disconnected");
    })
})

server.listen(3000, ()=>{
    console.log("Server is on 3000");
    connect();
})
