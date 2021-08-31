import { EventManager } from "./EventManager"

const { ccclass, property } = cc._decorator;

const GUIDANIMTYPE = cc.Enum({
    OPACITY: 0,
    SCALE: 1,
    MOVE: 2,
    OPACITYANDSCALE: 3
})

@ccclass
export default class UIGuid extends cc.Component {

    @property({
        type: cc.Integer,
        displayName: "指引id",
        tooltip: "用于控制播放暂停,默认0"
    })
    guidId = 0;

    @property({
        displayName: "开始时执行",
        tooltip: "runOnStart"
    })
    runOnStart = true;

    @property({
        type: GUIDANIMTYPE,
        displayName: "指引动作类型",
        tooltip: "闪烁 缩放 移动"
    })
    animType = GUIDANIMTYPE.OPACITY;

    @property({
        displayName: "目标位置",
        tooltip: "选择MOVE类型需要的参数",
        visible(this: any) {
            return this.animType == GUIDANIMTYPE.MOVE
        }
    })
    targetPosition: cc.Vec3 = cc.v3(0, 0, 0);

    @property({
        type: cc.Float,
        displayName: "缩放最大scale",
        tooltip: "选择SCALE类型需要的参数",
        visible(this: any) {
            return this.animType == GUIDANIMTYPE.SCALE || this.animType == GUIDANIMTYPE.OPACITYANDSCALE
        }
    })
    zoomScale = 1.2;

    @property({
        type: cc.Integer,
        displayName: "最小透明度",
        tooltip: "选择OPACITY类型需要的参数",
        visible(this: any) {
            return this.animType == GUIDANIMTYPE.OPACITY || this.animType == GUIDANIMTYPE.OPACITYANDSCALE
        }
    })
    minOpacity = 100;

    @property({
        type: cc.Float,
        displayName: "动作播放倍速",
        tooltip: "默认1倍速"
    })
    frameRate = 1;

    @property({
        type: cc.Float,
        displayName: "动作间隙",
        tooltip: "动作间隔时间"
    })
    frameInterval = 0.5;


    @property({
        type: cc.Integer,
        displayName: "执行次数",
        tooltip: "0永久执行"
    })
    frameTimes = 0;

    @property({
        displayName: "回调开关",
        tooltip: "包含点击，EventManager，EventHandle"
    })
    needCallBack = true;

    @property({
        type: [cc.Component.EventHandler],
        displayName: "Event",
        tooltip: "EventHandle",
        visible(this: any) {
            return this.needCallBack
        }
    })
    callBacks = [];

    private _tween: cc.Tween = null;
    private _orginPosition: cc.Vec3 = null;

    onLoad() {
        let ev = EventManager.getInstance();
        ev.on(`UIGUID_SHOW_${this.guidId}`, this.show.bind(this));
        ev.on(`UIGUID_HIDE_${this.guidId}`, this.hide.bind(this));
    }

    start() {
        this.node.opacity = 0;
        this._orginPosition = this.node.position;
        this.runOnStart && this.show();
    }

    show() {
        this.needCallBack && this.node.once(cc.Node.EventType.TOUCH_START, this.hide, this);
        let tm = 1 * this.frameRate;
        let it = this.frameInterval;
        switch (this.animType) {
            case GUIDANIMTYPE.OPACITY:
                this.node.opacity = 255;
                this._tween = cc.tween(this.node)
                    .to(tm, { opacity: this.minOpacity })
                    .delay(it)
                    .to(tm, { opacity: 255 })
                    .delay(it)
                    .union()
                break;
            case GUIDANIMTYPE.SCALE:
                this.node.scale = 1;
                this.node.opacity = 255;
                this._tween = cc.tween(this.node)
                    .to(tm, { scale: this.zoomScale })
                    .delay(it)
                    .to(tm, { scale: 1 })
                    .delay(it)
                    .union()
                break;
            case GUIDANIMTYPE.MOVE:
                this.node.opacity = 255;
                this._tween = cc.tween(this.node)
                    .set({ opacity: 255, position: this._orginPosition })
                    .to(tm, { position: this.targetPosition })
                    .delay(it)
                    .set({ opacity: 0 })
                    .union()
                break;
            case GUIDANIMTYPE.OPACITYANDSCALE:
                this.node.opacity = 255;
                this.node.scale = this.zoomScale;
                this._tween = cc.tween(this.node)
                    .to(tm, { opacity: this.minOpacity, scale: 1 })
                    .delay(it)
                    .to(tm, { opacity: 255, scale: this.zoomScale })
                    .delay(it)
                    .union()
                break;
            default: break;
        }
        if (this.frameTimes == 0) {
            this._tween.repeatForever().start();
        } else {
            this._tween.repeat(this.frameTimes).start();
        }
    }

    hide(event: cc.Touch) {
        !!this._tween && this._tween.stop();
        this.node.opacity = 0;
        this.node.scale = 1;
        this.node.position = this._orginPosition;
        this.needCallBack && EventManager.getInstance().emit(`UIGUID_EXCUTE_${this.guidId}`);
        cc.Component.EventHandler.emitEvents(this.callBacks, event);
    }

    onDisable() {
        let ev = EventManager.getInstance();
        ev.remove(`UIGUID_SHOW_${this.guidId}`);
        ev.remove(`UIGUID_HIDE_${this.guidId}`);
    }
}
