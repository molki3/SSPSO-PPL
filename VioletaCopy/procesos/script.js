const urlParams = new URLSearchParams(window.location.search);
var procesos = urlParams.get('procesos');
var lotes = [];
var no_lote = 0;
var ids = 1;
var no_proceso = 1;

/*---------------------------------------------------------------------------------------------- */

console.log(procesos);

let segundosTranscurridos = 0;
const timerElement = document.getElementById('timer');
var intervalID;

//TR y TT
let tiempo_transcurrido = 0;
let tiempo_restante;
const tiempoTranscurrido = document.getElementById('tiempot');
const tiempoRestante = document.getElementById('tiempor');
var intervalT;

class Process {
    constructor(id, operacion, tme, tt) {
        this.id = id;
        this.operacion = operacion;
        this.tme = tme;
        this.tt = tt;
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
window.onload = load();

function load(){
    for(var c = 0; c < procesos; c++){
        generarProcesos(c+1);
    }

    console.log(lotes);

    clear();
};

/*------------------------------------- BATH STRUCTURE --------------------------------------------------------- */

async function clear() {
    if(no_proceso > procesos){
        //window.location.href = "../otra/index.html";

        //actualiza screen
        document.getElementById('main').style = "display: inline-block;";

        await delay(1000);

        //llama funcion principal
        batchProcessing(lotes);
    }
}

function batchStructure(lotes){

    let c = 0;
    let b = 0;

    while(c<procesos){
        //console.log("entra a batch proceso no." + lotes[c].id);
        if(b!=5){
            proces.push(lotes[c]); 
            //console.log("insercion");
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

    batchStructure (lotes); //estructura procesos por lotes

    //console.log(batch);

    let currentBatch = 0;   //lote actual
    let currentProcess = 0; //proceso actual

    //establece primer muestra de lotes restantes
    document.getElementById('remaining-batch').textContent = `Lote(s) restante(s): ${totalBatch - currentBatch - 1}`;

    //copia del arreglo de lotes
    let batchCopy = batch[currentBatch].slice();
    console.log(batchCopy);
    console.log(batch);

    //inicia contador global
    intervalID = setInterval(actualizarContador, 1000);

    while(currentProcess<procesos){
        
        for (let i = 0; i < 5; i++) {

            //console.log(batch[currentBatch][i]);
            //termina contador local
            clearInterval(intervalT);
            tiempo_transcurrido = batch[currentBatch][i].tt;

            //termina si no hay procesos
            if(currentProcess==procesos) break;

            //document.getElementById('current-process').innerHTML = "<tr><th>NAME</th><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr><td></td><td></td><td></td><td></td><td id='tiempot'></td><td id='tiempor'></td>";

            //saca primer proceso del lote
            batchCopy.shift();

            //actualiza proceso actual
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>  <tr><td>" + batch[currentBatch][i].id + " </td> <td> " + batch[currentBatch][i].operacion + " </td> <td> " + batch[currentBatch][i].tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> </tr>";

            //actualiza lote actual
            document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
            for (let j = 0; j < batchCopy.length; j++) {
                document.getElementById('current-batch').innerHTML += "<tr> <td> " + batchCopy[j].id + " </td> <td> " + batchCopy[j].tme + " </td> <td> " + batchCopy[j].tt + " </td> </tr>";
            }

            tiempo_restante = batch[currentBatch][i].tme - batch[currentBatch][i].tt;
            var tiempo_restante_aux = tiempo_restante;
            intervalT = setInterval(Tiempos, 1000);

            await delay(tiempo_restante_aux * 1000); //detiene por TME

            //imprime procesos terminados
            document.getElementById('ended-process').innerHTML += "<tr> <td> " + batch[currentBatch][i].id + " </td> <td> " + batch[currentBatch][i].operacion + " </td> <td> " + Number(eval(batch[currentBatch][i].operacion).toFixed(4)) + " </td> <td> " + (parseInt(currentBatch) + 1) + " </td> </tr>"

            endedProcesses.push(batch[currentBatch][i]);    //agrega proceso a terminados

            currentProcess++;   //siguiente proceso
        }
        
        if(currentProcess==procesos) break; //termina si no hay procesos
        
        currentBatch++; //actualiza al nuevo lote

        //console.log("entra lote " + currentBatch + ", proceso: " + currentProcess);

        document.getElementById('remaining-batch').textContent = `Lote(s) restante(s) ${totalBatch - currentBatch - 1}`; //actualiza lote restante

        batchCopy = batch[currentBatch].slice();    //actualiza copia de la estructura de procesos

    }

    //termina contador global
    clearInterval(intervalID);

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr>";
}

function actualizarContador() {
    segundosTranscurridos++;
    timerElement.textContent = `Tiempo transcurrido: ${segundosTranscurridos} segundos`;
}


function Tiempos() {
    tiempo_transcurrido++;
    tiempo_restante--;
    document.getElementById('tiempot').textContent = `${tiempo_transcurrido}`;
    document.getElementById('tiempor').textContent = `${tiempo_restante}`;
   // console.log("Tiempo transcurrido: " + tiempo_transcurrido);
    //console.log("Tiempo restante: " + tiempo_restante);
}

  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/*------------------------------------- GENERAR PROCESOS --------------------------------------------------------- */

function generarProcesos(id) {
    //Generar la operacion
    var numero1 = Math.floor(Math.random() * 100) + 1;
    var numero2 = Math.floor(Math.random() * 100) + 1;
    var indice = Math.floor(Math.random() * 6);
    var operadores = ["+", "-", "*", "/", "%", "%%"];

    if(operadores[indice] == "%%"){
        var aux = Math.floor(Math.random() * 5);
        var porcentaje = Math.floor(Math.random() * 100) + 1;

        var operacion = numero1 + operadores[aux] + (numero1 * porcentaje) / 100;
    }
    else{
        var operacion = numero1 + operadores[indice] + numero2;
    }
    
    //Verifica si es una operacion valida
    try {
        const result = eval(operacion);
        if(result == Infinity)
        {
            console.log("Operacion invalida.")
            return;
        }
        else if(isNaN(result))
        {
            console.log("Operacion invalida.")
            return;
        }
    } catch (error) {
        console.log("Operacion invalida.");
        return;
    }
    
    var tiempo = Math.floor(Math.random() * 13) + 6;

    var lote = new Process(id,operacion,tiempo, 0);

    lotes[no_lote] = [];
    lotes[no_lote] = lote;
    no_lote++;
    no_proceso++;
}
