var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.on("connection", data => {
    alert("entraste wey :D");
});

document.querySelector("#newmessage").onsubmit = () =>{
    let message = document.querySelector("#message").value;
    console.log(message)
    document.querySelector("#message").value = "";

    let mensaje = {"usuario:":username}
    socket.emit("prueba",{"mensaje": message});
    return false;

};

socket.on("recibido", data => {
    console.log(data);
    let li = document.createElement("li");
    li.textContent = data.mensaje;
    document.querySelector("#messagelist").append(li);
});

