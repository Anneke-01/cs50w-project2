var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.emit("join",{"room":localStorage.canal});
refresh();
let timestamp = new Date();

socket.on("connection", data => {
    console.log("esta entrando ");

});

document.querySelector("#message-form").onsubmit = () =>{
    let message = document.querySelector("#message-input").value;
    console.log(message);
    
    if(message == " "){
        alert("pls write something");
    }else{
        var info = {
            "mensaje": message,
            "username": localStorage.username,
            "room":localStorage.canal,
            "time": timestamp.getHours() + ":" + timestamp.getMinutes()
    
        };
        document.querySelector("#message-input").value = " ";
        socket.emit("prueba",info);
    }
    
    
    return false;

};

socket.on("recibido", data => {
    console.log(data);
    let prueba = document.createElement("li");
    let block = document.createElement("blockquote");
    let div = document.createElement("div");
    block.textContent = data.mensaje + " " + data.username + ":" + data.time

    div.appendChild(block);
    if(data.username == localStorage.username){
        div.setAttribute("class", "msg msg--them");
        
    }else if(data.username == "Admin"){
        div.setAttribute("class", "msg--room");
        
        
    }else{
        div.setAttribute("class","msg msg--me");
        
    }
    prueba.appendChild(div);
    document.querySelector("#messagelist").append(prueba);
    

});


document.querySelector("#joinroom").onsubmit = () =>{
    
    let room = document.querySelector("#room").value;

    console.log(room)
    document.querySelector("#room").value = "";
    var validador = true;
    document.querySelectorAll(".btn1").forEach(button => {
        if(button.value == room){
            alert("Ya hay un canal existente con dicho nombre.");
            validador=false;
        }
    });
    if(validador == true){
        socket.emit("Crear",{"room":room});
        socket.emit("leave",{"room":localStorage.canal});

        socket.emit("join",{"room": room});
        
        localStorage.canal = room;
        refresh();
    }
    
    return false;
};
socket.on("agregarcanal", data =>{
    
    var listacanales = document.querySelector("#canal");
    var button = document.createElement("button");
    let canal = data["room"];
    button.setAttribute("value",canal);
    button.textContent = "#" + canal;
    button.setAttribute("class", "btn1");
    
    let li = document.createElement("li");
    li.appendChild(button);
    listacanales.append(li);
    
});

document.querySelectorAll(".btn1").forEach(button => {
    button.onclick = () =>{    
        let guardarCanal = button.value;
        if(localStorage.canal == guardarCanal){
            alert("Estás en el canal actual");
        }else{
            socket.emit("leave",{"room":localStorage.canal});
            localStorage.canal = guardarCanal;
            socket.emit("join",{"room":localStorage.canal});
            refresh();
        }
    }; 
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
                console.log(li);
                let block = document.createElement("blockquote");
                let div = document.createElement("div");
                block.textContent = mensajes[i].mensaje + " " + mensajes[i].username + " " ; 
                div.appendChild(block);
                if(mensajes[i].username == localStorage.username){
                    div.setAttribute("class", "msg msg--them");
                    document.querySelector("#message-input").value = " ";
                }else{
                    div.setAttribute("class","msg msg--me");
                    document.querySelector("#message-input").value = " ";
                }
                li.appendChild(div);
                document.querySelector("#messagelist").append(li);               
            }
        }
    }

}