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

let isPaused = false;
let timeoutId; // Variable global para mantener el ID del temporizador

let proces = [];
let batch = [];
let batchCopy = [];
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
    batchCopy = batch[currentBatch].slice();
    console.log(batchCopy);
    console.log(batch);

    //inicia contador global
    //intervalID = setInterval(actualizarContador, 1000);

    while(currentProcess<procesos){
        
        //for (let i = 0; i < 5; i++) {
        while (batchCopy.length>0) {

            console.log(currentProcess + " " + procesos)

            //termina si no hay procesos
            if(currentProcess==procesos) break;

            //console.log(batch[currentBatch][i]);
            //termina contador local
            clearInterval(intervalT);
            tiempo_transcurrido = batchCopy[0].tt;

            //document.getElementById('current-process').innerHTML = "<tr><th>NAME</th><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr><td></td><td></td><td></td><td></td><td id='tiempot'></td><td id='tiempor'></td>";

            let aux_process = batchCopy[0];

            //actualiza proceso actual
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>  <tr><td>" + batchCopy[0].id + " </td> <td> " + batchCopy[0].operacion + " </td> <td> " + batchCopy[0].tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> </tr>";

            //saca primer proceso del lote
            batchCopy.shift();

            //actualiza lote actual
            document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
            for (let j = 0; j < batchCopy.length; j++) {
                document.getElementById('current-batch').innerHTML += "<tr> <td> " + batchCopy[j].id + " </td> <td> " + batchCopy[j].tme + " </td> <td> " + batchCopy[j].tt + " </td> </tr>";
            }

            tiempo_restante = aux_process.tme - aux_process.tt;
            var tiempo_restante_aux = tiempo_restante;
            intervalT = setInterval(Tiempos, 1000);

            //await delay(tiempo_restante_aux * 1000); //detiene por TME
            //await delayWithKeyPress(tiempo_restante_aux * 1000, currentBatch, currentProcess, aux_process);

            await delayWithKeyPress(tiempo_restante_aux * 1000, currentBatch, currentProcess, aux_process).then(newCurrentProcess => {
                currentProcess = newCurrentProcess; // Actualizar currentProcess
            });

            //endedProcesses.push(batch[currentBatch][i]);    //agrega proceso a terminados

            //currentProcess++;   //siguiente proceso
        }
        
        if(currentProcess==procesos) break; //termina si no hay procesos
        
        currentBatch++; //actualiza al nuevo lote

        //console.log("entra lote " + currentBatch + ", proceso: " + currentProcess);

        document.getElementById('remaining-batch').textContent = `Lote(s) restante(s) ${totalBatch - currentBatch - 1}`; //actualiza lote restante

        batchCopy = batch[currentBatch].slice();    //actualiza copia de la estructura de procesos

    }

    //termina contador global
    clearInterval(intervalT);

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr>";
}

/*function actualizarContador() {
    segundosTranscurridos++;
    timerElement.textContent = `Tiempo transcurrido: ${segundosTranscurridos} segundos`;
}*/


function Tiempos() {
    if (!isPaused) {
        tiempo_transcurrido++;
        tiempo_restante--;
        segundosTranscurridos++;
        document.getElementById('tiempot').textContent = `${tiempo_transcurrido}`;
        document.getElementById('tiempor').textContent = `${tiempo_restante}`;
        timerElement.textContent = `Tiempo transcurrido: ${segundosTranscurridos} segundos`;
    }
}

function togglePause() {
    isPaused = !isPaused;
}
  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayWithKeyPress(ms, cB, currentProcess, auxprocess) {
    let keyPressed = false;

    return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            document.removeEventListener('keydown', keyHandler);
            if (!keyPressed) {
                document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + (parseInt(cB) + 1) + " </td> </tr>"    
                currentProcess++;
            }
            resolve(currentProcess);
        }, ms);

        function keyHandler(event) {
            if (event.key === 'e' || event.key === 'E') {
                clearTimeout(timeoutId);
                document.removeEventListener('keydown', keyHandler);
                console.log('ERROR');
                document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> ERROR </td> <td> " + (parseInt(cB) + 1) + " </td> </tr>"
                keyPressed = true;
                currentProcess++;
                resolve(currentProcess);
            }
            if (event.key === 'i' || event.key === 'I') {
                clearTimeout(timeoutId);
                document.removeEventListener('keydown', keyHandler);
                console.log('Interrupcion');
                auxprocess.tt = tiempo_transcurrido;
                batchCopy.push(auxprocess);
                keyPressed = true;
                resolve(currentProcess);
            }
            if (event.key === 'p') {
                clearTimeout(timeoutId); // Pausar el temporizador
                isPaused = true;
                console.log('El programa está pausado. Presione "c" para continuar.');
            } 
            if (event.key === 'c' && isPaused) {
                // Reanudar el temporizador con el tiempo restante
                const tiempoRestanteMs = tiempo_restante * 1000;
                timeoutId = setTimeout(() => {
                    if (!keyPressed) {
                        document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + (parseInt(cB) + 1) + " </td> </tr>"
                        currentProcess++;
                    }
                    resolve(currentProcess);
                }, tiempoRestanteMs);
                isPaused = false; // Reanudar el temporizador
                console.log('El programa continuará.');
            }
        }
        document.addEventListener('keydown', keyHandler);
    });
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
