/******************************************************
 * HoonyMedia.js
 * create   : Hoony
 * version  : 1.0.0
 * ****************************************************
 * 수정이력
 * [ 1.0.0 ] 2021-02-05 : 디바이스 정보 조회에서 video 항목추가
 ******************************************************/

// import * as logger from "@/utils/HoonyLogger";

/**
 *
 */
let logger = tempLogger;
export const initLogger = obj => {
  console.log("[ hoonyMediaLogger initiated ]");
  logger = obj;
};

const tempLogger = () => {
  // eslint-disable-next-line no-unused-vars
  const log = (text, data) => {
    console.log(text, data === undefined ? "" : data);
  };
};

let LOCAL_STORAGE_KEY = "hoonyMedia";
let audio;
let audioTimer = null;
let audioContext;
try {
  audio = new Audio();
  audioContext = new AudioContext();
} catch (e) {
  logger.log("[ WARNING ] Audio || AudioContext Init fail ", e);
}

/********************************************************************
 * DTMF
 *******************************************************************/
function Tone(context, freq1, freq2) {
  this.context = context;
  this.status = 0;
  this.freq1 = freq1;
  this.freq2 = freq2;
}

Tone.prototype.setup = function() {
  this.osc1 = audioContext.createOscillator();
  this.osc2 = audioContext.createOscillator();
  this.osc1.frequency.value = this.freq1;
  this.osc2.frequency.value = this.freq2;

  this.gainNode = this.context.createGain();
  this.gainNode.gain.value = 0.25;

  this.filter = this.context.createBiquadFilter();
  this.filter.type = "lowpass";
  //this.filter.frequency = 8000;

  this.osc1.connect(this.gainNode);
  this.osc2.connect(this.gainNode);

  this.gainNode.connect(this.filter);
  this.filter.connect(audioContext.destination);
};

Tone.prototype.start = function() {
  this.setup();
  this.osc1.start(0);
  this.osc2.start(0);
  this.status = 1;
};

Tone.prototype.stop = function() {
  this.osc1.stop(0);
  this.osc2.stop(0);
  this.status = 0;
};

var dtmfFrequencies = {
  "1": { f1: 697, f2: 1209 },
  "2": { f1: 697, f2: 1336 },
  "3": { f1: 697, f2: 1477 },
  "4": { f1: 770, f2: 1209 },
  "5": { f1: 770, f2: 1336 },
  "6": { f1: 770, f2: 1477 },
  "7": { f1: 852, f2: 1209 },
  "8": { f1: 852, f2: 1336 },
  "9": { f1: 852, f2: 1477 },
  "*": { f1: 941, f2: 1209 },
  "0": { f1: 941, f2: 1336 },
  "#": { f1: 941, f2: 1477 },
};

export const playDtmfTone = number => {
  if (number === null) return;
  const code = number.charCodeAt(0);

  if (code >= 48 && code <= 57) {
    const dtmf = new Tone(audioContext, 350, 440);
    const frequencyPair = dtmfFrequencies[number];

    dtmf.freq1 = frequencyPair.f1;
    dtmf.freq2 = frequencyPair.f2;

    if (dtmf.status === 0) {
      dtmf.start();
      setTimeout(function() {
        if (typeof dtmf !== "undefined" && dtmf.status) {
          dtmf.stop();
        }
      }, 100);
    }
  }
};

/********************************************************************
 * Media 관련 LocalStorage
 ********************************************************************/

export const getLSMediaInfo = () => {
  let media = null;
  try {
    media = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    media = media === null ? {} : media;
  } catch (e) {
    logger.log("getLSAudioInfo parsing warnning");
  }
  return media;
};

