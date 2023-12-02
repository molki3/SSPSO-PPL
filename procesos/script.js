const urlParams = new URLSearchParams(window.location.search);
var procesos = urlParams.get('procesos');
var quantum = urlParams.get('quantum');
var lotes = [];
var no_lote = 0;
var ids = 1;
var no_proceso = 1;

/*---------------------------------------------------------------------------------------------- */

console.log("Procesos:", procesos);
console.log("Quantum: " + quantum);

document.getElementById('quantum').textContent = "Quantum = " + quantum;

let globalTime = 0;
const globalTimer = document.getElementById('timer');
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

//let sinProceso = false;

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
var intervalId; //Verifica quantum

let proces = [];
let batch = [];
let batchCopy = [];
let endedProcesses = [];
let processCopy = [];
let errorProcesses = [];
let endedComplete = [];
let bcpKey = false;
let tpKey = false;

// Procesos bloqueados
let blockedBatch = [];

let bloqueoI = false;

let totalBatch = 0;
let currentBatch = 0;
let remainingBatch = totalBatch - currentBatch;

//Paginacion simple
let memoria = 0;
let procesosEnMemoria = [];
let procesosMemoria = 0;
let elementos;
let limitePag = 1;

hideProcess = false;

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

function actualizarMemoria(){

    // PAGINACION SIMPLE - ASIGNACION Y ACUMULACION DE MARCOS DE MEMORIA--------------------------
    memoria = 0; //cuantos marcos estan ocupados
    procesosMemoria = 0; //cuantos procesos estan en memoria
    limitePag = 1; //limite inferior de marco por proceso
    let porcentajeCuadro = 0;

    limpiarMemoria();

    //Acumulacion de marcos proceso actual
    if(!hideProcess){
        if((memoria + Math.ceil(aux_process.tamano/5)) <= 40){
            memoria += Math.ceil(aux_process.tamano/5);
            
            for (limitePag; limitePag <= memoria; limitePag++) {
                //console.log("cuadro pag-" + limitePag);
        
                // Obtén todos los elementos con la clase especificada
                elementos = document.getElementsByClassName("pag-" + limitePag);

                //elementos[0].classList.remove('decimal_blocked');
                //elementos[0].classList.remove('decimal');
                //elementos[0].classList.remove('decimal_processes');
                elementos[0].style.background = "";
    
                if(!Number.isInteger(aux_process.tamano/5) && limitePag === memoria){
                    porcentajeCuadro = Math.round((1-((Math.ceil(aux_process.tamano/5))-(aux_process.tamano/5))) * 100);
                    if(porcentajeCuadro>40){
                        elementos[0].style.background = "linear-gradient(to right, red " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                    }else{
                        elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, red " + porcentajeCuadro + "%)";
                    }
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + "\n" + limitePag + ":" + porcentajeCuadro/20 +'</div>';
                    //elementos[0].className += " decimal";
                }else{
                    elementos[0].style.backgroundColor = "red";
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + "\n" + limitePag + ":" + 5 +'</div>';
                }
                //elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + " " + limitePag + ":" + porcentajeCuadro/10 +'</div>';
            }
            procesosMemoria++;
            //console.log(aux_process.id + " " + Math.ceil(aux_process.tamano/5))
        }
    }

    //Acumulacion de marcos procesos bloqueados
    for(let i = 0; i < blockedBatch.length; i++){
        if((memoria + Math.ceil(blockedBatch[i].tamano/5)) <= 40){
            memoria += Math.ceil(blockedBatch[i].tamano/5);

            for (limitePag; limitePag <= memoria; limitePag++) {
                //console.log("cuadro pag-" + limitePag);
        
                // Obtén todos los elementos con la clase especificada 
                elementos = document.getElementsByClassName("pag-" + limitePag);

                //elementos[0].classList.remove('decimal_blocked');
                //elementos[0].classList.remove('decimal');
                //elementos[0].classList.remove('decimal_processes');
                elementos[0].style.background = "";

                if(!Number.isInteger(blockedBatch[i].tamano/5) && limitePag === memoria){
                    porcentajeCuadro = Math.round((1-((Math.ceil(blockedBatch[i].tamano/5))-(blockedBatch[i].tamano/5))) * 100);
                    //elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, #4B0082 " + porcentajeCuadro + "%)";
                    if(porcentajeCuadro>40){
                        elementos[0].style.background = "linear-gradient(to right, #4B0082 " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                    }else{
                        elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, #4B0082 " + porcentajeCuadro + "%)";
                    }
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+blockedBatch[i].id + "\n" + limitePag + ":" + porcentajeCuadro/20 +'</div>';
                    //elementos[0].className += " decimal_blocked";
                }else{
                    elementos[0].style.backgroundColor = "#4B0082";
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+blockedBatch[i].id + "\n" + limitePag + ":" + 5 +'</div>';
                }
                //elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+blockedBatch[i].id+'</div>';
            }
            procesosMemoria++;
            //console.log(blockedBatch[i].id + " " + Math.ceil(blockedBatch[i].tamano/5))
        }
        else{
            break;
        }
    }

    //Acumulacion de marcos procesos listos
    for(let i = 0; i < processCopy.length; i++){
        if((memoria + Math.ceil(processCopy[i].tamano/5)) <= 40){

            memoria += Math.ceil(processCopy[i].tamano/5);
            
            for (limitePag; limitePag <= memoria; limitePag++) {
                //console.log("cuadro pag-" + limitePag);
        
                // Obtén todos los elementos con la clase especificada 
                elementos = document.getElementsByClassName("pag-" + limitePag);

                //elementos[0].classList.remove('decimal_blocked');
                //elementos[0].classList.remove('decimal');
                //elementos[0].classList.remove('decimal_processes');
                elementos[0].style.background = "";

                if(!Number.isInteger(processCopy[i].tamano/5) && limitePag === memoria){
                    porcentajeCuadro = Math.round((1-((Math.ceil(processCopy[i].tamano/5))-(processCopy[i].tamano/5))) * 100);
                    //elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, blue " + porcentajeCuadro + "%)";
                    if(porcentajeCuadro>40){
                        elementos[0].style.background = "linear-gradient(to right, blue " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                    }else{
                        elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, blue " + porcentajeCuadro + "%)";
                    }
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+processCopy[i].id + "\n" + limitePag + ":" + porcentajeCuadro/20 +'</div>';
                    //elementos[0].className += " decimal_processes";
                }else{
                    elementos[0].style.backgroundColor = "blue";
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+processCopy[i].id + "\n" + limitePag + ":" + 5 +'</div>';
                }
                //elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+processCopy[i].id+'</div>';
            }
            procesosMemoria++;
            //console.log(processCopy[i].id + " " + Math.ceil(processCopy[i].tamano/5))
        }
        else{
            break;
        }
    }

    //console.log("PROCESOS EN MEMORIA: " + procesosMemoria + ", MARCOS USADOS: " + memoria)
    //----------------------------
}


