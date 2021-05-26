var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.on("connection", data => {
    alert("entraste wey :D");
});

document.querySelector("#message-form").onsubmit = () =>{
    let message = document.querySelector("#message-input").value;
    console.log(message)
    document.querySelector("#message-input").value = "";

    socket.emit("prueba",{"mensaje": message});
    return false;

};

socket.on("recibido", data => {
    console.log(data);
    let li = document.createElement("li");
    li.textContent = data.mensaje + " " + data.username;
    document.querySelector("#messagelist").append(li);
});

