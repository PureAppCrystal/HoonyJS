/******************************************************
 * HoonyLogger.js
 * create   : Hoony
 * version  : 1.0.1
 * ****************************************************
 * 수정이력
 * [ 1.0.0 ] 2021-02-05 : 초기화 함수 추가, Store 기능 추가
 * [ 1.0.1 ] 2021-02-08 : error 함수 추가
 ******************************************************/
const VERSION = "1.0.0";
const MAX_LOG_LEVEL = 5;

// basic
let CONSOLE_DEBUG_MODE = false;
let DEBUG_LEVEL = MAX_LOG_LEVEL;
let DEBUG_LEVEL_SHOW = false;
let TIME_LOG = false;
let LOG_CALLBACK = null;

// store
const STORE_TYPE_LIST = {
  VUE: "VUE",
  REACT: "REACT",
};
let STORE_TYPE = STORE_TYPE_LIST.VUE; // REACT/VUE
let STORE_DEBUG_MODE = false;
let STORE_FUNCTION = null;
let STORE_FUNCTION_NAME = null;
let STORE_CLEAR_FUNCTION = null;

// 초기화
export const initHoonyLogger = (
  consoleDebugMode,
  debugLovel,
  debugLevelShow,
  timeLog,
  callBack,
) => {
  console.log("[ HoonyLogger Initiated ]");
  CONSOLE_DEBUG_MODE = consoleDebugMode || false;
  DEBUG_LEVEL = debugLovel || MAX_LOG_LEVEL;
  DEBUG_LEVEL_SHOW = debugLevelShow || false;
  TIME_LOG = timeLog || false;
  LOG_CALLBACK = callBack || function() {};
};

export const initHoonyLoggerStore = (
  storeType,
  debugMode,
  storeFunction,
  storeFunctionName,
  clearFunction,
) => {
  console.log("[ HoonyLoggerStore Initiated ]");
  if (Object.keys(STORE_TYPE_LIST).includes(storeType)) {
    STORE_TYPE = storeType;
    STORE_DEBUG_MODE = debugMode;
    if (STORE_TYPE === STORE_TYPE_LIST.VUE) {
      STORE_FUNCTION = storeFunction;
      STORE_FUNCTION_NAME = storeFunctionName;
      STORE_CLEAR_FUNCTION = clearFunction;
    }
  }
};

export const getLoggerVersion = () => {
  return VERSION;
};

export const setConsoleDebugMode = mode => {
  CONSOLE_DEBUG_MODE = mode;
};

export const setDebugLevel = level => {
  DEBUG_LEVEL = level;
};

export const setDebugTimeMode = mode => {
  TIME_LOG = mode;
};

// logStyle
const STYLE = {
  basic: "background: #222; color: white; font-weight: 600;",
  error: "background: red; color: white; font-weight: 600;",
};

// 실질적 로그 기능
const write = (msg, obj, level, type) => {
  /*
    //console.log("test");
    //console.log("test", data);
    //console.log('test", 35);
    //conslle.log("test", 2)
    //console.log("test",30, 1);
    */
  if (type === undefined && typeof level === "string") {
    type = level;
  }

  // obj, level 판단
  // obj 가 넘버인 경우, 로그데이터가 우선이니, obj 그대로 찍고 레벨은 5로 설정
  if (level === undefined) {
    level = MAX_LOG_LEVEL;
  }

  obj = obj === undefined ? "" : obj;

  // 로그 부가내용설정
  const dateTime = TIME_LOG ? getDateTime() : "";
  let debugLevelDesc = "";
  let style = STYLE.basic;
  if (DEBUG_LEVEL_SHOW) {
    switch (level) {
      case 0:
        debugLevelDesc = "[ERROR] ";
        style = STYLE.error;
        break;
      case 1:
        debugLevelDesc = "[WARNING] ";
        break;
      case 2:
        debugLevelDesc = "[INFO] ";
        break;
      case 3:
        debugLevelDesc = "[DEBUG] ";
        break;
      case 4:
        debugLevelDesc = "[LOG] ";
        break;
      case 5:
        debugLevelDesc = "[DEV] ";
        break;
      default:
        "[" + level + "]";
    }
  }

  // type에 따른 로그 기록
  let text = "%c " + dateTime + debugLevelDesc + msg;
  if (DEBUG_LEVEL >= level && CONSOLE_DEBUG_MODE) {
    switch (type) {
      case "LOG":
        console.log(text, style, obj);
        break;
      case "GROUP":
        console.group(text, style, obj);
        break;
      case "GROUP_COLLAPSED":
        console.groupCollapsed(text, style, obj);
        break;
      case "GROUP_END":
        console.groupEnd(text, style, obj);
        break;
      case "WARN":
        console.warn(text, style, obj);
        break;
      case "ERROR":
        console.error(text, style, obj);
        break;
      default:
        console.warn("unkownType : ", type);
    }
  }

  // store 저장에 따른 기록
  if (STORE_DEBUG_MODE) {
    text = text + objectToString(obj);
    if (STORE_TYPE === "VUE") {
      STORE_FUNCTION.commit(STORE_FUNCTION_NAME, text);
    }
  }

  // 콜백
  LOG_CALLBACK();
};

export const log = (msg, obj, level) => {
  write(msg, obj, level, "LOG");
};

export const error = (msg, obj, level) => {
  write(msg, obj, level, "ERROR");
};

export const warn = (msg, obj, level) => {
  write(msg, obj, level, "WARN");
};

export const group = (msg, obj, level) => {
  write(msg, obj, level, "GROUP");
};

export const groupCollapssed = (msg, obj, level) => {
  write(msg, obj, level, "GROUP_COLLAPSED");
};

export const groupEnd = (msg, obj, level) => {
  write(msg, obj, level, "GROUP_END");
};

export const clear = () => {
  console.clear();

  if (STORE_DEBUG_MODE) {
    if (STORE_TYPE === "VUE") {
      STORE_FUNCTION.commit(STORE_CLEAR_FUNCTION);
    }
  }
};

/**
 * 기타
 */
const getDateTime = () => {
  const date = new Date();
  const hours = date.getHours();
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let seconds = date.getSeconds();
  seconds = seconds < 10 ? "0" + seconds : seconds;
  let mili = date.getMilliseconds();
  var strTime = hours + ":" + minutes + ":" + seconds + " " + mili;
  return (
    "[" +
    date.getFullYear() +
    "-" +
    date.getMonth() +
    1 +
    "-" +
    date.getDate() +
    " " +
    strTime +
    "]"
  );
};

export const objectToString = data => {
  let cache = [];
  // 클래스 파일은 변환되지 않고 {} 로 반환된다
  return typeof data === "string"
    ? data
    : JSON.stringify(data, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (cache.includes(value)) return;
          cache.push(value);
        }
        return value;
      }) || "";
};
