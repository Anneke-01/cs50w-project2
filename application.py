import os

from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route('/',methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route('/chat',methods=["GET", "POST"])
def chat():
    return render_template("chat.html")

@socketio.on("prueba")
def msj(data):
    print(data)
    emit("recibido",data)

if __name__ == '__main__':
    socketio.run(app)