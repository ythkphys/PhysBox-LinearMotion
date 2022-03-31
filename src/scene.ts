import { getArrowPath, TXV, XY, Color, Pref} from "./utilities";
import { TimeManager } from "./timeManager";
import { Simulator } from "./simulator";
import { Graph } from "./graph";

const { LX, LY, OX, OY, CanvasWidth: width, MaxV0, DefaultInitialXY} = Pref;
const height = Math.round(width * LY / LX);
const grid = width / LX;

//const CanvasXYtoWorldXY = ([cx,cy]: XY): XY =>  [cx / grid -2 , LY - cy / grid - 2];
const carF = new Path2D("M -2 5 q -2 0 -2 -2 v -1 q 0 -1 1 -1 h 6 q 1 0 1 1 v 1 q 0 2 -2 2 z");
const wheelF = new Path2D();
const pi = Math.PI;
wheelF.arc(-2, 1, 1, 0, 2 * pi);
wheelF.moveTo(3, 1);
wheelF.arc(2, 1, 1, 0, 2 * pi);
const wheelS = new Path2D();
wheelS.arc(-2, 1, 1, 0, pi);
wheelS.moveTo(3, 1);
wheelS.arc(2, 1, 1, 0, pi);

export class Scene { 
    readonly timeManager: TimeManager;
    readonly simulator: Simulator;
    readonly graph: Graph;
    readonly ctx: CanvasRenderingContext2D;
    stepPoint: XY[];
    initialV: number;

    constructor(canvasMain: HTMLCanvasElement, canvasGraphX: HTMLCanvasElement, canvasGraphV: HTMLCanvasElement) {
        this.initialV = 0;
        this.timeManager = new TimeManager(Pref.StepDT);
        this.simulator = new Simulator(this.timeManager, [0, 0, 0], Pref.UseLMWCA);
        this.graph = new Graph(canvasGraphX,canvasGraphV);
        canvasMain.width = width;
        canvasMain.height = height;
        this.ctx = canvasMain.getContext("2d")!;
        this.ctx.setTransform(grid, 0, 0, -grid, OX * grid, -OY * grid + height);
        this.stepPoint = [];
        this.timeManager.subscriveStatus("Begining", () => {
            this.stepPoint = [];
            this.initialV = 0;
            this.simulator.setInitial([0, DefaultInitialXY[0], this.initialV] as TXV);
            this.drawBackgroundPart();
            this.drawObjectPart(DefaultInitialXY);
            this.graph.clearPlot(this.simulator.initialTXV);
        });
        this.timeManager.subscriveTickAction((txv, step) => {
            const xy: XY = [txv[1], DefaultInitialXY[1]];
            if (step) this.stepPoint.push(xy);
            this.drawBackgroundPart();
            this.drawObjectPart(xy);
            this.graph.addPlot(txv, step);
        });
    }
    public get txv() { return this.simulator.txv; }
    
    public setInitialV(initialV: number) {
        initialV = Math.min(MaxV0, initialV);
        initialV = Math.round(initialV / Pref.InitialVStep) * Pref.InitialVStep;
        this.initialV = initialV;
        this.simulator.setInitial([0, DefaultInitialXY[0], initialV] as TXV);
        this.drawBackgroundPart();
        this.drawObjectPart(DefaultInitialXY);
        this.drawInitialArrowPart();
        this.graph.clearPlot(this.simulator.initialTXV);
    }

    private drawBackgroundPart() {
        const ctx = this.ctx;
        ctx.fillStyle = Color.Sky;
        ctx.fillRect(-OX, -OY, LX, LY);
        ctx.fillStyle = Color.Ground;
        ctx.fillRect(-OX, -OY, LX, OY);
        
        ctx.strokeStyle = Color.Grid;
        ctx.lineWidth = 0.015;
        ctx.setLineDash([0.1039, 0.1039]);
        let path = "";
        for (let i = 0; i < LX; i++) path += `M ${i - OX} -${OY} v ${LY} `
        for (let i = 0; i < LY; i++) path += `M -${OX} ${i - OY} h ${LX} `
        ctx.stroke(new Path2D(path));
        ctx.setLineDash([]);
    }

    private drawObjectPart([x,y]:XY) {
        const ctx = this.ctx; 
        ctx.save();
        ctx.strokeStyle = Color.Sky;
        ctx.lineWidth = 0.25;
        ctx.fillStyle = Color.Obj;
        ctx.translate(x, y);
        ctx.scale(0.125, 0.125);

        ctx.fill(carF);
        ctx.fill(wheelF);
        ctx.stroke(wheelS);
        ctx.restore();

        ctx.fillStyle = Color.ObjHalf;
        this.stepPoint.forEach(([sx, sy]) => ctx.fillRect(sx - 0.1, sy - 0.1, 0.2, 0.2));
    }

    private drawInitialArrowPart() {
        const ctx = this.ctx;
        ctx.fillStyle = Color.V;
        const arrow = getArrowPath(
            [DefaultInitialXY[0], DefaultInitialXY[1]+0.3125],
            [this.initialV*2, 0], [[0,0.03],[-0.3,0.1],[-0.3,0.2]]
        );
        ctx.fill(arrow);
    }
}