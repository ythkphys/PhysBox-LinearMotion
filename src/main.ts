import "bootstrap/dist/css/bootstrap.min.css";
import { Scene } from "./scene";
import { TXV} from "./utilities";
import { Tooltip} from "bootstrap";

let buttonPause: HTMLButtonElement;
let buttonStart: HTMLButtonElement;
let buttonStep: HTMLButtonElement;
let buttonReset: HTMLButtonElement;
let canvasMain: HTMLCanvasElement;
let canvasGraphX: HTMLCanvasElement;
let canvasGraphV: HTMLCanvasElement;
let textTime: HTMLElement;
let textX: HTMLElement;
let textV: HTMLElement;
let selectorA: HTMLSelectElement;
let selectorV: HTMLSelectElement;

const updateText = ([t, x, v]: TXV) => {
  textTime.textContent = `時間 : ${t.toFixed(1)} s`;
  textX.textContent = `位置 : ${x.toFixed(1)} m`;
  textV.textContent = `速度 : ${v.toFixed(1)} m/s`;
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
  textTime = document.getElementById("textTime") as HTMLElement;
  textX = document.getElementById("textX") as HTMLElement;
  textV = document.getElementById("textV") as HTMLElement;
  selectorA = document.getElementById("selectorA") as HTMLSelectElement;
  selectorV = document.getElementById("selectorV") as HTMLSelectElement;

  const scene = new Scene(canvasMain, canvasGraphX, canvasGraphV);
  const timeManager = scene.timeManager;


  //selector
  selectorA.addEventListener("change", () => { 
    scene.setA(parseInt(selectorA.value));
  });
  selectorV.addEventListener("change", () => {
    scene.setV0(parseInt(selectorV.value));
    updateText(scene.txv);
  });

  //button event
  buttonPause.addEventListener("click", () => {
    if (timeManager.Status === "Moving") timeManager.changeToPausing()
  });

  buttonStart.addEventListener("click", () => {
    if (timeManager.Status === "Pausing" || timeManager.Status === "Begining") timeManager.changeToMoving(false)
  });

  buttonReset.addEventListener("click", () => timeManager.changeToBegining());
  
  buttonStep.addEventListener("click", () => {
    if (timeManager.Status === "Pausing") timeManager.changeToMoving(true);
  });

  window.addEventListener('blur', () => {
   if (timeManager.Status === "Moving") timeManager.changeToPausing();
  });
    
  // timeManager subscrive
  timeManager.subscriveTickAction((txv,) => updateText(txv));

  timeManager.subscriveStatus("Begining", () => {
    buttonReset.hidden = true;
    buttonStart.hidden = false;
    buttonPause.hidden = true;
    buttonStep.hidden = true;
    selectorA.disabled = false;
    selectorV.disabled = false;
    updateText(scene.txv);
  });

  timeManager.subscriveStatus("Moving", () => {
    buttonReset.hidden = false;
    buttonStart.hidden = true;
    buttonPause.hidden = false;
    buttonStep.hidden = true;
    selectorA.disabled = true;
    selectorV.disabled = true;
  });

  timeManager.subscriveStatus("Pausing", () => {
    buttonReset.hidden = false;
    buttonStart.hidden = false;
    buttonPause.hidden = true;
    buttonStep.hidden = false;
    selectorA.disabled = false;
    selectorV.disabled = true;
  });

  timeManager.subscriveStatus("Ending", () => {
    buttonReset.hidden = false;
    buttonStart.hidden = true;
    buttonPause.hidden = true;
    buttonStep.hidden = true;
    selectorA.disabled = true;
    selectorV.disabled = true;
  });

  buttonReset.dispatchEvent(new Event("click"));
  document.getElementById("page")!.hidden = false;
  document.getElementById("loading-wrapper")!.hidden = true;
});