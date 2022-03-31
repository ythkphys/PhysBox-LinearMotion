import { TimeManager } from "./timeManager";
import { TXV } from "./utilities";

const axpy = (a: number, x: TXV, y: TXV):TXV => [a * x[0] + y[0], a * x[1] + y[1], a * x[2] + y[2]];

export class Simulator {
    txv: TXV;
    private initial: TXV;

    afunc: ((txv: TXV) => number) = (_) => 0;
    isEnd: ((txv: TXV) => boolean) = ([t, x,]) => t>10 || -2 > x || x > 15;
    
    constructor(timeManager: TimeManager, initial: TXV = [0, 0, 0], isLMWCA:boolean) {
        this.txv = initial;
        this.initial = initial;
        timeManager.subscriveTickSimulate((delta: number) => {
            this.txv = isLMWCA ? this.lmwca(this.txv, delta) : this.rungeKutta(this.txv, delta);
            return [this.txv, this.isEnd(this.txv)];
        });
        timeManager.subscriveStatus("Begining", () => this.reset());
    }
    setInitial(initial:TXV) { 
        this.initial = initial;
        this.reset();
    }
    
    get initialTXV() { return this.initial; }
    
    private reset() {
        this.txv = this.initial;
    }

    private lmwca([t,x,v]: TXV, dt: number): TXV{
        const a = this.afunc([t, x, v]);
        const newt = t + dt;
        return [newt, this.initial[1] + this.initial[2] * newt + 0.5*a*newt*newt , this.initial[2] + a*newt];
    }

    private rungeKutta(txv: TXV, dt:number):TXV{
        const calcA = (txv:TXV)=>this.afunc(txv);
        const a = calcA(txv);
        const k1:TXV = [1, txv[2], a];
        const arg1 = axpy(dt / 2, k1, txv);
        const a1 = calcA(arg1);
        const k2:TXV = [1, arg1[2], a1];
        const arg2 = axpy(dt / 2, k2, txv);
        const a2 = calcA(arg2); 
        const k3: TXV = [1, arg2[2], a2];
        const arg3 = axpy(dt, k3, txv);
        const a3 = calcA(arg3); 
        const k4: TXV = [1, arg3[2], a3];
        return txv.map((d, i) => d + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6) as TXV; 
    }
}