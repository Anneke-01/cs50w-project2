var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.emit("join",{"room":localStorage.canal});
refresh();

socket.on("connection", data => {
    console.log("esta entrando ");

});

document.querySelector("#message-form").onsubmit = () =>{
    let message = document.querySelector("#message-input").value;
    console.log(message);
    document.querySelector("#message-input").value = "";

    var info = {
        "mensaje": message,
        "username": localStorage.username,
        "room":localStorage.canal
    };

    socket.emit("prueba",info);
    return false;

};

socket.on("recibido", data => {
    console.log(data);
    let li = document.createElement("li");
    li.textContent = data.mensaje + " " + data.username;
    console.log(li);
    document.querySelector("#messagelist").append(li);
});


document.querySelector("#joinroom").onsubmit = () =>{
    let room = document.querySelector("#room").value;
    console.log(room)
    document.querySelector("#room").value = "";
    socket.emit("Crear",{"room":room});
    socket.emit("leave",{"room":localStorage.canal});

    socket.emit("join",{"room": room});
    localStorage.canal = room;
    refresh();
    return false;
};
socket.on("agregarcanal", data =>{
    var listacanales = document.querySelector("#canal");
    var button = document.createElement("button");
    let canal = data["room"];
    button.setAttribute("value",canal);
    button.textContent = "#" + canal;
    let li = document.createElement("li");
    li.appendChild(button);
    listacanales.append(li);
});

socket.on("recibidoroom", data => {
    console.log(data);

});


function refresh(){
    var element = document.getElementById("messagelist");
        while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    console.log("Tuve fe");
    let data = new FormData();
    let room = localStorage.canal;
    console.log(room);
    data.append("room",room);
    let request = new XMLHttpRequest();
    request.open("POST","/messages");
    request.responseType = 'json';
    request.send(data);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            console.log("entra");
            //console.log(request);
            // Muestra la información obtenida en la petición
            let resp = this.response;
            console.log(resp.items); 
            let mensajes = resp.items;
            for(var i = 0; i <mensajes.length; i++){
                let li = document.createElement("li");
                li.setAttribute("class","justify-content: flex-end")
                li.textContent = mensajes[i].mensaje + " " + mensajes[i].username; 
                console.log(li);
                
                document.querySelector("#messagelist").append(li);
            }
        }
    }

}