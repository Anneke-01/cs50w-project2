import os
import json

from flask import Flask, render_template, session, request, redirect, g,jsonify
from flask_socketio import SocketIO, emit,join_room, leave_room
from flask_session import Session
from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

js =  { "users":[]}
with open('data.json', 'w') as file:
        json.dump(js,file,indent=4)

socketio = SocketIO(app,manage_session=False)
data = []
user_profiles={}
mensajes = {"general":[]}


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("username") is None:
            return redirect("/")
        return f(*args, **kwargs)
    return decorated_function

@app.route("/info")
def info():
    return mensajes

@app.route('/',methods=["GET", "POST"])
def index():
    if request.method == "POST":
        
        username = request.form.get("username")
        if (username):
            with open('data.json', 'r') as file:
                data = json.load(file)
                for datas in data["users"]:
                    if(datas["username"] == username):
                        
                        return render_template("login.html", error="username alredy exits") 
            with open('data.json', 'r') as file:
                data = json.load(file)
                data["users"].append({"username":username})
                print(username)
            with open('data.json', 'w') as file:
                json.dump(data, file, indent=4)
            session["username"] = username
            session["canal"] = "general"
            return redirect("/chat")
        else:
            return render_template("login.html")
    else:
        return render_template("login.html")

@app.route('/chat',methods=["GET", "POST"])
@login_required
def chat():
    canales = []
    for i in mensajes:
        canales.append(i)
    return render_template("index.html", username = session["username"], canales = canales)

@app.route('/logout', methods=["GET", "POST"])
def logout():
    print(session["username"])
    try:
        with open('data.json', 'r') as file:
            data = json.load(file)
            data["users"].remove({"username":session["username"]})
        with open('data.json', 'w') as file:
            json.dump(data,file,indent=4) 
    except:
        x = 1
    session.clear()   
    return redirect("/")

@app.route("/messages", methods=["GET", "POST"])
def messages():
    room = request.form.get("room")
    dictcionario = {"Contador":1}
    if not room or not mensajes.get(room):
        dictcionario["Contador"]= 0
        return jsonify(dictcionario)

    dictcionario["items"] = mensajes[room]
    dictcionario["Contador"] = 1
    return jsonify(dictcionario) 

@socketio.on("prueba")
def msj(hala):
    print(hala)
    respuesta = {
        "room" : session.get("canal"),
       "username" : session.get("username"), # si se pone corchete, username no existe se da una excepción o key error. En cambio, si es entre paréntesis (get) devuelve none
       "mensaje" : hala["mensaje"], # debe de ser igual que en el emit
       "time": hala["time"]
    }
    if mensajes.get(session.get("canal")):
        mensajes[session.get("canal")].append(hala)
        if len(mensajes.get(session.get("canal"))) > 100:
            mensajes.get(session.get("canal")).pop(0) 
    else:
        mensajes[session.get("canal")] = []
        mensajes[session.get("canal")].append(hala)
    emit("recibido",respuesta,room = respuesta["room"])


@socketio.on('join')
def on_join(data):
    print(data)
    room = data["room"]
    session["canal"] = room
    join_room(room)
    print("---------------------------------------" + room)
    msj = {
        "username":"Admin",
        "mensaje":session["username"] + ' has entered the room.',
        "time": "00:00"
    }
    emit("recibido",msj,room = session["canal"])
   
@socketio.on('Crear')
def crear(room):
    r = room["room"]
    if not mensajes.get(r):
        mensajes[r] = []
        emit("agregarcanal", {"room":r},broadcast=True)

@socketio.on('leave')
def on_leave(data):
    room = session["canal"]
    leave_room(room)
    session["canal"] = ""
    msj = {
        "username":"Admin",
        "mensaje":session["username"] + ' has left the room.'
    }
    emit("recibido",msj,room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True)