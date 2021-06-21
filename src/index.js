const express=require('express')
const socketio=require('socket.io')
const path=require('path')
const https=require('http')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUsersInRoom,getUser}=require('./utils/users')
const app=express()
const server=https.createServer(app)
const io=socketio(server)
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
//server(emit an event)--->client (recieve)-countUpdated
//client(emit an event)--->server (recieve)-increment

//in Rooms:
/*
io.to.emit :send a mesage to a specific room 
socket.boradcast.to.emit :send a message to every one except the current socket to an specific room

*/ 

io.on('connection',(socket)=>{//socket is an object contain inormation about the connection
    //and its used for connect with client and send data
    console.log('new web socket connection')
    socket.on('join',(options,callback)=>{//options  is :{username,room}
       const{error,user}= addUser({id:socket.id,...options})
       if(error){
           return callback(error)
       }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome..!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))//emit for everyVody except current user socket
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
         callback()
    })

    socket.on('sendMessage',(message,callback )=>{ 
        const user=getUser(socket.id)
       
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))//send to any one  
        callback()       
    })
    socket.on('sendLocation',(location,callback)=>{
        const user=getUser(socket.id)
        
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.lat},${location.lng}`))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left ..!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })   
        }
    })
})
const port=process.env.PORT||3000;
server.listen(port,()=>{
    console.log(`Server listining on port ${port}`)
})









 // socket.emit('countUpdated',count)//Event:(para1:->name of event,para2:is the first para in the client

    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count)  //here we emit for a particular user 
    //     io.emit('countUpdated',count)//broadCast
    // })