function limpiarMemoria(){
    //LIEMPIEZA DE CUADRICULA-----------------------------------------
    for (let i = 1; i <= 40; i++) { //mandarlo al inicio de la funcio
        let elementos = document.getElementsByClassName("cuadro pag-" + i);

        elementos[0].style.backgroundColor = "#080303";
        elementos[0].style.background = "";
        elementos[0].innerHTML = i+":"+0;
        //elementos[0].classList.remove('decimal_blocked');
        //elementos[0].classList.remove('decimal');  
        //elementos[0].classList.remove('decimal_processes');
        
    }
    //-----------------------------------------------------------------
}


function iniciarProcesos(){

    // PAGINACION SIMPLE - ASIGNACION Y ACUMULACION DE MARCOS DE MEMORIA--------------------------
    memoria = 0; //cuantos marcos estan ocupados
    procesosMemoria = 0; //cuantos procesos estan en memoria
    limitePag = 1; //limite inferior de marco por proceso
    let porcentajeCuadro = 0;

    limpiarMemoria();

    //Acumulacion de marcos proceso actual
    if(!hideProcess){
        if((memoria + Math.ceil(aux_process.tamano/5)) <= 40){
            memoria += Math.ceil(aux_process.tamano/5);
            
            for (limitePag; limitePag <= memoria; limitePag++) {
                //console.log("cuadro pag-" + limitePag);
        
                // Obtén todos los elementos con la clase especificada
                elementos = document.getElementsByClassName("pag-" + limitePag);

                elementos[0].style.background = "";
    
                if(!Number.isInteger(aux_process.tamano/5) && limitePag === memoria){
                    porcentajeCuadro = Math.round((1-((Math.ceil(aux_process.tamano/5))-(aux_process.tamano/5))) * 100);
                    if(porcentajeCuadro>40){
                        elementos[0].style.background = "linear-gradient(to right, red " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                    }else{
                        elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, red " + porcentajeCuadro + "%)";
                    }
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + "\n" + limitePag + ":" + porcentajeCuadro/20 +'</div>';
                    //elementos[0].className += " decimal";
                }else{
                    elementos[0].style.backgroundColor = "red";
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + "\n" + limitePag + ":" + 5 +'</div>';
                }
                procesosEnMemoria[limitePag-1]=aux_process.id;
                //elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + " " + limitePag + ":" + porcentajeCuadro/10 +'</div>';
            }
            procesosMemoria++;
            //console.log(aux_process.id + " " + Math.ceil(aux_process.tamano/5))
        }
    }

    //Acumulacion de marcos procesos bloqueados
    for(let i = 0; i < blockedBatch.length; i++){
        if((memoria + Math.ceil(blockedBatch[i].tamano/5)) <= 40){
            memoria += Math.ceil(blockedBatch[i].tamano/5);

            for (limitePag; limitePag <= memoria; limitePag++) {
                //console.log("cuadro pag-" + limitePag);
        
                // Obtén todos los elementos con la clase especificada 
                elementos = document.getElementsByClassName("pag-" + limitePag);

                elementos[0].style.background = "";

                if(!Number.isInteger(blockedBatch[i].tamano/5) && limitePag === memoria){
                    porcentajeCuadro = Math.round((1-((Math.ceil(blockedBatch[i].tamano/5))-(blockedBatch[i].tamano/5))) * 100);
                    //elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, #4B0082 " + porcentajeCuadro + "%)";
                    if(porcentajeCuadro>40){
                        elementos[0].style.background = "linear-gradient(to right, #4B0082 " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                    }else{
                        elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, #4B0082 " + porcentajeCuadro + "%)";
                    }
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+blockedBatch[i].id + "\n" + limitePag + ":" + porcentajeCuadro/20 +'</div>';
                    //elementos[0].className += " decimal_blocked";
                }else{
                    elementos[0].style.backgroundColor = "#4B0082";
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+blockedBatch[i].id + "\n" + limitePag + ":" + 5 +'</div>';
                }
                procesosEnMemoria[limitePag-1]=blockedBatch[i].id;
                //elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+blockedBatch[i].id+'</div>';
            }
            procesosMemoria++;
            //console.log(blockedBatch[i].id + " " + Math.ceil(blockedBatch[i].tamano/5))
        }
        else{
            break;
        }
    }

    //Acumulacion de marcos procesos listos
    for(let i = 0; i < processCopy.length; i++){
        if((memoria + Math.ceil(processCopy[i].tamano/5)) <= 40){

            memoria += Math.ceil(processCopy[i].tamano/5);
            
            for (limitePag; limitePag <= memoria; limitePag++) {
                //console.log("cuadro pag-" + limitePag);
        
                // Obtén todos los elementos con la clase especificada 
                elementos = document.getElementsByClassName("pag-" + limitePag);

                elementos[0].style.background = "";

                if(!Number.isInteger(processCopy[i].tamano/5) && limitePag === memoria){
                    porcentajeCuadro = Math.round((1-((Math.ceil(processCopy[i].tamano/5))-(processCopy[i].tamano/5))) * 100);
                    //elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, blue " + porcentajeCuadro + "%)";
                    if(porcentajeCuadro>40){
                        elementos[0].style.background = "linear-gradient(to right, blue " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                    }else{
                        elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, blue " + porcentajeCuadro + "%)";
                    }
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+processCopy[i].id + "\n" + limitePag + ":" + porcentajeCuadro/20 +'</div>';
                    //elementos[0].className += " decimal_processes";
                }else{
                    elementos[0].style.backgroundColor = "blue";
                    elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+processCopy[i].id + "\n" + limitePag + ":" + 5 +'</div>';
                }
                procesosEnMemoria[limitePag-1]=processCopy[i].id;
                //elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+processCopy[i].id+'</div>';
            }
            procesosMemoria++;
            //console.log(processCopy[i].id + " " + Math.ceil(processCopy[i].tamano/5))
        }
        else{
            break;
        }
    }

    //rellena vacios con "v"
    if(limitePag-1 < 40){
        for(limitePag; limitePag<=40; limitePag++){
            procesosEnMemoria[limitePag-1] = "v";
        }
    }

    //console.log("PROCESOS EN MEMORIA: " + procesosMemoria + ", MARCOS USADOS: " + memoria)
    //----------------------------
}


