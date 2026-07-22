const display = document.getElementById("display");
const startPause = document.getElementById("startPause");
const reset = document.getElementById("reset");
const resumeInput = document.getElementById("resumeInput");
const setTime = document.getElementById("setTime");

let elapsed = 0;
let running = false;
let startTime = 0;
let interval;

function save() {

    localStorage.setItem("elapsed", elapsed);

    localStorage.setItem("running", running);

    if(running)
        localStorage.setItem("startTime", startTime);

}

function load(){

    elapsed = Number(localStorage.getItem("elapsed")) || 0;

    running = localStorage.getItem("running")==="true";

    startTime = Number(localStorage.getItem("startTime")) || Date.now();

    if(running){

        elapsed += Date.now()-startTime;

        startTime = Date.now();

        interval = setInterval(update,10);

        startPause.textContent="Pause";
    }

    updateDisplay(elapsed);
}

function format(ms){

    const hours = Math.floor(ms/3600000);

    ms%=3600000;

    const mins=Math.floor(ms/60000);

    ms%=60000;

    const secs=Math.floor(ms/1000);

    const milli=ms%1000;

    return (
        String(hours).padStart(2,"0")+":"+
        String(mins).padStart(2,"0")+":"+
        String(secs).padStart(2,"0")+"."+
        String(milli).padStart(3,"0")
    );
}

function updateDisplay(ms){

    const text=format(ms);

    display.textContent=text;

    document.title=text;
}

function update(){

    elapsed = Date.now()-startTime+elapsedOffset;

    updateDisplay(elapsed);

    save();
}

let elapsedOffset=0;

startPause.onclick=()=>{

    if(!running){

        running=true;

        startTime=Date.now();

        elapsedOffset=elapsed;

        interval=setInterval(update,10);

        startPause.textContent="Pause";

    }else{

        running=false;

        clearInterval(interval);

        elapsed=Date.now()-startTime+elapsedOffset;

        startPause.textContent="Start";
    }

    save();
};

reset.onclick=()=>{

    running=false;

    clearInterval(interval);

    elapsed=0;

    elapsedOffset=0;

    updateDisplay(0);

    startPause.textContent="Start";

    save();
};

setTime.onclick=()=>{

    const text=resumeInput.value.trim();

    const match=text.match(
        /^(\d+):([0-5]?\d):([0-5]?\d)(?:\.(\d{1,3}))?$/
    );

    if(!match){

        alert("Invalid format.\nUse HH:MM:SS or HH:MM:SS.000");

        return;
    }

    const h=Number(match[1]);
    const m=Number(match[2]);
    const s=Number(match[3]);
    const ms=Number((match[4]||"0").padEnd(3,"0"));

    elapsed=
        h*3600000+
        m*60000+
        s*1000+
        ms;

    elapsedOffset=elapsed;

    if(running)
        startTime=Date.now();

    updateDisplay(elapsed);

    save();
};

document.addEventListener("keydown",(e)=>{

    if(e.code==="Space"){

        e.preventDefault();

        startPause.click();

    }

});

load();