const urlParams = new URLSearchParams(window.location.search);
var procesos = urlParams.get('procesos');
var lotes = [];
var no_lote = 0;
var ids = 1;
var no_proceso = 1;

/*---------------------------------------------------------------------------------------------- */

console.log(procesos);

let globalTime = 0;
const globalTimer = document.getElementById('timer');
var intervalID;

//TR y TT
let tiempo_transcurrido = 0;
let tiempo_restante = 0;
let tiempo_bloqueado = 0;
const tiempoTranscurrido = document.getElementById('tiempot');
const tiempoRestante = document.getElementById('tiempor');
var intervalT;

class Process {
    constructor(id, operacion, tme, tt, tl, tf, tr, tres, te, ts, tb) {
        this.id = id;
        this.operacion = operacion;
        this.tme = tme;
        this.tt = tt;
        this.tl = tl;
        this.tf = tf;
        this.tr = tr;
        this.tres = tres;
        this.te = te;
        this.ts = ts;
        this.tb = tb;
    }
}

let view = false;

let isPaused = false;
let timeoutId; // Variable global para mantener el ID del temporizador

let proces = [];
let batch = [];
let batchCopy = [];
let endedProcesses = [];
let processCopy = [];

// Procesos bloqueados
let blockedBatch = [];

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

// ESTRUCTURAR PROCESOS EN LOTES
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

    let currentProcess = 0; //inicializacion de procesos

    processCopy = lotes.slice(); // copia de los procesos

    processCopy[0].tl = 0;

    while(currentProcess<procesos){

        console.log(currentProcess + " : " + procesos)

        //termina si no hay procesos
        if(currentProcess==procesos) break;

        //termina contador local
        clearInterval(intervalT);

        setInterval(updateBlockedProcesses, 1000);

        // auxiliar del proceso actual
        let aux_process = processCopy[0];

        //actualiza proceso actual
        document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>  <tr><td>" + processCopy[0].id + " </td> <td> " + processCopy[0].operacion + " </td> <td> " + processCopy[0].tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> </tr>";

        //saca primer proceso del lote
        processCopy.shift();

        //TIEMPO DE RESUESTA
        aux_process.tres = globalTime;

        console.log(processCopy)

        //actualiza procesos nuevos
        document.getElementById('new-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        for (let j = 5; j < processCopy.length; j++) {
            document.getElementById('new-process').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        //actualiza procesos listos
        document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        const limit = processCopy.length >= 5 ? 5 : processCopy.length;

        for (let j = 0; j < limit; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        tiempo_transcurrido = aux_process.tt;
        tiempo_restante = aux_process.tme - aux_process.tt;

        //reinicia tt y tr, continua globalTimer
        intervalT = setInterval(Tiempos, 1000);

        console.log("proceso actual: ", aux_process.id);

        await delayWithKeyPress(tiempo_restante * 1000, currentProcess, aux_process).then(newCurrentProcess => {
            currentProcess = newCurrentProcess; // Actualizar currentProcess
        });

        document.getElementById('blocked-process').innerHTML = "<tr><th>ID</th><th>TT</th></tr>";
        for (let j = 0; j < blockedBatch.length; j++) {
            document.getElementById('blocked-process').innerHTML += "<tr> <td> " + blockedBatch[j].id + " </td> <td> " + blockedBatch[j].tb + " </td></tr>";
        }

    }

    //termina contador global
    clearInterval(intervalT);

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr>";
}


function Tiempos() {
    if (!isPaused) {
        tiempo_transcurrido++;
        tiempo_restante--;
        globalTime++;
        document.getElementById('tiempot').textContent = `${tiempo_transcurrido}`;
        document.getElementById('tiempor').textContent = `${tiempo_restante}`;
        globalTimer.textContent = `Tiempo transcurrido: ${globalTime} segundos`;
    }
}
  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayWithKeyPress(ms, currentProcess, auxprocess) {
    let keyPressed = false;

    return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            document.removeEventListener('keydown', keyHandler);
            if (!keyPressed) {
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id)) {
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.ts; //TIEMPO DE ESPERA
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                }
                currentProcess++;
                console.log("entraaa " + auxprocess.id);
            }
            resolve(currentProcess);
        }, ms);

        function keyHandler(event) {
            if ((event.key === 'e' || event.key === 'E') && !isPaused) {
                clearTimeout(timeoutId);
                document.removeEventListener('keydown', keyHandler);
                console.log('ERROR');
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id)) {
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.ts; //TIEMPO DE ESPERA
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> ERROR </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                }
                keyPressed = true;
                currentProcess++;
                resolve(currentProcess);
            }
            if ((event.key === 'i' || event.key === 'I') && !isPaused) {
                //clearTimeout(timeoutId);
                document.removeEventListener('keydown', keyHandler);
                console.log('Interrupcion');
                auxprocess.tt = tiempo_transcurrido;
                auxprocess.tb = 8;
                blockedBatch.push(auxprocess);
                keyPressed = true;
                resolve(currentProcess);
            }
            if (event.key === 'p' && !isPaused) {
                clearTimeout(timeoutId); // Pausar el temporizador
                isPaused = true;
                keyPressed = true;
                console.log('El programa está pausado. Presione "c" para continuar.');
            } 
            if (event.key === 'c' && isPaused) {
                // Reanudar el temporizador con el tiempo restante
                const tiempoRestanteMs = tiempo_restante * 1000;
                console.log(tiempoRestanteMs)
                keyPressed = false;
                timeoutId = setTimeout(() => {
                    if (!keyPressed) {
                        if (!endedProcesses.includes(auxprocess.id)) {
                            auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                            auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                            auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                            auxprocess.te = auxprocess.tf - auxprocess.ts; //TIEMPO DE ESPERA
                            document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                            endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                        }
                        currentProcess++;
                        resolve(currentProcess);
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

function updateBlockedProcesses() {
    const blockedTable = document.getElementById('blocked-process'); // Obtén la tabla de procesos bloqueados

    for (let i = blockedBatch.length - 1; i >= 0; i--) {
        const aux = blockedBatch[i];
        if (aux.tb > 0) {
            // Actualiza el tiempo de bloqueo restante
            aux.tb -= 1;

            // Actualiza el contenido del elemento <td> correspondiente
            const tdTiempoBloqueo = blockedTable.querySelector(`#tiempob-${aux.id}`); // Suponiendo que el ID es único
            if (tdTiempoBloqueo) {
                tdTiempoBloqueo.textContent = aux.tb;
            }
        } else {
            // Si el tiempo de bloqueo llega a 0, quita el proceso de la lista de bloqueados
            blockedBatch.splice(i, 1);
            processCopy.splice(4, 0, aux);
            // También debes eliminar la fila correspondiente en la tabla HTML si es necesario
            // ...
        }
    }
    // Actualiza la pantalla para mostrar la lista de procesos bloqueados
    // ...
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

    var lote = new Process(id, operacion, tiempo, 0, -1, 0, 0, 0, 0, 0, 0);

    lotes[no_lote] = [];
    lotes[no_lote] = lote;
    no_lote++;
    no_proceso++;
}