function recorrerMemoria(){

    let actual = false, listo = false, bloqueado = false, terminado = false;
    let limiteMarco = 0;
    let contadorMarco = 1;
    let procesoAnalizado;

    //console.log(procesosEnMemoria)

    for (let i = 1; i <= 40; i++) { 
        
        let elementos = document.getElementsByClassName("cuadro pag-" + i);

        //console.log("VUELTA ",i,"PROCESO:",procesosEnMemoria[i-1])

        if(endedProcesses.includes(procesosEnMemoria[i-1]) && !actual && !listo && !bloqueado) terminado = true;
        // Si el proceso en la casilla actual es el que esta corriendo
        if(procesosEnMemoria[i-1]==aux_process.id && !actual && !terminado){
            limiteMarco = Math.ceil(aux_process.tamano/5);
            actual = true;
            contadorMarco = 1;
        }
        if(!actual && !bloqueado && !terminado){
            for(let j = 0; j < blockedBatch.length; j++){
                if(procesosEnMemoria[i-1]==blockedBatch[j].id){
                    contadorMarco = 1;
                    procesoAnalizado = blockedBatch[j];
                    limiteMarco = Math.ceil(blockedBatch[j].tamano/5);
                    bloqueado = true;
                    break;
                }
            }
        }
        if(!actual && !bloqueado && !listo && !terminado){
            for(let j = 0; j < processCopy.length; j++){
                if(procesosEnMemoria[i-1]==processCopy[j].id){
                    contadorMarco = 1;
                    procesoAnalizado = processCopy[j];
                    limiteMarco = Math.ceil(processCopy[j].tamano/5);
                    listo = true;
                    break;
                }
            }
        }
        
        if(terminado){
            elementos[0].style.background="";
            elementos[0].style.backgroundColor = "";
            elementos[0].innerHTML = i+":0";
            procesosEnMemoria[i-1]="v";
            terminado = false;
        }

        if(actual){
            elementos[0].style.background = "";
            elementos[0].style.backgroundColor = "";
    
            if(!Number.isInteger(aux_process.tamano/5) && contadorMarco==limiteMarco){
                porcentajeCuadro = Math.round((1-((Math.ceil(aux_process.tamano/5))-(aux_process.tamano/5))) * 100);
                if(porcentajeCuadro>40){
                    elementos[0].style.background = "linear-gradient(to right, red " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                }else{
                    elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, red " + porcentajeCuadro + "%)";
                }
                elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + "\n" + i + ":" + porcentajeCuadro/20 +'</div>';
                actual = false;
            }else{
                if(contadorMarco==limiteMarco){
                    actual = false;
                } 
                elementos[0].style.backgroundColor = "red";
                elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+aux_process.id + "\n" + i + ":" + 5 +'</div>';
            }
            contadorMarco++;
        }

        else if(bloqueado){
            elementos[0].style.background = "";
            elementos[0].style.backgroundColor = "";
    
            if(!Number.isInteger(procesoAnalizado.tamano/5) && contadorMarco==limiteMarco){
                
                porcentajeCuadro = Math.round((1-((Math.ceil(procesoAnalizado.tamano/5))-(procesoAnalizado.tamano/5))) * 100);
                if(porcentajeCuadro>40){
                    elementos[0].style.background = "linear-gradient(to right, #4B0082 " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                }else{
                    elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, #4B0082 " + porcentajeCuadro + "%)";
                }
                elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+procesoAnalizado.id + "\n" + i + ":" + porcentajeCuadro/20 +'</div>';
                contadorMarco = 1;
                bloqueado = false;
            }else{
                
                if(contadorMarco==limiteMarco){
                    contadorMarco=1;
                    bloqueado = false;
                }
                elementos[0].style.backgroundColor = "#4B0082";
                elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+procesoAnalizado.id + "\n" + i + ":" + 5 +'</div>';
            }
            contadorMarco++;
        }

        else if(listo){
            elementos[0].style.background = "";
            elementos[0].style.backgroundColor = "";
    
            if(!Number.isInteger(procesoAnalizado.tamano/5) && contadorMarco==limiteMarco){
                porcentajeCuadro = Math.round((1-((Math.ceil(procesoAnalizado.tamano/5))-(procesoAnalizado.tamano/5))) * 100);
                if(porcentajeCuadro>40){
                    elementos[0].style.background = "linear-gradient(to right, blue " + (porcentajeCuadro) + "%, black " + (100 - porcentajeCuadro) + "%)";
                }else{
                    elementos[0].style.background = "linear-gradient(to left, black " + (100 - porcentajeCuadro) + "%, blue " + porcentajeCuadro + "%)";
                }
                elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+procesoAnalizado.id + "\n" + i + ":" + porcentajeCuadro/20 +'</div>';
                contadorMarco = 1;
                listo = false;
                //elementos[0].className += " decimal";
            }else{
                if(contadorMarco==limiteMarco){
                    contadorMarco=1;
                    listo = false;
                } 
                elementos[0].style.backgroundColor = "blue";
                elementos[0].innerHTML = '<div class="divisiones"><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div><div class="division"></div></div> <div class="cuadro-contenido">'+procesoAnalizado.id + "\n" + i + ":" + 5 +'</div>';
            }
            contadorMarco++;
        }
    }
    
}


