
export class Utils {

    //数字开头填充0
    static padStart(num: any, n: number) {
        let len = num.toString().length;
        while (len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }

    //固定种子重复随机算法 
    static getRandomBySeedRe(seed: number, num: number, minN: number, maxN: number) {
        let seededRandom = function (max: number, min: number) {
            max = max || 1;
            min = min || 0;
            seed = (seed * 9301 + 49297) % 233280;
            let rnd = seed / 233280.0;
            return Math.floor(min + rnd * (max - min));
        }

        let list = [];
        while (list.length < num) {
            list.push(seededRandom(maxN, minN));
        }
        return list;
    };

    //固定种子不重复随机算法 
    static getRandomBySeed(seed: number, num: number, minN: number, maxN: number) {
        let seededRandom = function (max: number, min: number) {
            max = max || 1;
            min = min || 0;
            seed = (seed * 9301 + 49297) % 233280;
            let rnd = seed / 233280.0;
            return Math.floor(min + rnd * (max - min));
        }

        let list: Set<number> = new Set();
        while (list.size < num) {
            list.add(seededRandom(maxN, minN));
        }
        return new Array(list);
    };

    //带权重随机
    static randomWithWeight(weightList: number[]) {
        if (weightList.length == 1) {
            return 0;
        }
        let total = 0;
        weightList.forEach(i => {
            total += i;
        });
        let r = Utils.random(1, total);
        let i = 0;
        let temp = 0;
        while (temp < total) {
            temp += weightList[i];
            if (r <= temp) {
                return i;
            }
            ++i;
        }
        return weightList.length - 1;
    }

    //正态分布随机  -1-1 68%  -2-2 95% -3-3 99%  other 0.2%
    static random_Box_Muller() {
        //Math.sqrt(-2 * Math.log(Math.random())) * Math.sin(2 * Math.PI * Math.random());
        let ran = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
        return ran;
    }

    //获取是一年的第几周
    static getWeekOfYear() {
        let today = new Date();
        let firstDay = new Date(today.getFullYear(), 0, 1);
        let dayOfWeek = firstDay.getDay();
        let spendDay = 1;
        if (dayOfWeek != 0) {
            spendDay = 7 - dayOfWeek + 1;
        }
        firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
        let d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
        let result = Math.ceil(d / 7);
        return result + 1;
    };

    //金币转化为100，000  
    static formatMoney = (s: string, type: number) => {
        if (/[^0-9\.]/.test(s))
            return "0.00";
        if (s == null || s == "null" || s == "")
            return "0.00";
        s = s.toString().replace(/^(\d*)$/, "$1.");
        s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
        s = s.replace(".", ",");
        let re = /(\d)(\d{3},)/;
        while (re.test(s))
            s = s.replace(re, "$1,$2");
        s = s.replace(/,(\d\d)$/, ".$1");
        if (type == 0) {
            let a = s.split(".");
            if (a[1] == "00") {
                s = a[0];
            }
        }
        return s;
    };

    //金币转化为 10,000P
    static covertMoney(s: string) {
        let value = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'B', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj', 'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz'];
        s = Utils.formatMoney(s, 0);
        let m = (s.match(/,/g) || []).length;
        let n = s.indexOf(','); //-1
        if (m >= 0 && n >= 0) {
            return s.slice(0, n + 4) + value[m - 1];
        } else {
            return s;
        }
    }

    static random(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    //返回当前到秒的时间戳
    static getTime() {
        return Math.floor(new Date().getTime() / 1000);
    }

    //返回当前天数时间戳  
    static getDay() {
        return Math.floor(Math.floor(new Date().getTime() / 1000) / 86400);
    }

    // 获取当前日期
    static getDate(): string {
        return new Date().toLocaleDateString();
    }

    //返回00：00形式
    static getTimeFormate(t: number) {
        let a = Math.floor(t / 3600);
        let b = Math.floor(t % 3600 / 60);
        let c = Math.floor(t % 60);
        return !!a ? `${Utils.padStart(a, 2)}:${Utils.padStart(b, 2)}:${Utils.padStart(c, 2)}` : `${Utils.padStart(b, 2)}:${Utils.padStart(c, 2)}`;
    }

    //http
    static http(url: string, data: any) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (!!xhr.response) {
                        console.log(xhr.response);
                        try {
                            const response = JSON.parse(xhr.response);
                            if (response.status == 1) {
                                resolve(response);
                            } else {
                                reject('参数错误');
                            }

                        } catch (e) {
                            console.error('json解析错误');
                            reject(e);
                        }
                    } else {
                        reject('url' + url + '空消息');
                    }
                }
            }
            xhr.ontimeout = () => {
                reject('超时');
            }

            xhr.onerror = () => {
                reject('连接失败');
            }

