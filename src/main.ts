import "bootstrap/dist/css/bootstrap.min.css";
import { Scene } from "./scene";
import { TXV, XY} from "./utilities";
import { Tooltip} from "bootstrap";

let buttonPause: HTMLButtonElement;
let buttonStart: HTMLButtonElement;
let buttonStep: HTMLButtonElement;
let buttonReset: HTMLButtonElement;
let canvasMain: HTMLCanvasElement;
let canvasGraphX: HTMLCanvasElement;
let canvasGraphV: HTMLCanvasElement;
let textInfo: HTMLElement;
let textTime: HTMLElement;
let textX: HTMLElement;
let textV: HTMLElement;
let textTheta: HTMLElement;
let rangeTheta: HTMLInputElement;

let mouseXY : [number,number]|undefined = undefined;

const updateText = ([t, x, v]: TXV) => {
  textTime.textContent = `時間 : ${t.toFixed(1)} s`;
  textX.textContent = `位置 : ${x.toFixed(1)} m`;
  textV.textContent = `速度 : ${v.toFixed(1)} m/s`;
}
const updateThetaText = (thetaDo: number) => {
  textTheta.textContent = `${thetaDo} 度`;
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((e) => {
    const tt = new Tooltip(e);
    e.addEventListener("shown.bs.tooltip", () => setTimeout(() => tt.hide(), 500));
  });
  
  buttonPause = document.getElementById("buttonPause") as HTMLButtonElement;
  buttonStart = document.getElementById("buttonStart") as HTMLButtonElement;
  buttonStep = document.getElementById("buttonStep") as HTMLButtonElement;
  buttonReset = document.getElementById("buttonReset") as HTMLButtonElement;
  canvasMain = document.getElementById("canvasMain") as HTMLCanvasElement;
  canvasGraphX = document.getElementById("canvasGraphX") as HTMLCanvasElement;
  canvasGraphV = document.getElementById("canvasGraphV") as HTMLCanvasElement;
  textInfo = document.getElementById("textInfo") as HTMLElement;
  textTime = document.getElementById("textTime") as HTMLElement;
  textX = document.getElementById("textX") as HTMLElement;
  textV = document.getElementById("textV") as HTMLElement;
  textTheta = document.getElementById("textTheta") as HTMLElement;
  rangeTheta = document.getElementById("rangeTheta") as HTMLInputElement;
  
  const scene = new Scene(canvasMain, canvasGraphX, canvasGraphV);
  const timeManager = scene.timeManager;

  //range event
  rangeTheta.addEventListener("input", () => {
    const thetaDo = parseInt(rangeTheta.value);
    updateThetaText(thetaDo);
    scene.setTheta(thetaDo / 180 * Math.PI);
  });

  //button event
  buttonPause.addEventListener("click", () => {
    if (timeManager.Status === "Moving") timeManager.changeToPausing()
  });

  buttonStart.addEventListener("click", () => {
    if (timeManager.Status === "Pausing") timeManager.changeToMoving(false)
  });

  buttonReset.addEventListener("click", () => timeManager.changeToBegining());
  
  buttonStep.addEventListener("click", () => {
    if (timeManager.Status === "Pausing") timeManager.changeToMoving(true);
  });

  window.addEventListener('blur', () => {
   if (timeManager.Status === "Moving") timeManager.changeToPausing();
  });
    

  // mouse and touch event
  const pressEventHandler = (xy: XY) => { 
    switch (timeManager.Status) {
      case "Begining":
        mouseXY = xy;
        scene.setInitialV(0);
        break;
      case "Moving":
        buttonPause.dispatchEvent(new Event("click"));
        break;
      case "Pausing":
        buttonStep.dispatchEvent(new Event("click"));
        break;
    }
  };

  const releaseEventHandler = ([,]: XY) => {
    if (mouseXY &&timeManager.Status === "Begining") {
      mouseXY = undefined;
      timeManager.changeToMoving(false);
    }
  };

  const dragEventHandler = ([x,]: XY) => {
    if (mouseXY && timeManager.Status == "Begining") {
      const mouseDx = x - mouseXY[0];
      scene.setInitialV(mouseDx < 0 ? -mouseDx / 100 : 0.1);
      updateText(scene.txv);
    }
  };

  const cancelEventHandler = () => { 
    mouseXY = undefined;
    if (timeManager.Status == "Begining") {
      scene.setInitialV(0);
      updateText(scene.txv);
    }
  };

  canvasMain.addEventListener("dblclick", (e) => {
    if (e.button === 0 && timeManager.Status === "Ending")
      buttonReset.dispatchEvent(new Event("click"));
  });

  canvasMain.addEventListener("mousedown", (e) => { 
    if (e.button === 0) pressEventHandler([e.clientX, e.clientY]);
  });
  canvasMain.addEventListener("touchstart", (e) => {
    if (e.changedTouches.length == 1) {
      const touch = e.changedTouches[0];
      pressEventHandler([touch.clientX, touch.clientY]);
    }
  });
  
  canvasMain.addEventListener("mouseup", (e) => {
    if (e.button === 0) releaseEventHandler([e.clientX, e.clientY]);
  });
  canvasMain.addEventListener("touchend", (e) => {
    if (e.changedTouches.length == 1) {
      const touch = e.changedTouches[0];
      releaseEventHandler([touch.clientX, touch.clientY]);
    }
  });
  
  canvasMain.addEventListener("mouseleave", cancelEventHandler);
  canvasMain.addEventListener("touchcancel", cancelEventHandler);
  
  canvasMain.addEventListener("mousemove", (e) => {
    dragEventHandler([e.clientX,e.clientY]);
  });
  canvasMain.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    dragEventHandler([touch.clientX, touch.clientY]);
  });

  // timeManager subscrive
  timeManager.subscriveTickAction((txv,) => updateText(txv));

  timeManager.subscriveStatus("Begining", () => {
    buttonReset.hidden = true;
    buttonStart.hidden = true;
    buttonPause.hidden = true;
    buttonStep.hidden = true;
    updateText(scene.txv);
    textInfo.textContent = "ドラッグで初速度を与える";
    rangeTheta.disabled = false;
  });

  timeManager.subscriveStatus("Moving", () => {
    buttonReset.hidden = false;
    buttonStart.hidden = true;
    buttonPause.hidden = false;
    buttonStep.hidden = true;
    textInfo.textContent = "";
    rangeTheta.disabled = true;
  });

  timeManager.subscriveStatus("Pausing", () => {
    buttonReset.hidden = false;
    buttonStart.hidden = false;
    buttonPause.hidden = true;
    buttonStep.hidden = false;
    textInfo.textContent = "";
    rangeTheta.disabled = false;
  });

  timeManager.subscriveStatus("Ending", () => {
    buttonReset.hidden = false;
    buttonStart.hidden = true;
    buttonPause.hidden = true;
    buttonStep.hidden = true;
    textInfo.textContent = "";
    rangeTheta.disabled = true;
  });

  rangeTheta.dispatchEvent(new Event("input"));
  buttonReset.dispatchEvent(new Event("click"));
  document.getElementById("page")!.hidden = false;
  document.getElementById("loading-wrapper")!.hidden = true;
});