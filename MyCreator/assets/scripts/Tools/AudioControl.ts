import AudioSourceEx from "./AudioSourceEx";

const { ccclass, property } = cc._decorator;

const AudioType = cc.Enum({
    SOUND: 0,
    MUSIC: 1
})

@ccclass
export default class AudioControl {

    public static setMusicMute(mute: boolean) {
        let acList = cc.director.getScene().getComponentsInChildren(AudioSourceEx);
        for (let i in acList) {
            acList[i].audioType == AudioType.MUSIC && acList[i].setMute(mute);
        }
        cc.audioEngine.setMusicVolume(mute ? 0 : 1);
    }

    public static setSoundMute(mute: boolean) {
        let acList = cc.director.getScene().getComponentsInChildren(AudioSourceEx);
        for (let i in acList) {
            acList[i].audioType == AudioType.SOUND && acList[i].setMute(mute);
        }
        cc.audioEngine.setEffectsVolume(mute ? 0 : 1);
    }
}
