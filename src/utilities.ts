export type TXV = [number, number, number]; 
export type XY = [number, number];
export type Status = "Begining" | "Moving" | "Pausing" | "Ending";

export const getArrowPath = ([startX, startY]: XY, [dx, dy]: XY, ctrlPoints: [XY, XY, XY]): Path2D => {
    const len = Math.sqrt(dx * dx + dy * dy);
    const [sin,cos] = [dy / len, dx / len];
    const a1 = ctrlPoints.map(([cx, cy]) => [cx < 0 ? len + cx : cx, cy]);
    const a2 = ctrlPoints.map(([cx, cy]) => [cx < 0 ? len + cx : cx, -cy]).reverse();
    const path = new Path2D("M 0 0");
    [...a1, [len,0], ...a2].forEach(([ax, ay])=> path.lineTo(ax * cos - ay * sin + startX, ax * sin + ay * cos + startY));
    path.closePath();
    return path;
};

export const Color = {
    Sky: "#80D8FF",
    Ground : "#6D4C41",
    V: 'rgba(33, 150, 243)',
    VHalf: 'rgba(33, 150, 243, 0.5)',
    Obj: 'rgb(244, 67, 54)',
    ObjHalf: 'rgb(244, 67, 54,0.5)',
    Grid : "#607D8B",
} as const;

export const Pref = {
    LX : 16,
    LY : 9,
    OX : 2,
    OY: 3,
    CanvasWidth: 640,
    MaxV0 : 5,
    DefaultInitialXY: [0, 0] as XY,
    StepDT: 0.5,
    UseLMWCA: true,
    InitialVStep : 0.1,
} as const;