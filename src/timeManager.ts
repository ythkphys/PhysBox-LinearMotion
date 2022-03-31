import { TXV,Status } from "./utilities";

export class TimeManager {
    private status: Status = "Begining";
    private time: number = 0;
    private isPauseOnStep = false;
    private readonly onChangeActions: { [key: string]: (() => void)[] } = {};
    private readonly afterTickActions: ((txv: TXV,step:boolean) => void)[] = [];
    private onTickSimulate: ((delta: number) => [TXV,boolean]) = (_) => { throw new Error("onTickSimulate is empty"); };

    get Currenttime(): number { return this.time;}
    get Status(): Status { return this.status; }
    
    constructor(private readonly stepTimeDelta:number) {
        ["Begining", "Moving", "Pausing","Ending"].forEach(status => { 
            this.onChangeActions[status] = [() => { console.log("status changed to " + status)}];    
        });
    }

    subscriveStatus(target: Status, func: () => void) {
        this.onChangeActions[target].push(func);
    }

    subscriveTickSimulate(func: (delta: number) => [TXV,boolean]) {
        this.onTickSimulate = func;
    }

    subscriveTickAction(func: (txv:TXV, step:boolean) => void) {
        this.afterTickActions.push(func);
    }
    changeToMoving(isPauseOnStep:boolean) {
        this.isPauseOnStep = isPauseOnStep;
        this.status = "Moving";
        this.onChangeActions[this.status].forEach(func => func());
        this.tickStart();
    }

    changeToBegining() { 
        this.time = 0;
        this.status = "Begining";
        this.onChangeActions[this.status].forEach(func => func());
    }
    
    changeToPausing() {
        this.status = "Pausing";
        this.onChangeActions[this.status].forEach(func => func());
    }

    changeToEnding() {
        this.status = "Ending";
        this.onChangeActions[this.status].forEach(func => func());
    }
    
    private tickStart()  { 
        let startTime: number | undefined = undefined; 
        let prevTime: number | undefined = undefined;
        const setStepTime = () => Math.floor((this.time / this.stepTimeDelta + 1)) * this.stepTimeDelta;
        let stepTime = setStepTime();
        const tick = (timestamp: number) => {
            if (startTime === undefined||prevTime===undefined) {
                startTime = timestamp;
                prevTime = timestamp;
            }
            const delta = (timestamp - prevTime) / 1000;
            prevTime = timestamp;
            if (this.status === "Moving") {
                this.time = this.time + delta;
                const [txv, endSimulate] = this.onTickSimulate(delta);
                this.afterTickActions.forEach(func => func(txv, this.time===0 || this.time >= stepTime));
                let contenue = true;
                if (endSimulate) {
                    this.changeToEnding();
                    contenue = false;
                }
                else if (this.time >= stepTime) {
                    if (this.isPauseOnStep) {
                        this.changeToPausing();
                        contenue = false;
                    }
                    else {
                        stepTime = setStepTime(); 
                    }
                }
                
                if(contenue) window.requestAnimationFrame(tick);
            }
            else {
                startTime = undefined;
                prevTime = undefined;
            }
        };
        window.requestAnimationFrame(tick);
    }
}
