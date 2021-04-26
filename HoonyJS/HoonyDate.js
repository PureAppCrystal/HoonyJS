/* eslint-disable no-cond-assign */
/* eslint-disable no-extend-native */

/**
 * HoonyDate.js
 * Date 라이브러리
 * 작성자 : HoonyB
 */

/**
 * 오늘날짜 가져오기
 * @param {} frm : 출력형식
 * yyyymmddhhmiss, yyyy-MM-dd, yyyyMMddHHmmss ...
 */
export const getToday = frm => {
  let today = new Date();
  return today.format(frm);
};

/**
 * 특정날짜 가져오기
 * @param {*} date 특정 날짜
 * @param {*} frm  출력 포맷
 */
export const getDate = (date, frm) => {
  date = validateDate(date);
  return date.format(frm);
};

/**
 * 입력받은 String 을 Date로 변경
 * @param {} str : 형식 yyyyMMddHHmmss
 */
export const converStringToDate = str => {
  let arr = new Array(String);
  arr[0] = str.substr(0, 4);
  arr[1] = str.substr(4, 2);
  arr[2] = str.substr(6, 2);
  arr[3] = str.substr(8, 2);
  arr[4] = str.substr(10, 2);
  arr[5] = str.substr(12, 2);

  return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
};

/**
 * 입력받은 데이터가 date 타입인지 아닌지 확인
 * @param {} date
 */
export const validateDate = date => {
  if (Object.prototype.toString.call(date) !== "[object Date]") {
    date = converStringToDate(date);
  }
  return date;
};

/**
 * 두 Date 차이값 구하기
 * @param
 */
export const getDifDates = (date1, date2) => {
  date1 = validateDate(date1);
  date2 = validateDate(date2);
  return date1 >= date2 ? date1 - date2 : date2 - date1;
};

export const getDifSeconds = (date1, date2) => {
  return Math.floor(getDifDates(date1, date2) / 1000);
};

export const getSeconds = date => {
  return Math.floor(date / 1000);
};

export const getMinutes = date => {
  return Math.floor(getSeconds(date) / 60);
};

export const getHours = date => {
  return Math.floor(getMinutes(date) / 60);
};

export const getDays = date => {
  return Math.floor(getHours(date) / 24);
};

export const getWeeks = date => {
  return Math.floor(getDays(date) / 7);
};

export const getYears = date => {
  return Math.floor(getDays(date) / 365);
};

/**
 * 입력받은 초를 텍스트 출력으로 변경
 * 61 -> 1분 1초
 * type: 0 : 1분 1초, 1: 01:01
 * @param {} sec
 */
export const getDurationTextBySec = (seconds, type) => {
  let day;
  let hour = "0";
  let min = "0";
  let sec = seconds;

  if (sec >= 60) {
    min = Math.floor(sec / 60);
    sec = sec % 60;
  }
  if (min >= 60) {
    hour = Math.floor(min / 60);
    min = min % 60;
  }
  if (hour >= 24) {
    day = Math.floor(hour / 24);
    hour = hour % 24;
  }

  if (type === 0) {
    return (
      "" +
      (day > 0 ? day + "일 " : "") +
      (hour > 0 ? hour + "시간 " : "") +
      (min > 0 ? min + "분 " : "") +
      (sec + "초")
    );
  } else {
    // min = Math.floor(seconds / 60);

    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    // if (hour > 0 && min < 10) min = "0" + min;
    // if ((hour > 0 || min > 0) && sec < 10) sec = "0" + sec;

    let result = sec;
    result = min + ":" + sec;
    if (hour > 0) result = hour + ":" + result;
    // if (min > 0 || hour > 0) result = min + ":" + result;
    // if (hour > 0) result = hour + ":" + result;
    return result;
  }
};

/**
 * 입력받은 date(yyyyMMdd) 의 오늘/어제/요일 가져오기
 * 1주일 이내의 데이터만 요일을 표기해준다.
 * @param {} date
 */
export const getDateDesc = date => {
  let desc = null;
  date = validateDate(date.substr(0, 8));
  const difDay = getDays(getDifDates(date, getToday("yyyyMMdd")));

  if (difDay < 1) {
    desc = "오늘";
  } else if (difDay <= 1) {
    desc = "어제";
  } else if (difDay <= 7) {
    desc = date.format("KL");
  } else {
    desc = date.format("yyyy. MO. do.");
  }
  return desc;
};

String.prototype.string = function(len) {
  var s = "",
    i = 0;
  while (i++ < len) {
    s += this;
  }
  return s;
};
String.prototype.zf = function(len) {
  return "0".string(len - this.length) + this;
};
Number.prototype.zf = function(len) {
  return this.toString().zf(len);
};
Date.prototype.format = function(f) {
  if (!this.valueOf()) return " ";
  if (f === undefined) return this;

  var weekKorName = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
  var weekEngName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var d = this;
  let h;

  return f.replace(
    /(yyyy|yy|MM|MO|dd|do|KS|KL|ES|EL|HH|hh|ho|mm|ss|zzz|a\/p)/gi,
    function($1) {
      switch ($1) {
        case "yyyy":
          return d.getFullYear(); // 년 (4자리)
        case "yy":
          return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
        case "MM":
          return (d.getMonth() + 1).zf(2); // 월 (2자리)
        case "MO":
          return d.getMonth() + 1; // 월
        case "dd":
          return d.getDate().zf(2); // 일 (2자리)
        case "do":
          return d.getDate(); // 일
        case "KS":
          return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
        case "KL":
          return weekKorName[d.getDay()]; // 요일 (긴 한글)
        case "ES":
          return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
        case "EL":
          return weekEngName[d.getDay()]; // 요일 (긴 영어)
        case "HH":
          return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
        case "hh":
          return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
        case "ho":
          return (h = d.getHours() % 12) ? h : 12;
        case "mm":
          return d.getMinutes().zf(2); // 분 (2자리)
        case "ss":
          return d.getSeconds().zf(2); // 초 (2자리)
        case "zzz":
          return d.getMilliseconds().zf(3); // 밀리세컨 (3자리)
        case "a/p":
          return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
        default:
          return $1;
      }
    },
  );
};