export const setLSAudioOutput = async deviceId => {
  let media = null;
  try {
    media = getLSMediaInfo();
    // eslint-disable-next-line no-prototype-builtins
    if (!media.hasOwnProperty("audio")) {
      media.audio = {};
    }
    media.audio.output = deviceId;
  } catch (e) {
    logger.log("setLSAudioOutput fail : ", e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(media));
};

export const setLSAudioInput = deviceId => {
  let media = null;
  try {
    media = getLSMediaInfo();
    // eslint-disable-next-line no-prototype-builtins
    if (!media.hasOwnProperty("audio")) {
      media.audio = {};
    }
    media.audio.input = deviceId;
  } catch (e) {
    logger.log("setLSOwmsAudioInput fail : ", e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(media));
};

export const setLSVideoInput = deviceId => {
  let media = null;
  try {
    media = getLSMediaInfo();
    // eslint-disable-next-line no-prototype-builtins
    if (!media.hasOwnProperty("video")) {
      media.video = {};
    }
    media.video.input = deviceId;
  } catch (e) {
    logger.log("setLSVideoInput fail : ", e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(media));
};

/********************************************************************
 * 디바이스
 ********************************************************************/

// 권한 체크
export const checkMediaStatus = async (audio, video) => {
  let returnData = false;
  try {
    const constraints = { audio: audio, video: video };
    await navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
        logger.log("Media permission is ok : ", stream, 2);
        returnData = true;
      })
      .catch(function(err) {
        logger.log("Media permission is fail : ", err, 1);
      });
  } catch (e) {
    logger.log("navigator mediaDevice getUserMedia error : ", e);
  }
  return returnData;
};

// 디바이스 항목 가져오기
export const getDeviceList = async () => {
  return navigator.mediaDevices
    .enumerateDevices()
    .then(gotDevices)
    .catch(deviceHandleError);
};

export const deviceHandleError = error => {
  logger.log("navigator.enumerateDevices error: ", error, 0);
};

export const gotDevices = deviceInfos => {
  let resultDeviceList = [];

  // 세션목록 가져오기
  const media = getLSMediaInfo();
  let audioOutput, audioInput, videoInput;
  let findAudioOutput,
    findAudioInput,
    findVideoInput = false;
  try {
    audioOutput = media.audio.output;
    audioInput = media.audio.input;
    videoInput = media.video.input;
  } catch (e) {
    logger.log("getLSMediaInfo fail : ", e, 1);
  }
  deviceInfos.map(device => {
    // 커뮤니케이션 제외
    if (device.deviceId !== "communications") {
      device.select = false;

      if (device.deviceId === "default") {
        let labelDesc = "-";
        switch (device.kind) {
          case "audiooutput":
            labelDesc = "시스템 기본 스피커";
            break;
          case "audioinput":
            labelDesc = "시스템 기본 마이크";
            break;
          case "videoinput":
            labelDesc = "시스템 기본 카메라";
            break;
          default:
            logger.log("unkown kind : ", device.kind, 1);
        }

        device = new Object({
          deviceId: device.deviceId,
          groupId: device.groupId,
          kind: device.kind,
          label: labelDesc,
        });
      }

      // 일치하는 것 체크
      if (device.kind === "audiooutput" && device.deviceId === audioOutput) {
        findAudioOutput = true;
        device.select = true;
      } else if (
        device.kind === "audioinput" &&
        device.deviceId === audioInput
      ) {
        findAudioInput = true;
        device.select = true;
      } else if (
        device.kind === "videoinput" &&
        device.deviceId === videoInput
      ) {
        findVideoInput = true;
        device.select = true;
      }

      resultDeviceList.push(device);
    }
  });

  resultDeviceList.map(device => {
    if (device.deviceId !== "communications") {
      // 일치하는 게 없을 경우
      if (
        !findAudioOutput &&
        device.kind === "audiooutput" &&
        device.deviceId === "default"
      ) {
        setLSAudioOutput("default");
        device.select = true;
      }
      if (
        !findAudioInput &&
        device.kind === "audioinput" &&
        device.deviceId === "default"
      ) {
        setLSAudioInput("default");
        device.select = true;
      }
      if (!findVideoInput && device.kind === "videoinput") {
        // video 는 하나라고 생각하고 마지막것(첫번째) 를 선택해준다.
        setLSVideoInput(device.deviceId);
        device.select = true;
      }
    }
  });

  return resultDeviceList;
};

/**
 * mp3 재생
 */

export const playMP3Audio = mp3 => {
  try {
    if (!audio.canPlayType("audio/mp3"))
      logger.log("브라우저가 mp3 재생을 지원하지 않습니다.", 1);
    else {
      audio = new Audio(mp3);
      audio.setSinkId(getLSMediaInfo().audio.output);
      audio.play();
      audioTimer = setInterval(() => {
        audio.play();
      }, 23000);
    }
  } catch (e) {
    logger.log("playMP3Audio Exception : ", e);
  }
};

export const stopMP3Audio = () => {
  clearInterval(audioTimer);
  audio.pause();
};
