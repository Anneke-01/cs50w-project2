const form = document.getElementById('form')
const username = document.getElementById('username')
const password = document.getElementById('password')
const close = document.getElementById("close");

// Añadiendo evento de submit
form.onsubmit= function(event){
    event.preventDefault();
    if(localStorage.getItem('user')){
        const loginDeets = JSON.parse(localStorage.getItem('user'))
        if (username.value === loginDeets.user && password.value === loginDeets.pass) {
            alert("Login successful");
            console.log('Login successful')
        } else {
            alert("Wrong credentials");
            console.log('Wrong credentials')
        }
    }else{
        // Subiendo los valores al localstorage
        let users = 
        {
            user: username.value,
            pass: password.value
        };
        localStorage.setItem('user',JSON.stringify(users));
        //localStorage.setItem("room", general);
        alert("Your account has been created");
        window.location.reload();
        //console.log("Hasta aqui :c");
        //window.location='/chat';
    }
};

/*close.addEventListener("click", function(event) {
    localStorage.clear("user");
    alert("Te vas :(");
});*/

