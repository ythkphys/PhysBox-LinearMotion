import Chart from "../node_modules/chart.js/auto/auto.esm";
import { Color, TXV ,Pref} from "./utilities";

type xyObj = { x: number, y: number };
export class Graph {
    readonly chartX: Chart;
    readonly xtData: xyObj[] = [];
    readonly chartV: Chart;
    readonly vtData: xyObj[] = [];
    readonly tMinMaxDefalut = { suggestedMin: 0, suggestedMax:5 } as const;
    readonly xMinMaxDefalut = { suggestedMin: -Pref.OX, suggestedMax: Pref.LX - Pref.OX+1 } as const;
    readonly vMinMaxDefalut = { suggestedMin: 0, suggestedMax: Pref.MaxV0 } as const;
    tMinMax = { ...this.tMinMaxDefalut };
    xMinMax = { ...this.xMinMaxDefalut };
    vMinMax = { ...this.vMinMaxDefalut };

    addPlot([t, x, v]: TXV, step:boolean) {
        this.chartX.data.datasets[0].data.push({ x: t, y: x });
        this.chartV.data.datasets[0].data.push({ x: t, y: v });

        this.chartX.data.datasets[1].data = [{ x: t, y: x }];
        this.chartV.data.datasets[1].data = [{ x: t, y: v }];
        
        if (step) {
            this.chartX.data.datasets[2].data.push({ x: t, y: x });
            this.chartV.data.datasets[2].data.push({ x: t, y: v });            
        }
        this.chartX.update();
        this.chartV.update();
    }
    clearPlot(initial: TXV) { 
        this.tMinMax = { ...this.tMinMaxDefalut };
        this.xMinMax = { ...this.xMinMaxDefalut };
        this.vMinMax = { ...this.vMinMaxDefalut };

        this.chartX.data.datasets[0].data = [];
        this.chartV.data.datasets[0].data = [];

        this.chartX.data.datasets[1].data = [{ x: initial[0], y: initial[1] }];
        this.chartV.data.datasets[1].data = [{ x: initial[0], y: initial[2] }];

        this.chartX.data.datasets[2].data = [];
        this.chartV.data.datasets[2].data = [];

        this.chartX.update();
        this.chartV.update();
    }

    constructor(canvasGraphX: HTMLCanvasElement, canvasGraphV: HTMLCanvasElement) {
        const settingX = {
            label: "",
            data: [],
            borderColor: Color.Obj,
            backgroundColor: Color.ObjHalf,
            tension: 0.5,
        };
        const settingY = {
            label: "",
            data: [],
            borderColor: Color.V,
            backgroundColor: Color.VHalf,
            tension: 0.5,
        };

        this.chartX = new Chart(canvasGraphX, {
            type: "scatter",
            data: {
                datasets: [
                    { ...settingX, showLine: true , pointRadius: 0 },
                    { ...settingX, showLine: false, pointRadius: 8 },
                    { ...settingX, showLine: false, pointRadius: 5 }
                ]
            },
            options: {
                interaction: {mode:"index"},
                responsive: true,
                animation: false,
                aspectRatio:16/9,
                scales: {
                    x: {
                        ...this.tMinMax,
                        title: { display: true, text: "時間 [s]" },

                    },
                    y: {
                        ...this.xMinMax,
                        title: { display: true, text: "位置 [m]" },
                        grid: {
                            lineWidth: context => context.tick.value == 0 ? 2 : 1,
                            color: context => context.tick.value == 0 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
                        },
                    },
                },
                plugins: {
                    legend: {display:false},
                    title: {display:true, text:"x-tグラフ",position:"top"}
                }
            },
        });

        this.chartV = new Chart(canvasGraphV, {
            type: "scatter",
            data: {
                datasets: [
                    { ...settingY, showLine: true , pointRadius: 0, },
                    { ...settingY, showLine: false, pointRadius: 8, },
                    { ...settingY, showLine: false, pointRadius: 5, }
                ]
            },
            options: {
                interaction: { mode: "nearest" },
                responsive: true,
                animation: false,
                aspectRatio: 16 / 9,
                scales: {
                    
                    x: {
                        ...this.tMinMax,
                        title: { display: true, text: "時間 [s]" },
                    },
                    y: {
                        ...this.vMinMax,
                        title: { display: true, text: "速度 [m/s]" },
                        grid: {
                            lineWidth: context => context.tick.value == 0 ? 2 : 1,
                            color: context => context.tick.value == 0 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: "v-tグラフ", position: "top" }
                }
            }
        });
     }
};