            xhr.open("post", url);
            xhr.setRequestHeader('Accept', 'appliaction/json');
            xhr.send(data);
        })
    }

    //h5获取参数
    static getQueryString(name: string) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
        if (r != null) return unescape(r[2]);
        return null;
    }


    //获取两点角度
    static getAngle(p1: cc.Vec2, p2: cc.Vec2): number {
        return Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    }

    //两点距离
    static getDistance(p1: cc.Vec2, p2: cc.Vec2): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    //通过角度获取弧度
    static angleToRadian(angle: number): number {
        return angle * Math.PI / 180;
    }

    //通过原点x,y 半径 角度 求圆上点坐标
    static getCirclePoint(center: cc.Vec2, radius: number, degree: number) {
        let x = center.x + radius * Math.cos(-degree * Math.PI / 180);
        let y = center.y + radius * Math.sin(-degree * Math.PI / 180);
        return cc.v2(x, y);
    }

    //显示当前节点树
    static tree(node: cc.Node = cc.director.getScene()) {
        let style = `color: ${node.parent === null || node.activeInHierarchy ? 'green' : 'grey'};`;
        if (node.childrenCount > 0) {
            console.groupCollapsed(`%c${node.name}`, style);
            node.children.forEach(child => Utils.tree(child));
            console.groupEnd();
        } else {
            console.log(`%c${node.name}`, style);
        }
    }

    //彩色log
    static colorLog(msg: string, color = '#6666ff') {
        console.log(`%c◆%c${msg}`, `color:#009999;font-weight:bold`, `color:${color};font-weight:bold;font-size:20px`);
    }

    /**
     * 获取纹理中指定像素的颜色，原点为左上角，从像素 (1, 1) 开始。
     * @param texture 纹理
     * @param x x 坐标
     * @param y y 坐标
     * @example
     * // 获取纹理左上角第一个像素的颜色
     * const color = ImageUtil.getPixelColor(texture, 1, 1);
     * // cc.color(50, 100, 123, 255);
     */
    public static getPixelColor(texture: cc.Texture2D, x: number, y: number): cc.Color {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = texture.width;
        canvas.height = texture.height;
        const image = texture.getHtmlElementObj();
        ctx.drawImage(image, 0, 0, texture.width, texture.height);
        const imageData = ctx.getImageData(0, 0, texture.width, texture.height);
        const pixelIndex = ((y - 1) * texture.width * 4) + (x - 1) * 4;
        const pixelData = imageData.data.slice(pixelIndex, pixelIndex + 4);
        const color = cc.color(pixelData[0], pixelData[1], pixelData[2], pixelData[3]);
        image.remove();
        canvas.remove();
        return color;
    }

    /**
     * @see ImageUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/ImageUtil.ts
     * 将图像转为 Base64 字符（仅 png、jpg 或 jpeg 格式资源）
     * @param url 图像地址
     * @param callback 完成回调
     */
    static imageToBase64(url: string, callback?: (dataURL: string) => void): Promise<string> {
        return new Promise(res => {
            let extname = /\.png|\.jpg|\.jpeg/.exec(url)?.[0];
            if (['.png', '.jpg', '.jpeg'].includes(extname)) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const image = new Image();
                image.src = url;
                image.onload = () => {
                    canvas.height = image.height;
                    canvas.width = image.width;
                    ctx.drawImage(image, 0, 0);
                    extname = extname === '.jpg' ? 'jpeg' : extname.replace('.', '');
                    const dataURL = canvas.toDataURL(`image/${extname}`);
                    callback && callback(dataURL);
                    res(dataURL);
                    image.remove();
                    canvas.remove();
                }
            } else {
                console.warn('Not a jpg/jpeg or png resource!');
                callback && callback(null);
                res(null);
            }
        });
    }

    /**
     * @see ImageUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/ImageUtil.ts
     * 将 Base64 字符转为 cc.Texture2D 资源
     * @param base64 Base64 字符
     */
    static base64ToTexture(base64: string): cc.Texture2D {
        const image = document.createElement('img');
        image.src = base64;
        const texture = new cc.Texture2D();
        texture.initWithElement(image);
        image.remove();
        return texture;
    }

    /**
     * @see ImageUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/ImageUtil.ts
     * 将 Base64 字符转为二进制数据
     * @param base64 Base64 字符
     */
    static base64ToBlob(base64: string): Blob {
        const strings = base64.split(',');
        const type = /image\/\w+|;/.exec(strings[0])[0];
        const data = window.atob(strings[1]);
        const arrayBuffer = new ArrayBuffer(data.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < data.length; i++) {
            uint8Array[i] = data.charCodeAt(i) & 0xff;
        }
        return new Blob([uint8Array], { type: type });
    }


    //查看动态合图
    static showDynamicAtlas() {
        cc.dynamicAtlasManager.showDebug(true)
    }


}