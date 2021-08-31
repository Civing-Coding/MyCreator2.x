const { ccclass, property } = cc._decorator;

const TWEEN_TYPE = cc.Enum({
    DISPLAY: 0,
    FADE: 1,
    SCALE: 2,
    POSITION: 3,
    SIZE: 4,
    SCALE_AND_FADE: 5,
})

const TWEEN_EXCUTE = cc.Enum({
    SHOW: 0,
    HIDE: 1,
    NONE: 2,
})

@ccclass
export default class TweenEx extends cc.Component {

    @property({ type: cc.Node, tooltip: "选填,默认为当前结点" })
    target: cc.Node = this.node;

    @property({ type: TWEEN_TYPE })
    tweenType = TWEEN_TYPE.DISPLAY;

    @property({
        type: cc.Float,
        visible(this: any) {
            return this.tweenType != TWEEN_TYPE.DISPLAY
        }
    })
    duration: number = 0;

    @property(cc.Float)
    delayTime: number = 0;

    @property({
        tooltip: "是否是显示状态,不影响动画 show hide"
    })
    defaultDisplay: boolean = false;

    @property({
        visible(this: any) {
            return this.tweenType == TWEEN_TYPE.FADE || this.tweenType == TWEEN_TYPE.SCALE_AND_FADE;
        }
    })
    targetOpacity: number = 0;

    @property({
        visible(this: any) {
            return this.tweenType == TWEEN_TYPE.SCALE || this.tweenType == TWEEN_TYPE.SCALE_AND_FADE;
        }
    })
    targetScale: cc.Vec3 = cc.v3(0, 0, 0);

    @property({
        visible(this: any) {
            return this.tweenType == TWEEN_TYPE.POSITION
        }
    })
    targetPostion: cc.Vec3 = cc.v3(0, 0, 0);

    @property({
        visible(this: any) {
            return this.tweenType == TWEEN_TYPE.SIZE
        }
    })
    targetSize: cc.Size = cc.size(0, 0);

    @property({
        visible(this: any) {
            return this.tweenType != TWEEN_TYPE.DISPLAY
        }
    })
    loop: boolean = false;

    @property({
        visible(this: any) {
            return this.loop && this.tweenType != TWEEN_TYPE.DISPLAY
        },
        tooltip: "-1永久循环"
    })
    loopTimes: number = -1;

    @property({ type: TWEEN_EXCUTE })
    startExcute = TWEEN_EXCUTE.NONE;

    @property({ type: [cc.Component.EventHandler] })
    beginCallBack = [];

    @property({ type: [cc.Component.EventHandler] })
    endCallBack = [];

    private _orginPosition: cc.Vec3 = cc.v3(0, 0, 0);
    private _orginSize: cc.Size = cc.size(0, 0);
    private _orginOpacity: number = 0;
    private _orginScale: cc.Vec3 = cc.v3(0, 0, 0);
    private _tween: cc.Tween = null;

    onLoad() {
        let node = this.target || this.node;
        this._orginPosition = node.position;
        this._orginOpacity = node.opacity;
        this._orginSize = node.getContentSize();
        node.getScale(this._orginScale);
    }

    start() {
        let node = this.target || this.node;
        node.opacity = this.defaultDisplay ? this._orginOpacity : 0;
        node.setScale(this.defaultDisplay ? this._orginScale : cc.v3(0, 0, 0));
        if (this.tweenType == TWEEN_TYPE.POSITION) {
            node.position = this._orginPosition;
        }
        if (this.startExcute != TWEEN_EXCUTE.NONE) {
            this.startExcute == TWEEN_EXCUTE.SHOW ? this.show() : this.hide();
        }
    }

