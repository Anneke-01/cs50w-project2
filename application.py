import os
import json

from flask import Flask, render_template, session, request, redirect, g
from flask_socketio import SocketIO, emit
from flask_session import Session
from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

socketio = SocketIO(app,manage_session=False)
data = []
mensajes = {"general":[]}

def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/0.12/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("username") is None:
            return redirect("/chat")
        return f(*args, **kwargs)
    return decorated_function
@app.route('/',methods=["GET", "POST"])
def index():
    if request.method == "POST":
        session.clear();
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

    return render_template("index.html")

@app.route('/logout', methods=["GET", "POST"])
def logout():
    print(session["username"])
    with open('data.json', 'r') as file:
        data = json.load(file)
        data["users"].remove({"username":session["username"]})
    with open('data.json', 'w') as file:
        json.dump(data,file,indent=4)    
    return redirect("/")

@socketio.on("prueba")
def msj(hala):
    print(hala)
    respuesta = {
       "username" : session.get("username"), # si se pone corchete, username no existe se da una excepción o key error. En cambio, si es entre paréntesis (get) devuelve none
       "mensaje" : hala["mensaje"]  # debe de ser igual que en el emit
    }

    emit("recibido",respuesta)





if __name__ == '__main__':
    socketio.run(app)