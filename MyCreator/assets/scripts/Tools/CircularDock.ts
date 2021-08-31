
const { ccclass, property } = cc._decorator;


const Direction = cc.Enum({
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
})


@ccclass
export default class CircularDock extends cc.Component {

    @property({
        displayName: '半径',
        type: cc.Float
    })
    radius: number = 0;

    @property({
        displayName: '朝向',
        type: Direction
    })
    direction = Direction.RIGHT;

    @property({
        displayName: '是否大小变化',
    })
    scaleChange: boolean = false;

    private _dockList: cc.Node[] = [];
    private _interval: number = 0;
    private _posList: cc.Vec3[] = [];
    private _index: number = 0;
    private _allowRotate: boolean = true;

    onLoad() {
        this.node.setContentSize(cc.size(2 * this.radius, 2 * this.radius));
        this._dockList = this.node.children;
        this._interval = 2 * Math.PI / this._dockList.length;
        this._index = 0;
    }

    start() {
        if (this._dockList.length < 3) {
            return;
        }
        for (let i in this._dockList) {
            //顺时针排列 (this._interval * parseInt(i) - Math.PI / 2) 逆时针排列 Math.PI  - (this._interval * parseInt(i) - Math.PI / 2)
            let pos = this.getCirclePoint(this.radius, Math.PI - (this._interval * parseInt(i) - Math.PI / 2));
            this._dockList[i].position = pos;
            this._posList.push(pos);
            this._dockList[i].getComponentInChildren(cc.Label).string = i;
            if (!this.scaleChange) {
                continue;
            }
            if (parseInt(i) == 1 || parseInt(i) == this._dockList.length - 1) {
                this._dockList[i].scale = 1.2;
            } else if (i == '0') {
                this._dockList[i].scale = 1.3;
            }
        }
    }

    getCirclePoint(radius: number, degree: number) {
        switch (this.direction) {
            case Direction.RIGHT: degree += Math.PI / 2; break;
            case Direction.DOWN: degree += Math.PI; break;
            case Direction.LEFT: degree -= Math.PI / 2; break;
            default: break;
        }
        return cc.v3(radius * Math.cos(-degree), radius * Math.sin(-degree));
    }

    rotate(clockwise: boolean) {
        if (!this._allowRotate || this._dockList.length < 3) {
            return;
        }
        this._index += clockwise ? 1 : -1;
        this._index = this._index >= this._dockList.length ? 0 : this._index;
        this._allowRotate = false;
        let actionTime = 0.3;
        cc.tween(this.node)
            .by(actionTime, { angle: this._interval * 180 / Math.PI * (clockwise ? -1 : 1) })
            .call(() => {
                this._allowRotate = true;
            })
            .start()

        let list = this.getListItem(this._dockList, this._index);
        for (let i in this._dockList) {
            cc.tween(this._dockList[i]).by(actionTime, { angle: this._interval * 180 / Math.PI * (clockwise ? 1 : -1) }).start()
            if (!this.scaleChange) {
                continue;
            }
            if (this._dockList[i] == list[0] || this._dockList[i] == list[2]) {
                cc.tween(this._dockList[i]).to(actionTime, { scale: 1.2 }).start()
            } else if (this._dockList[i] == list[1]) {
                cc.tween(this._dockList[i]).to(actionTime, { scale: 1.3 }).start()
            } else if (this._dockList[i].scale != 1) {
                cc.tween(this._dockList[i]).to(actionTime, { scale: 1 }).start()
            }
        }
    }

    getListItem(list: Array<any>, index: number) {
        let last = list[index - 1];
        if (!last) {
            last = list[list.length - 1];
        }
        let next = list[index + 1];
        if (!next) {
            next = list[0];
        }
        return [last, list[index], next];
    }

}
