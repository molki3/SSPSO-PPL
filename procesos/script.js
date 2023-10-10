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
var intervalB;

let aux_tres;

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

//indice para meter de bloqueados a listos
let index_back = 5;

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

        //termina si no hay procesos
        if(currentProcess==procesos) break;

        //termina contador local
        clearInterval(intervalT);

        //inicia tiempo de procesos bloqueados, se relaciona con metodos en Tiempos()
        intervalB = setInterval(updateBlockedProcesses, 1000);
        
        //reinicia tt y tr, continua globalTimer
        intervalT = setInterval(Tiempos, 1000);

        // auxiliar del proceso actual
        let aux_process = processCopy[0];

        //actualiza proceso actual
        if(aux_process){
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>  <tr><td>" + aux_process.id + " </td> <td> " + aux_process.operacion + " </td> <td> " + aux_process.tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> </tr>";
        }
        
        //FUNCION CUANDO NO QUEDE NINGUN PROCESOS POR JECCutAR PERO SI EN BLOQUEADOS
        if(processCopy.length==0 && blockedBatch.length>0){
            console.log(processCopy.length + " - " + blockedBatch.length + " - " + blockedBatch[0].tb*1000);
            console.log(processCopy)
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>";    //limpia proceso
            await delay((blockedBatch[0].tb+1)*1000); //se espera un tiempo de 8+1 segundos cuando no haya procesos corriendo pero si hay procesos en bloqueados (se suma un minuto para que espere a regresar los 8 segundos e inserte proceso en processCopy en updateBlockedProcesses())
            aux_process = processCopy[0];
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>  <tr><td>" + aux_process.id + " </td> <td> " + aux_process.operacion + " </td> <td> " + aux_process.tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> </tr>";
        }

        //saca primer proceso del lote
        processCopy.shift();

        //TIEMPO DE RESUESTA
        if(aux_process.tres == 'new'){
            aux_process.tres = globalTime;
        }

        //actualiza procesos nuevos
        document.getElementById('new-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        for (let j = 5; j < processCopy.length; j++) {
            document.getElementById('new-process').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        //actualiza procesos listos
        document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        const limit = processCopy.length >= 5 ? 5 : processCopy.length;

        console.log(limit-blockedBatch.length-1)

        for (let j = 0; j < limit-blockedBatch.length-1; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        tiempo_transcurrido = aux_process.tt;
        tiempo_restante = aux_process.tme - aux_process.tt;

        await delayWithKeyPress(tiempo_restante * 1000, currentProcess, aux_process).then(newCurrentProcess => {
            currentProcess = newCurrentProcess; // Actualizar currentProcess
        });
    }

    //termina contador global
    clearInterval(intervalT);

    clearInterval(intervalB);

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th></tr>";
}


function Tiempos() {
    if (!isPaused) {
        tiempo_transcurrido++;
        tiempo_restante--;
        globalTime++;

        //intenta calcular tt y tr si es que hay o no procesos ejecutandose
        try {
            document.getElementById('tiempot').textContent = `${tiempo_transcurrido}`;
            document.getElementById('tiempor').textContent = `${tiempo_restante}`;    
        } catch (error) {
            console.log("Esperando...")
        }
        
        globalTimer.textContent = `Tiempo transcurrido: ${globalTime} segundos`;

        document.getElementById('blocked-process').innerHTML = "<tr><th>ID</th><th>TT</th></tr>";
        for (let j = 0; j < blockedBatch.length; j++) {
            blockedBatch[j].tb--;
            document.getElementById('blocked-process').innerHTML += "<tr> <td> " + blockedBatch[j].id + " </td> <td> " + blockedBatch[j].tb + " </td></tr>";
        }

        document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        const limit = processCopy.length >= 5 ? 5 : processCopy.length;

        for (let j = 0; j < limit-blockedBatch.length-1; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }
    }
}
  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayWithKeyPress(ms, currentProcess, auxprocess) {
    let keyPressed = false;

    return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            document.addEventListener('keydown', keyHandler);
            if (!keyPressed) {
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id)) {        
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                }
                currentProcess++;
            }

            document.removeEventListener('keydown', keyHandler);
            resolve(currentProcess);
            
        }, ms);


        function keyHandler(event) {
            console.log("TECLA");

            if ((event.key === 'e' || event.key === 'E') && !isPaused) {
                document.removeEventListener('keydown', keyHandler);
                clearTimeout(timeoutId);
                console.log('ERROR');
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id)) {
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> ERROR </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                }
                keyPressed = true;
                currentProcess++;
                resolve(currentProcess);
            }
            if ((event.key === 'i' || event.key === 'I') && !isPaused && blockedBatch.length<4) {
                document.removeEventListener('keydown', keyHandler);

                if(endedProcesses.includes(auxprocess.id)){
                    return;
                }

                if(processCopy.includes(auxprocess.id)){
                    return;
                }

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
                console.log('El programa está pausado. Presione "c" para continuar. Proceso : ' + auxprocess.id);            } 
            if (event.key === 'c' && isPaused) {
                // Reanudar el temporizador con el tiempo restante
                // document.removeEventListener('keydown', keyHandler);
                const tiempoRestanteMs = tiempo_restante * 1000;
                timeoutId = setTimeout(() => {
                    if (!endedProcesses.includes(auxprocess.id)) {
                        auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                        auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                        auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                        auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                        document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                        endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                    }
                    currentProcess++;
                    document.removeEventListener('keydown', keyHandler);
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
            // Actualiza el contenido del elemento <td> correspondiente
            const tdTiempoBloqueo = blockedTable.querySelector(`#tiempob-${aux.id}`); // Suponiendo que el ID es único
            if (tdTiempoBloqueo) {
                tdTiempoBloqueo.textContent = aux.tb;
            }
        }else {
            // Si el tiempo de bloqueo llega a 0, quita el proceso de la lista de bloqueados
            blockedBatch.splice(i, 1);
            if(blockedBatch.length>0){
                processCopy.splice(index_back, 0, aux);
                index_back++;    
            }
            else{
                processCopy.splice(index_back, 0, aux);
                index_back = 5;
            }
            console.log("METIDO DE NUEVo")
            console.log(processCopy);
        }
    }
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

    var lote = new Process(id, operacion, tiempo, 0, -1, 0, 0, 'new', 0, 0, 0);

    lotes[no_lote] = [];
    lotes[no_lote] = lote;
    no_lote++;
    no_proceso++;
}