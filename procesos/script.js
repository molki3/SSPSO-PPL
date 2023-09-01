const urlParams = new URLSearchParams(window.location.search);
var procesos = urlParams.get('procesos');
var lotes = [];
var no_lote = 0;



var no_proceso = 1;
var h3 = document.getElementById('h3').textContent = "Datos del proceso " + no_proceso + ".";


function cargarProceso() {
    let id = document.getElementById('id').value;
    let nombre = document.getElementById('nombre').value;
    let operacion = document.getElementById('operacion').value;
    let tiempo = document.getElementById('tiempo').value;
    if((id == "") || (nombre == "") || (operacion == "") || (tiempo == ""))
    {
        alert("Algunos campos estan vacios.");
        clear();
        return;
    }

    if(validarID(id) == false){
        alert("ID ya existente.");
        clear();
        return;
    }

    try {
        const result = eval(operacion);
        if(result == Infinity)
        {
            alert("Operacion invalida.");
            clear();
            return;
        }
    } catch (error) {
        alert("Operacion invalida.");
        clear();
        return;
    }

    if(tiempo <= 0){
        alert("El tiempo debe ser mayor a 0.");
        clear();
        return;
    }

    let lote = [id, nombre, operacion, tiempo];
    lotes[no_lote] = [];
    lotes[no_lote] = lote;
    no_lote++;
    no_proceso++;
    clear();
    document.getElementById('h3').textContent = "Datos del proceso " + no_proceso + ".";
}

function validarInput(input) {
    var valor = input.value;
    var patron = /^[0-9+\-*/%.]+$/;

    if (!patron.test(valor)) {
        input.value = valor.slice(0, -1); // Eliminar el último carácter no válido
    }
}

function soloNumeros(input) {
    var valor = input.value;
    var patron = /^[0-9]+$/;

    if (!patron.test(valor)) {
        input.value = valor.slice(0, -1); // Eliminar el último carácter no válido
    }
}

function clear() {
    if(no_proceso > procesos){
        window.location.href = "../otra/index.html";
    }
    document.getElementById('id').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('operacion').value = '';
    document.getElementById('tiempo').value = '';
}

function validarID(id)
{
    let longitud = lotes.length;
    if(longitud == 0){
        return true;
    }

    for(let c = 0; c < longitud; c++)
    {
        if(id == lotes[c][0])
        {
            return false;
        }
    }

    return true;
}