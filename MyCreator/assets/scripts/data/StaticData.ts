import AudioControl from "../tools/AudioControl";

export default class StaticData {

    private static _instance: StaticData = null;
    private _soundMute: boolean = false;
    private _musicMute: boolean = false;

    public static getInstace() {
        if (!StaticData._instance) {
            StaticData._instance = new StaticData();
        }
        return StaticData._instance;
    }

    public set soundMute(v: boolean) {
        this._soundMute = v;
        AudioControl.setSoundMute(v);
    }

    public get soundMute(): boolean {
        return this._soundMute;
    }

    public set musicMute(v: boolean) {
        this._musicMute = v;
        AudioControl.setMusicMute(v);
    }

    public get musicMute(): boolean {
        return this._musicMute;
    }
}
