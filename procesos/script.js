const urlParams = new URLSearchParams(window.location.search);
var procesos = urlParams.get('procesos');
var quantum = urlParams.get('quantum');
console.log("Quantum: " + quantum);
var lotes = [];
var no_lote = 0;
var ids = 1;
var no_proceso = 1;

/*---------------------------------------------------------------------------------------------- */

console.log(procesos);

document.getElementById('quantum').textContent = "Quantum = " + quantum;

let globalTime = 0;
const globalTimer = document.getElementById('timer');
var intervalID;

let evento = false;

//TR y TT
let tiempo_transcurrido = 0;
let tiempo_restante = 0;
let tiempo_bloqueado = 0;
let tiempo_quantum = 0;
const tiempoTranscurrido = document.getElementById('tiempot');
const tiempoRestante = document.getElementById('tiempor');
var intervalT;
var intervalB;

let aux_tres;
let limit;

class Process {
    constructor(id, operacion, tme, tamano, tt, tl, tf, tr, tres, te, ts, tb, contadorInterrupciones, qt) {
        this.id = id;
        this.operacion = operacion;
        this.tme = tme;
        this.tamano = tamano;
        this.tt = tt;
        this.tl = tl;
        this.tf = tf;
        this.tr = tr;
        this.tres = tres;
        this.te = te;
        this.ts = ts;
        this.tb = tb;
        this.contadorInterrupciones = contadorInterrupciones;
        this.qt = qt;
    }
}

let aux_process;

let view = false;

let isPaused = false;
let timeoutId; // Variable global para mantener el ID del temporizador
let timeoutId1;

let proces = [];
let batch = [];
let batchCopy = [];
let endedProcesses = [];
let processCopy = [];
let errorProcesses = [];
let endedComplete = [];
let bcpKey = false;

// Procesos bloqueados
let blockedBatch = [];

let totalBatch = 0;
let currentBatch = 0;
let remainingBatch = totalBatch - currentBatch;

let index_new_process = 0;

//Paginacion
let memoria = 0;

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

    evento = true;

    document.getElementsByClassName("cuadro pag-1")[0].innerHTML = "<p>S.O</p>";
    document.getElementsByClassName("cuadro pag-15")[0].innerHTML = "<p>S.O</p>";

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
        aux_process = processCopy[0];

        //actualiza proceso actual
        if(aux_process){
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th><th>QT</th></tr>  <tr><td>" + aux_process.id + " </td> <td>" + aux_process.tamano + " </td> <td> " + aux_process.operacion + " </td> <td> " + aux_process.tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> <td id='tiempoq'></td> </tr>";
        }
        
        //FUNCION CUANDO NO QUEDE NINGUN PROCESOS POR JECCutAR PERO SI EN BLOQUEADOS
        if(processCopy.length==0 && blockedBatch.length>0){
            //console.log(processCopy.length + " - " + blockedBatch.length + " - " + blockedBatch[0].tb*1000);
            //console.log(processCopy)
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>";    //limpia proceso
            await delay((blockedBatch[0].tb+0.1)*1000); //se espera un tiempo de 8+1 segundos cuando no haya procesos corriendo pero si hay procesos en bloqueados (se suma un minuto para que espere a regresar los 8 segundos e inserte proceso en processCopy en updateBlockedProcesses())
            aux_process = processCopy[0];
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th><th>QT</th></tr>  <tr><td>" + aux_process.id + " </td> <td>" + aux_process.tamano + " </td> <td> " + aux_process.operacion + " </td> <td> " + aux_process.tme + " </td> <td id='tiempot'></td><td id='tiempor'></td><td id='tiempoq'></td> </tr>";
        }

        //saca primer proceso del lote
        processCopy.shift();

        //TIEMPO DE RESUESTA
        if(aux_process.tres == 'new'){
            aux_process.tres = globalTime - aux_process.tl;
        }

        tiempo_transcurrido = aux_process.tt;
        tiempo_restante = aux_process.tme - aux_process.tt;

        //actualiza procesos listos
        document.getElementById('current-batch').innerHTML = "<tr><th>ID</?th><th>TME</th><th>TT</th></tr>";

        console.log("inicio");
        for(let i = 0; i < blockedBatch.length; i++){
            let paginas = 0;
            paginas = blockedBatch[i].tamano/5;
            console.log(paginas);
        }
        console.log("fin");

        limit = processCopy.length > 5 ? 5-1-blockedBatch.length : processCopy.length+1+blockedBatch.length <=5 ? processCopy.length : 5-1-blockedBatch.length;

        //console.log(limit)
        //console.log(processCopy)

        for (let j = 0; j < limit; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        //actualiza procesos nuevos
        document.getElementById('new-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        for (let j = limit; j < processCopy.length; j++) {
            document.getElementById('new-process').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }
        
        // funcion de espera de tecla cada que entra un proceso a ejecutarse
        await delayWithKeyPress(tiempo_restante * 1000, currentProcess, aux_process).then(newCurrentProcess => {
            currentProcess = newCurrentProcess; // Actualizar currentProcess
        });
    }

    //termina contador global
    clearInterval(intervalT);

    clearInterval(intervalB);

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th><th>QT</th></tr>";
}