function meterProcesos(){
    let rangoVacios = 0;
    let inicio = 0, fin = 0;
    let memoriaEncontrada = false;
    
    if(processCopy.length>=limit){
        for(let i = limit; i < processCopy.length; i++){

            recorrerMemoria();
            console.log(procesosEnMemoria);
            console.log(processCopy[i]);
            
            let memoriaNecesitada = Math.ceil(processCopy[i].tamano/5); 
            rangoVacios = 0, inicio = 0, fin = 0;

            console.log(memoriaNecesitada);
            
            for (let j = 1; j <= 40; j++) {

                if(procesosEnMemoria[j-1]=="v"){
                    if(rangoVacios==0) inicio = j;
                    console.log("vacio en", j);
                    rangoVacios++;
                    if(rangoVacios==memoriaNecesitada){
                        fin = j;
                        console.log("memoria lista de",inicio,fin)
                        memoriaEncontrada = true;
                        break;
                    }
                }
                else{
                    rangoVacios=0;
                }

            }

            if(memoriaEncontrada){
                for(let j = inicio; j <= fin; j++){
                    procesosEnMemoria[j-1] = processCopy[i].id;
                }
                memoriaEncontrada = false;
                procesosMemoria++;
                limit = processCopy.length > procesosMemoria ? procesosMemoria-1-blockedBatch.length : processCopy.length+1+blockedBatch.length <=procesosMemoria ? processCopy.length : procesosMemoria-1-blockedBatch.length;
            }
            else break;
        }
    }
    recorrerMemoria();
}


