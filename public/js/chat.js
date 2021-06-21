//Cleint side
const socket=io()
//Elements
const $messageForm=document.querySelector('#message-form')  
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
const $locationMessage=document.querySelector('#location-message')
//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})//?username=sds&room=sadda   ignore:-> delete the ?   ,parse:->make an objet of room and username

const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild
    
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin  

    //Visible Height
    const visibleHeight=$messages.offsetHeight

    //height of message container

    const containerHeight=$messages.scrollHeight


    //how far have i scrolled?
    const scrollOffSet=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight <=scrollOffSet){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users   
    })
    document.querySelector('#sidebar').innerHTML=html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')
    
    const message=e.target.elements.message.value//e.target :matching the form who make a submit event 
    
    socket.emit('sendMessage',message,(error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()//make a good action  on the corser i dont know what ^-^..!
        if(error){
            return console.log(error)
        }
        console.log('Message Dilivered..!')
    })
})


$sendLocationButton.addEventListener('click',()=>{
   if (!navigator.geolocation){
        return alert('GeoLocation is not supported by your browser')
   }
   $sendLocationButton.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        const location={
            lat:position.coords.latitude,
            lng:position.coords.longitude
        }
        socket.emit('sendLocation',location,()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared..!')
        })
   })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})




//count programm


// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated!',count)
// })
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })
