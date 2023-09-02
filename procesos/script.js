const urlParams = new URLSearchParams(window.location.search);
var procesos = urlParams.get('procesos');
var lotes = [];
var no_lote = 0;

/*---------------------------------------------------------------------------------------------- */

console.log(procesos);

let segundosTranscurridos = 0;
const timerElement = document.getElementById('timer');
var intervalID;

class Process {
    constructor(id, programador, operacion, tme) {
        this.id = id;
        this.programador = programador;
        this.operacion = operacion;
        this.tme = tme;
    }
}

let view = false;

let proces = [];
let batch = [];
let endedProcesses = [];

let totalBatch = 0;
let currentBatch = 0;
let remainingBatch = totalBatch - currentBatch;



/*---------------------------------------------------------------------------------------------- */

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

    let lote = new Process(id,nombre,operacion,tiempo);

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

async function clear() {
    if(no_proceso > procesos){
        //window.location.href = "../otra/index.html";

        document.getElementById('main').style = "display: inline-block;";
        document.getElementById('calculator').style = "display: none;";

        await delay(1000);

        batchProcessing(lotes);
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
        if(id == lotes[c].id)
        {
            return false;
        }
    }

    return true;
}

function actualizarContador() {
    segundosTranscurridos++;
    timerElement.textContent = `Tiempo transcurrido: ${segundosTranscurridos} segundos`;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function batchStructure(lotes){

    let c = 0;
    let b = 0;

    while(c<procesos){
        console.log("entra a batch proceso no." + lotes[c].id);
        if(b!=5){
            proces.push(lotes[c]); 
            console.log("insercion");
            c++;
            b++;
            if(c==procesos) {
                batch.push(proces);
                totalBatch++;
                break;
            }
        }
        else{
            totalBatch++;
            batch.push(proces);
            proces=[];
            b=0;
        }
    }
}

async function batchProcessing(lotes){

    batchStructure (lotes); //estructura procesos en por lotes

    console.log(batch);

    let currentBatch = 0;   //lote actual
    let currentProcess = 0; //proceso actual

    //establece primer muestra de lotes restantes
    document.getElementById('remaining-batch').textContent = `Lote(s) restante(s): ${totalBatch - currentBatch - 1}`;

    //copia del arreglo de lotes
    let batchCopy = batch[currentBatch].slice();

    //inicia contador global
    intervalID = setInterval(actualizarContador, 1000);

    while(currentProcess<procesos){
        
        for (let i = 0; i < 5; i++) {

            //termina si no hay procesos
            if(currentProcess==procesos) break; 

            document.getElementById('current-process').innerHTML = "<tr><th>NAME</th><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr>";

            //saca primer proceso del lote
            batchCopy.shift();

            //actualiza proceso actual
            document.getElementById('current-process').innerHTML = "<tr><th>NAME</th><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr><tr> <td> " + batch[currentBatch][i].programador + " </td> <td> " + batch[currentBatch][i].id + " </td> <td> " + batch[currentBatch][i].operacion + " </td> <td> " + batch[currentBatch][i].tme + " </td> </tr>";

            //actualiza lote actual
            document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th></tr>";
            for (let j = 0; j < batchCopy.length; j++) {
                document.getElementById('current-batch').innerHTML += "<tr> <td> " + batchCopy[j].id + " </td> <td> " + batchCopy[j].tme + " </td> </tr>";
            }

            //OPERAR PROCESO ACTUAL

            await delay(batch[currentBatch][i].tme * 1000); //detiene por TME

            //imprime procesos terminados
            document.getElementById('ended-process').innerHTML += "<tr> <td> " + batch[currentBatch][i].id + " </td> <td> " + batch[currentBatch][i].operacion + " </td> <td> " + eval(batch[currentBatch][i].operacion) + " </td> <td> " + (parseInt(currentBatch) + 1) + " </td> </tr>"

            endedProcesses.push(batch[currentBatch][i]);    //agrega proceso a terminados

            currentProcess++;   //siguiente proceso
        }
        
        if(currentProcess==procesos) break; //termina si no hay procesos
        
        currentBatch++; //actualiza al nuevo lote

        console.log("entra lote " + currentBatch + ", proceso: " + currentProcess);

        document.getElementById('remaining-batch').textContent = `Lote(s) restante(s) ${totalBatch - currentBatch - 1}`; //actualiza lote restante

        batchCopy = batch[currentBatch].slice();    //actualiza copia de la estructura de procesos

    }

    //termina contador global
    clearInterval(intervalID);

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>NAME</th><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr>";
}