async function batchProcessing(lotes){

    let currentProcess = 0; //inicializacion de procesos

    processCopy = lotes.slice(); // copia de los procesos

    processCopy[0].tl = 0;

    evento = true;

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
        if(processCopy.length==0 && blockedBatch.length>0){
            //CUANDO NO QUEDE NINGUN PROCESOS POR JECCutAR PERO SI EN BLOQUEADOS
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th></tr>";    //limpia proceso
            hideProcess = true;
            console.log("ESPERANDO PROCESO (S)");
            await delay((blockedBatch[0].tb+1)*1000); //se espera un tiempo de 8+1 segundos cuando no haya procesos corriendo pero si hay procesos en bloqueados (se suma un minuto para que espere a regresar los 8 segundos e inserte proceso en processCopy en updateBlockedProcesses())
            aux_process = processCopy[0];
            hideProcess = false;
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th><th>QT</th></tr>  <tr><td>" + aux_process.id + " </td> <td>" + aux_process.tamano + " </td> <td> " + aux_process.operacion + " </td> <td> " + aux_process.tme + " </td> <td id='tiempot'></td><td id='tiempor'></td><td id='tiempoq'></td> </tr>";
        }
        else{
            aux_process = processCopy[0];
        }

        
        //actualiza proceso actual
        if(aux_process){
            document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>OPE</th><th>TME</th><th>TT</th><th>TR</th><th>QT</th></tr>  <tr><td>" + aux_process.id + " </td> <td>" + aux_process.tamano + " </td> <td> " + aux_process.operacion + " </td> <td> " + aux_process.tme + " </td> <td id='tiempot'></td><td id='tiempor'></td> <td id='tiempoq'></td> </tr>";
            tiempo_quantum = 0;
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
        document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>TME</th><th>TT</th></tr>";

        //actualizarMemoria();

        //Meter por primera vez los procesos a la memoria
        if(currentProcess==0 && globalTime==0){
            iniciarProcesos();   
        }

        limit = processCopy.length > procesosMemoria ? procesosMemoria-1-blockedBatch.length : processCopy.length+1+blockedBatch.length <=procesosMemoria ? processCopy.length : procesosMemoria-1-blockedBatch.length;

        
        for (let j = 0; j < limit; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tamano + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        //actualiza procesos nuevos
        document.getElementById('new-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>TME</th><th>TT</th></tr>"
        for (let j = limit; j < processCopy.length; j++) {
            document.getElementById('new-process').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tamano + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        recorrerMemoria();
        
        // funcion de espera de tecla cada que entra un proceso a ejecutarse
        await delayWithKeyPress(tiempo_restante * 1000, currentProcess, aux_process).then(newCurrentProcess => {
            currentProcess = newCurrentProcess; // Actualizar currentProcess
        });

    }

    //termina contador global
    clearInterval(intervalT);

    clearInterval(intervalB);
                
    clearTimeout(timeoutId);

    clearInterval(intervalId);
    console.log("termina programa");

    evento = false;

    limpiarMemoria();

    //limpia proceso actual
    document.getElementById('current-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>TME</th><th>OPE</th><th>TT</th><th>TR</th><th>QT</th></tr>";
}


function Tiempos() {
    if (!isPaused) {
        tiempo_quantum++;
        tiempo_transcurrido++;
        tiempo_restante--;
        globalTime++;

        //actualizarMemoria();

        //sinProceso = false;

        //proceso para bloquear la interrupcion en caso de posible bug -------------------------
        bloqueoI = false;

        if(blockedBatch.length>=0 && aux_process.tme-tiempo_transcurrido<quantum && processCopy.length==1){
            bloqueoI = true;
        }
        //--------------------------------------------------------------------------------------

        //intenta calcular tt y tr si es que hay o no procesos ejecutandose---------------------
        try {
            document.getElementById('tiempot').textContent = `${tiempo_transcurrido}`;
            document.getElementById('tiempor').textContent = `${tiempo_restante}`;  
            document.getElementById('tiempoq').textContent = `${tiempo_quantum}`; //quantum en pantalla  
        } catch (error) {
            console.log("Esperando proceso...")
        }
        //--------------------------------------------------------------------------------------

        aux_process.ts = tiempo_transcurrido;
        
        globalTimer.textContent = `Tiempo transcurrido: ${globalTime} segundos`; //contador global en pantalla

        //actualiza los procesos bloqueados
        document.getElementById('blocked-process').innerHTML = "<tr><th>ID</th><th>TT</th></tr>";
        for (let j = 0; j < blockedBatch.length; j++) {
            blockedBatch[j].tb--;
            document.getElementById('blocked-process').innerHTML += "<tr> <td> " + blockedBatch[j].id + " </td> <td> " + blockedBatch[j].tb + " </td></tr>";
        }

        //actualiza los procesos listos
        document.getElementById('current-batch').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>TME</th><th>TT</th></tr>";
        limit = processCopy.length > procesosMemoria ? procesosMemoria-1-blockedBatch.length : processCopy.length+1+blockedBatch.length <=procesosMemoria ? processCopy.length : procesosMemoria-1-blockedBatch.length;

        for (let j = 0; j < limit; j++) {
            // TIEMPO DE LLEGADA
            if(processCopy[j].tl == -1){
                processCopy[j].tl = globalTime;
            }
            document.getElementById('current-batch').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tamano + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }

        //actualiza procesos nuevos
        document.getElementById('new-process').innerHTML = "<tr><th>ID</th><th>SIZE</th><th>TME</th><th>TT</th></tr>"
        for (let j = limit; j < processCopy.length; j++) {
            document.getElementById('new-process').innerHTML += "<tr> <td> " + processCopy[j].id + " </td> <td> " + processCopy[j].tamano + " </td> <td> " + processCopy[j].tme + " </td> <td> " + processCopy[j].tt + " </td> </tr>";
        }
    }
}
  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayWithKeyPress(ms, currentProcess, auxprocess) {
    let keyPressed = false;

    return new Promise((resolve, reject) => {

        //IMPLEMENTACION DEL QUANTUM
        intervalId = setInterval(() => {
            if (tiempo_quantum == quantum && tiempo_transcurrido<auxprocess.tme && !isPaused) {
                auxprocess.tt = tiempo_transcurrido;
                processCopy.splice(limit, 0, auxprocess);

                document.removeEventListener('keydown', keyHandler);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                resolve(currentProcess);
            }
            if(!evento){console.log("mata quantum");clearInterval(intervalId);resolve(currentProcess);}
        }, 1000); // Verifica cada segundo si tiempo_transcurrido es igual a 6

        timeoutId = setTimeout(() => {
            document.addEventListener('keydown', keyHandler);
            if (!keyPressed) {
                // Verifica si el proceso ya está en la lista de procesos finalizados
                if (!endedProcesses.includes(auxprocess.id) && tiempo_transcurrido==auxprocess.tme && !isPaused) {        
                    auxprocess.tf = globalTime; //TIEMPO DE FINALIZACION
                    auxprocess.tr = auxprocess.tf - auxprocess.tl; //TIEMPO DE RETORNO
                    auxprocess.ts = tiempo_transcurrido; //TIEMPO DE SERVICIO
                    auxprocess.te = auxprocess.tf - auxprocess.tl - auxprocess.ts; //TIEMPO DE ESPERA
                    tiempo_quantum = 0;
                    document.getElementById('ended-process').innerHTML += "<tr> <td> " + auxprocess.id + " </td> <td> " + auxprocess.tamano + " </td> <td> " + auxprocess.operacion + " </td> <td> " + Number(eval(auxprocess.operacion).toFixed(4)) + " </td> <td> " + auxprocess.tl + " </td> <td> " + auxprocess.tf + " </td> <td> " + auxprocess.tr + " </td> <td> " + auxprocess.tres + " </td>  <td> " + auxprocess.te + " </td>  <td> " + auxprocess.ts + " </td>  </tr>";  
                    endedProcesses.push(auxprocess.id); // Agrega el proceso a la lista de procesos finalizados
                    endedComplete.push(auxprocess);
                    procesosMemoria--;
                    meterProcesos();
                    currentProcess++;
                }
            }

            document.removeEventListener('keydown', keyHandler);
            resolve(currentProcess);
            
        }, ms);


        function keyHandler(event) {

            if ((event.key === 'e' || event.key === 'E') && !isPaused && !(processCopy.length==0 && blockedBatch.length>0)) {
                document.removeEventListener('keydown', keyHandler);
                clearTimeout(timeoutId);
                clearInterval(intervalId);
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
                procesosMemoria--;
                meterProcesos();
                currentProcess++;//avanza al siguiente proceso
                resolve(currentProcess);
            }

            //if ((event.key === 'i' || event.key === 'I') && !isPaused && blockedBatch.length<procesosMemoria-1 && !bloqueoI) { // y tiempo_restante es mayor o igual al tiempo del ultimo quantum
            if ((event.key === 'i' || event.key === 'I') && !isPaused) {
                document.removeEventListener('keydown', keyHandler);
                //limpiarMemoria();
                auxprocess.contadorInterrupciones++;
                auxprocess.tt = tiempo_transcurrido;
                auxprocess.tb = 8;
                blockedBatch.push(auxprocess);

                //console.log("interrumpidos")
                //console.log(blockedBatch);

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

                if(tpKey){
                    cerrarVentanaEmergente2();
                    tpKey = false;
                }

                // Reanudar el temporizador con el tiempo restante
                keyPressed = false;
                isPaused = false; // Reanudar el temporizador
                console.log('El programa continuará.');
            }

            if (event.key === 'n' || event.key === 'N') {
                procesos = parseInt(procesos)+1;
                generarProcesos(procesos);
                meterProcesos();
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
                processCopy.splice(limit, 0, aux);
                recorrerMemoria();
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

function mostrarVentanaEmergente2() {
    tpKey = true;
    document.getElementById('ventanaEmergente2').style.display = 'block';
}

function cerrarVentanaEmergente2() {
    document.getElementById('ventanaEmergente2').style.display = 'none';
}