    doAction(reverse: boolean = false) {
        let obj = this.target || this.node;
        let tm = this.duration;
        let dy = this.delayTime;
        let loop = this.loop;
        let loopTimes = this.loopTimes;

        let func = () => {
            this.onBegin();
            switch (this.tweenType) {
                case TWEEN_TYPE.DISPLAY:
                    obj.opacity = reverse ? 0 : this._orginOpacity;
                    obj.setScale(reverse ? cc.v2(0, 0) : this._orginScale);
                    break;
                case TWEEN_TYPE.FADE:
                    obj.setScale(this._orginScale);
                    obj.opacity = reverse ? this.targetOpacity : this._orginOpacity;
                    if (loop) {
                        this._tween = cc.tween(obj)
                            .to(tm, { opacity: reverse ? this._orginOpacity : this.targetOpacity })
                            .to(tm, { opacity: reverse ? this.targetOpacity : this._orginOpacity })
                            .union()

                        if (loopTimes == -1) {
                            this._tween.repeatForever().start()
                        } else {
                            this._tween.repeat(loopTimes).call(this.onEnd, this).start()
                        }
                    } else {
                        this._tween = cc.tween(obj)
                            .to(tm, { opacity: reverse ? this._orginOpacity : this.targetOpacity })
                            .call(this.onEnd, this)
                            .start()
                    }
                    break;
                case TWEEN_TYPE.POSITION:
                    obj.setScale(this._orginScale);
                    obj.opacity = this._orginOpacity;
                    obj.position = reverse ? this.targetPostion : this._orginPosition;
                    if (loop) {
                        this._tween = cc.tween(obj)
                            .to(tm, { position: reverse ? this._orginPosition : this.targetPostion })
                            .to(tm, { position: reverse ? this.targetPostion : this._orginPosition })
                            .union()
                        if (loopTimes == -1) {
                            this._tween.repeatForever().start()
                        } else {
                            this._tween.repeat(loopTimes).call(this.onEnd, this).start()
                        }
                    } else {
                        this._tween = cc.tween(obj)
                            .to(tm, { position: reverse ? this._orginPosition : this.targetPostion })
                            .call(this.onEnd, this)
                            .start()
                    }
                    break;
                case TWEEN_TYPE.SCALE:
                    obj.setScale(reverse ? this.targetScale : this._orginScale);
                    obj.opacity = this._orginOpacity;
                    if (loop) {
                        this._tween = cc.tween(obj)
                            .to(tm, {
                                scaleX: reverse ? this._orginScale.x : this.targetScale.x,
                                scaleY: reverse ? this._orginScale.y : this.targetScale.y,
                                scaleZ: reverse ? this._orginScale.z : this.targetScale.z,
                            })
                            .to(tm, {
                                scaleX: reverse ? this.targetScale.x : this._orginScale.x,
                                scaleY: reverse ? this.targetScale.y : this._orginScale.y,
                                scaleZ: reverse ? this.targetScale.z : this._orginScale.z,
                            })
                            .union()
                        if (loopTimes == -1) {
                            this._tween.repeatForever().start()
                        } else {
                            this._tween.repeat(loopTimes).call(this.onEnd, this).start()
                        }
                    } else {
                        this._tween = cc.tween(obj)
                            .to(tm, {
                                scaleX: reverse ? this._orginScale.x : this.targetScale.x,
                                scaleY: reverse ? this._orginScale.y : this.targetScale.y,
                                scaleZ: reverse ? this._orginScale.z : this.targetScale.z,
                            })
                            .call(this.onEnd, this)
                            .start()
                    }
                    break;
                case TWEEN_TYPE.SIZE:
                    obj.setScale(this._orginScale);
                    obj.opacity = this._orginOpacity;
                    if (loop) {
                        this._tween = cc.tween(obj)
                            .to(tm, {
                                width: reverse ? this._orginSize.width : this.targetSize.width,
                                height: reverse ? this._orginSize.width : this.targetSize.height
                            })
                            .to(tm, {
                                width: reverse ? this.targetSize.width : this._orginSize.width,
                                height: reverse ? this.targetSize.width : this._orginSize.height
                            })
                            .union()
                        if (loopTimes == -1) {
                            this._tween.repeatForever().start()
                        } else {
                            this._tween.repeat(loopTimes).call(this.onEnd, this).start()
                        }
                    } else {
                        this._tween = cc.tween(obj)
                            .to(tm, {
                                width: reverse ? this._orginSize.width : this.targetSize.width,
                                height: reverse ? this._orginSize.width : this.targetSize.height
                            })
                            .call(this.onEnd, this)
                            .start()
                    }
                    break;
                case TWEEN_TYPE.SCALE_AND_FADE:
                    obj.setScale(reverse ? this.targetScale : this._orginScale);
                    obj.opacity = reverse ? this.targetOpacity : this._orginOpacity;
                    if (loop) {
                        this._tween = cc.tween(obj)
                            .to(tm, {
                                scaleX: reverse ? this._orginScale.x : this.targetScale.x,
                                scaleY: reverse ? this._orginScale.y : this.targetScale.y,
                                scaleZ: reverse ? this._orginScale.z : this.targetScale.z,
                                opacity: reverse ? this._orginOpacity : this.targetOpacity
                            })
                            .to(tm, {
                                scaleX: reverse ? this.targetScale.x : this._orginScale.x,
                                scaleY: reverse ? this.targetScale.y : this._orginScale.y,
                                scaleZ: reverse ? this.targetScale.z : this._orginScale.z,
                                opacity: reverse ? this.targetOpacity : this._orginOpacity
                            })
                            .union()
                        if (loopTimes == -1) {
                            this._tween.repeatForever().start()
                        } else {
                            this._tween.repeat(loopTimes).call(this.onEnd, this).start()
                        }
                    } else {
                        this._tween = cc.tween(obj)
                            .to(tm, {
                                scaleX: reverse ? this._orginScale.x : this.targetScale.x,
                                scaleY: reverse ? this._orginScale.y : this.targetScale.y,
                                scaleZ: reverse ? this._orginScale.z : this.targetScale.z,
                                opacity: reverse ? this._orginOpacity : this.targetOpacity
                            })
                            .call(this.onEnd, this)
                            .start()
                    }
                    break;
                default: break;
            }
        }

        this.scheduleOnce(func, dy);
    }

    show() {
        this.doAction(false);
    }

    hide() {
        this.doAction(true);
    }

    onBegin() {
        cc.Component.EventHandler.emitEvents(this.beginCallBack);
    }

    onEnd() {
        cc.Component.EventHandler.emitEvents(this.endCallBack);
    }
}
