var procesos = 0;

function enter() {
    procesos = document.getElementById('display').value;
    quantum = document.getElementById('quantum').value;
    if(procesos <= 0){
        alert("El numero de procesos debe ser mayor a 0.");
        return;
    }
    window.location.href = './procesos/procesos.html?procesos=' + procesos + '&quantum=' + quantum;
};

function soloNumeros(input) {
    var valor = input.value;
    var patron = /^[0-9]+$/;

    if (!patron.test(valor)) {
        input.value = valor.slice(0, -1); // Eliminar el último carácter no válido
    }
};
