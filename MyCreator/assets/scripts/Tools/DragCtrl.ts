import { Utils } from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragCtrl extends cc.Component {

    @property(cc.Node)
    target: cc.Node[] = [];

    @property(cc.Vec2)
    offset: any = cc.v2(0, 0);

    @property(cc.Vec3)
    dragEndPosition: cc.Vec3 = cc.v3(0, 0, 0);

    @property({ type: [cc.Component.EventHandler] })
    dragSuccess_cb = [];

    @property({ type: [cc.Component.EventHandler] })
    dragFail_cb = [];

    protected dragTarget: cc.Vec2;
    protected dragOffset: cc.Vec2;
    protected orginPos: cc.Vec3;
    protected zIndex: number;
    protected targetRange: cc.Rect[] = [];

    onLoad() {
        this.zIndex = this.node.zIndex;
        this.orginPos = this.node.position;

        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    start() {
        for (let i in this.target) {
            this.setTargetPos(this.target[i].x, this.target[i].y, this.offset.x, this.offset.y);
        }
    }

    setTargetPos(x: number, y: number, width: number, height: number) {
        this.dragTarget = cc.v2(x, y);
        this.dragOffset = cc.v2(width, height);

        this.targetRange.push(cc.rect(
            this.dragTarget.x - this.dragOffset.x / 2,
            this.dragTarget.y - this.dragOffset.y / 2,
            this.dragOffset.x,
            this.dragOffset.y
        ));
    }

    touchStart() {
        this.node.opacity = 200;
        this.node.zIndex = cc.macro.MAX_ZINDEX;
    }

    touchMove(e: cc.Touch) {
        this.node.x += e.getDelta().x;
        this.node.y += e.getDelta().y;
    }

    touchEnd() {
        this.node.opacity = 255;
        this.node.zIndex = this.zIndex;

        for (let i in this.targetRange) {
            if (this.targetRange[i].contains(cc.v2(this.node.x, this.node.y))) {
                this.dragEnd(true, i);
                return;
            }
        }

        this.node.position = this.orginPos;
        this.dragEnd(false, '');

    }

    dragEnd(over: Boolean, rangId: string) {
        cc.log('拖拽到指定地点', over, rangId);
        if (over) {
            this.node.position = this.dragEndPosition;
            this.endListener();
            cc.Component.EventHandler.emitEvents(this.dragSuccess_cb, rangId);
        } else {
            cc.Component.EventHandler.emitEvents(this.dragFail_cb, rangId);
        }

    }

    endListener() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    ok(args: any) {
        console.log('ok' + args);
    }

    no(args: any) {
        console.log('no' + args);
    }

}
