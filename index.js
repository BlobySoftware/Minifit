'use strict'
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const uglify = require("uglify-es");
const fs = require("fs");
let win;
const createWindow = () =>{
    win = new BrowserWindow({
        width: 550,
        height: 500,
        titleBarStyle:"hiddenInset",
        resizable: false,
        maximizable:false
    });
    win.loadFile("./App/index.html");
    win.on("closed", () =>{
        win = null;
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', ()=>{
    if(process.platform !== "darwin"){
        app.quit();
    }
})
app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
})

ipcMain.on("compress", (err, paths) =>{
    let start = Date.now();
    let files;
    try{
        if(fs.lstatSync(paths[0]).isDirectory()){
            try{
                files = fs.readdirSync(paths[0], "utf8");
                files.map(e =>{
                    if(fs.lstatSync(`${paths[0]}/${e}`).isFile()){
                        let file = `${paths[1]}/${e}`;
                        if(file.substr(file.lastIndexOf("."))==".js" && file.includes(".min")==false){
                            let rest = uglify.minify(fs.readFileSync(`${paths[0]}/${e}`,"utf8"));
                            fs.writeFileSync(file.replace(".js", ".min.js"), rest.code);
                        }
                    }
                })
            } catch(err){
                dialog.showErrorBox("Minifit Error ⛔", `Error to get the directory: ${err}`);
                win.webContents.send("stopProgress");
            }
        }else{
            try{ 
                files = fs.readFileSync(paths[0], "utf8");     
                if(paths[0].substr(paths[0].lastIndexOf("."))==".js"){
                    let rest = uglify.minify(files);
                    fs.writeFileSync(paths[1], rest.code);
                }else{
                    dialog.showErrorBox("Minifit Error ⛔", `You must compress a file of type JavaScript(.js)`);
                    win.webContents.send("stopProgress");
                }
            } catch (err){
                dialog.showErrorBox("Minifit Error ⛔", `Error to get the file: ${err}`);
                win.webContents.send("stopProgress");
            }
        }
    } catch(err){
        dialog.showErrorBox("Minifit Error ⛔", `${err}`);
        win.webContents.send("stopProgress");
    }
    let end = Date.now();
    win.webContents.send("progress",(end-start));
})