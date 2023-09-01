var procesos = 0;

function enter() {
    procesos = document.getElementById('display').value;
    if(procesos <= 0){
        alert("El numero de procesos debe ser mayor a 0.");
        return;
    }
    window.location.href = './procesos/procesos.html?procesos=' + procesos;
};