function Tiempos() {
    if (!isPaused) {
        tiempo_quantum++;
        tiempo_transcurrido++;
        tiempo_restante--;
        globalTime++;

        //intenta calcular tt y tr si es que hay o no procesos ejecutandose
        try {
            document.getElementById('tiempot').textContent = `${tiempo_transcurrido}`;
            document.getElementById('tiempor').textContent = `${tiempo_restante}`;  
            document.getElementById('tiempoq').textContent = `${tiempo_quantum}`; //quantum en pantalla  
        } catch (error) {
            console.log("Esperando proceso...")
        }

        //console.log(tiempo_quantum + " a " + quantum)

        aux_process.ts = tiempo_transcurrido;
        
        globalTimer.textContent = `Tiempo transcurrido: ${globalTime} segundos`; //contador global en pantalla

        //actualiza los procesos bloqueados
        document.getElementById('blocked-process').innerHTML = "<tr><th>ID</th><th>TT</th></tr>";
        for (let j = 0; j < blockedBatch.length; j++) {
            blockedBatch[j].tb--;
            document.getElementById('blocked-process').innerHTML += "<tr> <td> " + blockedBatch[j].id + " </td> <td> " + blockedBatch[j].tb + " </td></tr>";
        }

        //actualiza los procesos listos
        document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>";
        limit = processCopy.length > 5 ? 5-1-blockedBatch.length : processCopy.length+1+blockedBatch.length <=5 ? processCopy.length : 5-1-blockedBatch.length;

        for (let j = 0; j < limit; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        //actualiza procesos nuevos
        document.getElementById('new-process').innerHTML = "<tr><th>ID</th><th>TME</th><th>TT</th></tr>"
        for (let j = limit; j < processCopy.length; j++) {
            document.getElementById('new-process').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }
    }
}
  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayWithKeyPress(ms, currentProcess, auxprocess) {
    let keyPressed = false;
    let intervalId;

    return new Promise((resolve, reject) => {
        //IMPLEMENTACION DEL QUANTUM
        intervalId = setInterval(() => {
            if (tiempo_quantum == quantum && tiempo_transcurrido<auxprocess.tme) {
                console.log("quantumm");
                tiempo_quantum = 0;
                auxprocess.tt = tiempo_transcurrido;
                //processCopy.push(auxprocess);
                processCopy.splice(limit, 0, auxprocess);
                document.removeEventListener('keydown', keyHandler);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                resolve(currentProcess);
            }
        }, 1000); // Verifica cada segundo si tiempo_transcurrido es igual a 6

        timeoutId = setTimeout(() => {
            
            document.addEventListener('keydown', keyHandler);
            if (!keyPressed) {
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id)) {        
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                    tiempo_quantum = 0;
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.tamano + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                    endedComplete.push(auxprocess);
                }
                currentProcess++;
            }

            document.removeEventListener('keydown', keyHandler);
            resolve(currentProcess);
            
        }, ms);


        function keyHandler(event) {
            if ((event.key === 'e' || event.key === 'E') && !isPaused) {
                document.removeEventListener('keydown', keyHandler);
                clearTimeout(timeoutId);
                //console.log('ERROR');
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id)) {
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                    errorProcesses.push(auxprocess);
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.tamano + " </td> <td> " + auxprocess.operacion + " </td> <td> ERROR </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                }
                tiempo_quantum = 0;
                keyPressed = true;
                currentProcess++;//avanza al siguiente proceso
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
                //console.log('Interrupcion');
                auxprocess.contadorInterrupciones++;
                auxprocess.tt = tiempo_transcurrido;
                auxprocess.tb = 8;
                blockedBatch.push(auxprocess);

                tiempo_quantum = 0;
                keyPressed = true;
                resolve(currentProcess);
            }
            if (event.key === 'p' && !isPaused) {
                clearTimeout(timeoutId); // Pausar el temporizador
                isPaused = true;
                keyPressed = true;
                console.log('El programa está pausado. Presione "c" para continuar. Proceso : ' + auxprocess.id);            
            }
            if (event.key === 'b' && !isPaused) {
                clearTimeout(timeoutId); // Pausar el temporizador
                isPaused = true;
                keyPressed = true;
                mostrarVentanaEmergente(auxprocess);
                console.log('El programa está pausado. Presione "c" para continuar. Proceso : ' + auxprocess.id);
                console.log("Proceso actual: ");
                console.log(auxprocess);
                console.log("Bloqueados: ");
                console.log(blockedBatch);
                console.log("Terminados: ");
                console.log(endedComplete);
                console.log("Nuevos y listos: ");
                console.log(processCopy);
                console.log("Procesos terminado en error:");
                console.log(errorProcesses);
                
            }
            if (event.key === 'c' && isPaused) {
                if(bcpKey){
                    cerrarVentanaEmergente();
                    bcpKey = false;
                }
                // Reanudar el temporizador con el tiempo restante
                keyPressed = false;
                const tiempoRestanteMs = tiempo_restante * 1000;

                timeoutId1 = setTimeout(() => {
                    if(!keyPressed){
                        if (!endedProcesses.includes(auxprocess.id)) {
                            auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                            auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                            auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                            auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                            document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.tamano + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                            endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                            endedComplete.push(auxprocess);
                            currentProcess++;   //avanza al sig proceso
                        }
                    }

                    tiempo_quantum = 0;
                    document.removeEventListener('keydown', keyHandler);
                    clearTimeout(timeoutId1); //termina contador de continuacion
                    resolve(currentProcess);

                }, tiempoRestanteMs);

                isPaused = false; // Reanudar el temporizador
                console.log('El programa continuará.');
            }
            if (event.key === 'n' || event.key === 'N') {
                procesos = parseInt(procesos)+1;
                generarProcesos(procesos);
                index_new_process++;
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
                processCopy.splice(limit, 0, aux);
                //index_back++;    
            }
            else{
                processCopy.splice(limit, 0, aux);
                //index_back = 0;
            }
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

    var tamano = Math.floor(Math.random() * 21) + 6;

    var lote = new Process(id, operacion, tiempo, tamano, 0, -1, 0, 0, 'new', 0, 0, 0, 0, 0);

    if(!evento){
        lotes[no_lote] = [];
        lotes[no_lote] = lote;
        no_lote++;
        no_proceso++;
    }else{
        processCopy.push(lote)
        lotes.push(lote)
    }
}


function mostrarVentanaEmergente(auxprocess) {
    bcpKey = true;
    document.getElementById('ventanaEmergente').style.display = 'block';
    document.getElementById('bcp-table').innerHTML = "<tr><th>Id</th><th>Tamano</th><th>Estado</th><th>Operacion y datos</th><th>Resultado</th><th>T. Llegada</th><th>T. Finalizacion</th><th>T. Retorno</th><th>T. Espera</th><th>T. Servicio</th><th>T. Respuesta</th><th>T. Restante en CPU</th></tr>";
    for(let c = 0; c < lotes.length;c++){
        let molki = lotes[c];

        //Si el proceso actual es el que se esta procesando
        if(auxprocess == molki){
            //console.log("El proceso " + lotes[c].id + " es el actual procesado");
            let axRCPU = document.getElementById('tiempor').textContent;
            let axTT = document.getElementById('tiempot').textContent;
            document.getElementById('bcp-table').innerHTML += "<tr> <td>" + molki.id + "</td> <td>" + molki.tamano + "</td> <td> Procesando... </td> <td>"+ molki.operacion + "</td><td>" + "" + "</td><td>" + molki.tl + "</td><td>" + "" + "</td><td>" + "" + "</td><td>" + (globalTime - molki.tl - axTT) +"</td><td>" + axTT + "</td><td>" + molki.tres + "</td><td>" + axRCPU + "</td></tr>";
        }

        //Si el proceso actual esta en Nuevos o listos
        else if(processCopy.includes(molki)){
            let proceso_actual = processCopy.find(objeto => objeto.id === lotes[c].id && objeto.tl === -1);
            if(proceso_actual){
                //console.log("El proceso " + lotes[c].id + " esta en nuevos");
                document.getElementById('bcp-table').innerHTML += "<tr> <td>" + proceso_actual.id + "</td> <td>" + proceso_actual.tamano + "</td> <td> Nuevo </td> <td>"+ proceso_actual.operacion + "</td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr>";
            }
            //LISTOS
            else{
                if(molki.tres == "new")
                {
                    molki.te = globalTime - molki.tl;
                    document.getElementById('bcp-table').innerHTML += "<tr> <td>" + molki.id + "</td> <td>" + molki.tamano + "</td> <td> Listo </td> <td>"+ molki.operacion + "</td><td>" + "" + "</td><td>" + molki.tl + "</td><td>" + "" + "</td><td>" + "" + "</td><td>" + molki.te +"</td><td>" + molki.tt + "</td><td>" + molki.tres + "</td><td>" + (molki.tme - molki.tt) + "</td></tr>";
                }
                else{
                    //console.log("El proceso " + lotes[c].id + " esta en listos");
                    document.getElementById('bcp-table').innerHTML += "<tr> <td>" + molki.id + "</td> <td>" + molki.tamano + "</td> <td> Listo </td> <td>"+ molki.operacion + "</td><td>" + "" + "</td><td>" + molki.tl + "</td><td>" + "" + "</td><td>" + "" + "</td><td>" + (globalTime - molki.tl - molki.tt) +"</td><td>" + molki.tt + "</td><td>" + molki.tres + "</td><td>" + (molki.tme - molki.tt) + "</td></tr>";
                }
                
            }
        }

        //Si el proceso actual esta en bloqueados
        else if(blockedBatch.includes(molki)){
            //console.log("El proceso " + lotes[c].id + " esta en bloqueados");
            document.getElementById('bcp-table').innerHTML += "<tr> <td>" + molki.id + "</td> <td>" + molki.tamano + "</td> <td> Bloqueado(Restan " + molki.tb + "seg.) </td> <td>"+ molki.operacion + "</td><td>" + "" + "</td><td>" + molki.tl + "</td><td>" + "" + "</td><td>" + "" + "</td><td>" + (globalTime - molki.tl - molki.tt) +"</td><td>" + molki.tt + "</td><td>" + molki.tres + "</td><td>" + (molki.tme - molki.tt) + "</td></tr>";
        }

        //Si el proceso actual esta en terminados
        else if(endedComplete.includes(molki)){
            //console.log("El proceso " + lotes[c].id + " esta en terminados");
            document.getElementById('bcp-table').innerHTML += "<tr> <td>" + molki.id + "</td> <td>" + molki.tamano + "</td> <td> Terminado(Normal) </td> <td>"+ molki.operacion + "</td><td>" + eval(molki.operacion) + "</td><td>" + molki.tl + "</td><td>" + molki.tf + "</td><td>" + molki.tr + "</td><td>" + molki.te +"</td><td>" + molki.ts + "</td><td>" + molki.tres + "</td><td>" + 0 + "</td></tr>";
        }

        //Si el proceso actual esta en terminados por error
        else if(errorProcesses.includes(molki)){
            //console.log("El proceso " + lotes[c].id + " esta en terminados por error");
            document.getElementById('bcp-table').innerHTML += "<tr> <td>" + molki.id + "</td> <td>" + molki.tamano + "</td> <td> Terminado(Error) </td> <td>"+ molki.operacion + "</td><td>" + "Error" + "</td><td>" + molki.tl + "</td><td>" + molki.tf + "</td><td>" + molki.tr + "</td><td>" + molki.te +"</td><td>" + molki.ts + "</td><td>" + molki.tres + "</td><td>" + (molki.tme - molki.ts) + "</td></tr>";
        }
    }
}

function cerrarVentanaEmergente() {
    document.getElementById('ventanaEmergente').style.display = 'none';
}
