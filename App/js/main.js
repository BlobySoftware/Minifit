'use strict'
const {dialog} = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const drag = require('drag-drop');
const fs = require('fs');
let stopProgress = false;
let options = {
    properties:['openFile', 'openDirectory'],
    message:"Select file or directory path",
    title:"Minifit Compression",
    buttonLabel: "Select"
};
const openDir = (input) =>{
    dialog.showOpenDialog(null, options, (file) =>{
        stopProgress = false;
        input.val("");
        g("#btns").css("bottom:20px");
        g(".progress").css("opacity:0;display:none").val(0);
        g(".compress").css("bakcground:#fff").class("is-outlined").html("Compress");
        if(fs.lstatSync(file[0]).isFile()){
            options.properties=["openFile"];
            if(file[0].substr(file[0].lastIndexOf(".")) == "js"){
                if(input.length > 1){
                    input[0].val(file[0]);
                    input[1].val(file[0].replace(".js", ".min.js"));
                }
                setTimeout(() => {
                    fadeIn();
                }, 100);
            }else{
                dialog.showErrorBox("Minifit Error ⛔", `You must drag a file of type JavaScript(.js)`);
            }
        }else{
            options.properties=["openDirectory"];
            input.val(file);
            setTimeout(() => {
                fadeIn();
            }, 100);
        }
    })
}
function fadeIn(){
    g("#paths").css("display:block").animates("display:block;opacity:1", 300, 10);
}
function fadeOut(time=300,delay=300){
    g("#paths").animates("display:block;opacity:0", time, delay);
    setTimeout(() =>{
        g("#paths").css("display:none");
    },time+delay)
}

drag("#uploader", (files) =>{
    // fadeIn();
    g(".input").val("");
    stopProgress = false;
        g("#btns").css("bottom:20px");
        g(".progress").css("opacity:0;display:none").val(0);
        g(".compress").css("bakcground:#fff").class("is-outlined").html("Compress");
        if(files.length>1){
            options.properties=["openDirectory"];
            g(".input").val(files[0].path.substr(0,files[0].path.lastIndexOf("/")));
            fadeIn();
        }else{
            if(files[0].path.substr(files[0].path.lastIndexOf(".")) == ".js"){
                options.properties=["openFile"];
                g(".input", 0).val(files[0].path);
                g(".input", 1).val(files[0].path.replace(".js", ".min.js"));
                fadeIn();
            }else{
                dialog.showErrorBox("Minifit Error ⛔", `You must drag a file of type JavaScript(.js)`);
            }
        }
})
Object.prototype.progressAnim = function (value, time=3, thens){
    let add=0, addVal, funVal;
    funVal = () =>{
        if(stopProgress){
            this.val(0);
            clearInterval(addVal);
        }else{
            if(add >= value){
                clearInterval(addVal);
                thens();
            }else{
                add++;
            }
        }
        this.val(add);
    }
    addVal = setInterval(funVal, time/value);
}
g(".ics1").event("click", () =>{
    openDir(g(".input",0));
})
g(".ics2").event("click", () =>{
    openDir(g(".input",1));
})
g("#uploader").event("click", () =>{
    options.properties=["openFile", "openDirectory"];
    openDir(g(".input"));
})
g(".compress").event("click", (e) =>{
    let path1 = g(".input",0).value;
    let path2 = g(".input",1).value;
    ipcRenderer.send("compress", [path1, path2]);
    setTimeout(() => {
        g(".progress").css("display:block").animates("display:block;opacity:1", 300, 10);
        g("#btns").animates("bottom:45px");
    }, 100);
    e.target.css("background:#23d160;").class("replace","is-outlined","is-loading");
})
g(".cancel").event("click", ()=>{
    fadeOut(undefined, 0);
    stopProgress = true;
    g(".compress").css("bakcground:#fff").class("replace","is-loading", "is-outlined").html("Compress");
})

ipcRenderer.on("progress", (err, time) =>{
    g(".progress").progressAnim(100, time, () =>{
        g(".compress").class("remove","is-loading").html('<i class="fa fa-check"></i>');
        fadeOut();
    });
})
ipcRenderer.on("stopProgress",() =>{
    fadeOut(undefined, 0);
    stopProgress = true;
    g(".compress").css("bakcground:#fff").class("replace","is-loading", "is-outlined").html("Compress");
})