import StaticData from "../data/StaticData";

const { ccclass, property } = cc._decorator;

const AudioType = cc.Enum({
    SOUND: 0,
    MUSIC: 1
})

@ccclass
export default class AudioSourceEx extends cc.AudioSource {

    @property({ type: AudioType })
    audioType = AudioType.MUSIC;

    private _orginVolume: number = 0;

    onLoad() {
        super.onLoad();
        this._orginVolume = this.volume;
    }

    onEnable() {
        super.onEnable();
        let b1 = this.audioType == AudioType.MUSIC && StaticData.getInstace().musicMute;
        let b2 = this.audioType == AudioType.SOUND && StaticData.getInstace().soundMute;
        this.setMute(b1 || b2);
    }

    setMute(mute: boolean) {
        this.volume = mute ? 0 : this._orginVolume;
    }
}
