import pkg from '@zoomus/websdk';

const { ZoomMtg } = pkg;

var testTool = {
  b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(`0x${p1}`)
      )
    );
  },
  b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
  },
  isMobileDevice() {
    return (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    );
  },
  getMeetingConfigCustom() {
    return {
      mn: 82069915848,
      name: testTool.b64EncodeUnicode('def'),
      pwd: '181078',
      email: '',
      role: 0,
      lang: 'English',
      signature: '',
      china: 0
    };
  },
  getMeetingConfig() {
    return {
      mn: parseInt(document.getElementById('meeting_number').value),
      name: testTool.b64EncodeUnicode(
        document.getElementById('display_name').value
      ),
      pwd: document.getElementById('meeting_pwd').value,
      role: parseInt(document.getElementById('meeting_role').value, 10),
      email: testTool.b64EncodeUnicode(
        document.getElementById('meeting_email').value
      ),
      lang: document.getElementById('meeting_lang').value,
      signature: '',
      china: document.getElementById('meeting_china').value
    };
  },
  createZoomNode(id, url) {
    const zoomIframe = document.createElement('iframe');
    zoomIframe.id = id;
    zoomIframe.sandbox =
      'allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
    zoomIframe.allow = 'microphone; camera; fullscreen;';
    zoomIframe.src = url;
    zoomIframe.style = '';
    if (typeof document.body.append === 'function') {
      document.body.append(zoomIframe);
    } else {
      document.body.appendChild(zoomIframe);
    }
  },
  getCurrentDomain() {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
  },
  parseQuery() {
    return (function () {
      const { href } = window.location;
      const queryString = href.substr(href.indexOf('?'));
      const query = {};
      const pairs = (
        queryString[0] === '?' ? queryString.substr(1) : queryString
      ).split('&');
      for (let i = 0; i < pairs.length; i += 1) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    })();
  },
  serialize(obj) {
    // eslint-disable-next-line no-shadow
    const keyOrderArr = [
      'name',
      'mn',
      'email',
      'pwd',
      'role',
      'lang',
      'signature',
      'china'
    ];

    Array.intersect = function () {
      const result = new Array();
      const obj = {};
      for (let i = 0; i < arguments.length; i++) {
        for (let j = 0; j < arguments[i].length; j++) {
          const str = arguments[i][j];
          if (!obj[str]) {
            obj[str] = 1;
          } else {
            obj[str]++;
            if (obj[str] == arguments.length) {
              result.push(str);
            }
          }
        }
      }
      return result;
    };

    if (!Array.prototype.includes) {
      Object.defineProperty(Array.prototype, 'includes', {
        enumerable: false,
        value(obj) {
          const newArr = this.filter((el) => el === obj);
          return newArr.length > 0;
        }
      });
    }

    const tmpInterArr = Array.intersect(keyOrderArr, Object.keys(obj));
    const sortedObj = [];
    keyOrderArr.forEach((key) => {
      if (tmpInterArr.includes(key)) {
        sortedObj.push([key, obj[key]]);
      }
    });
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        if (!tmpInterArr.includes(key)) {
          sortedObj.push([key, obj[key]]);
        }
      });
    const tmpSortResult = (function (sortedObj) {
      const str = [];
      for (const p in sortedObj) {
        if (typeof sortedObj[p][1] !== 'undefined') {
          str.push(
            `${encodeURIComponent(sortedObj[p][0])}=${encodeURIComponent(
              sortedObj[p][1]
            )}`
          );
        }
      }
      return str.join('&');
    })(sortedObj);
    return tmpSortResult;
  },
  detectOS() {
    const sUserAgent = navigator.userAgent;
    const isWin =
      navigator.platform === 'Win32' || navigator.platform === 'Windows';
    const isMac =
      navigator.platform === 'Mac68K' ||
      navigator.platform === 'MacPPC' ||
      navigator.platform === 'Macintosh' ||
      navigator.platform === 'MacIntel';
    if (isMac) return 'Mac';
    const isUnix = navigator.platform === 'X11' && !isWin && !isMac;
    if (isUnix) return 'Unix';
    const isLinux = String(navigator.platform).indexOf('Linux') > -1;
    if (isLinux) return 'Linux';
    if (isWin) {
      const isWin2K =
        sUserAgent.indexOf('Windows NT 5.0') > -1 ||
        sUserAgent.indexOf('Windows 2000') > -1;
      if (isWin2K) return 'Win2000';
      const isWinXP =
        sUserAgent.indexOf('Windows NT 5.1') > -1 ||
        sUserAgent.indexOf('Windows XP') > -1;
      if (isWinXP) return 'WinXP';
      const isWin2003 =
        sUserAgent.indexOf('Windows NT 5.2') > -1 ||
        sUserAgent.indexOf('Windows 2003') > -1;
      if (isWin2003) return 'Win2003';
      const isWinVista =
        sUserAgent.indexOf('Windows NT 6.0') > -1 ||
        sUserAgent.indexOf('Windows Vista') > -1;
      if (isWinVista) return 'WinVista';
      const isWin7 =
        sUserAgent.indexOf('Windows NT 6.1') > -1 ||
        sUserAgent.indexOf('Windows 7') > -1;
      if (isWin7) return 'Win7';
      const isWin10 =
        sUserAgent.indexOf('Windows NT 10') > -1 ||
        sUserAgent.indexOf('Windows 10') > -1;
      if (isWin10) return 'Win10';
    }
    return 'other';
  },
  detectIE() {
    const ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    const msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return `IE${parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)}`;
    }

    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      const rv = ua.indexOf('rv:');
      return `IE${parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)}`;
    }

    const edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return `Edge${parseInt(
        ua.substring(edge + 5, ua.indexOf('.', edge)),
        10
      )}`;
    }

    // other browser
    return false;
  },
  getBrowserInfo() {
    const agent = navigator.userAgent.toLowerCase();
    const regStr_ff = /firefox\/[\d.]+/gi;
    const regStr_chrome = /chrome\/[\d.]+/gi;
    const regStrChrome2 = /ipad; cpu os (\d+_\d+)/gi;
    const regStr_saf = /version\/[\d.]+/gi;
    const regStr_saf2 = /safari\/[\d.]+/gi;
    const regStr_edg = /edg\/[\d.]+/gi;

    // firefox
    if (agent.indexOf('firefox') > 0) {
      return agent.match(regStr_ff);
    }

    // Safari
    if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
      let tmpInfo = 'safari/unknow';
      let tmpInfo2;
      tmpInfo = agent.match(regStr_saf);
      tmpInfo2 = agent.match(regStr_saf2);
      if (tmpInfo) {
        tmpInfo = tmpInfo.toString().replace('version', 'safari');
      }
      if (tmpInfo2) {
        tmpInfo = tmpInfo2.toString().replace('version', 'safari');
      }
      return tmpInfo;
    }

    // IE / Eege
    const tmpIsIE = testTool.detectIE();
    if (tmpIsIE) {
      return tmpIsIE;
    }
    // Chrome
    if (agent.indexOf('chrome') > 0) {
      return agent.match(regStr_chrome);
    }

    return 'other';
  },
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  },
  extractHostname(url) {
    let hostname;
    if (url.indexOf('//') > -1) {
      hostname = url.split('/')[2];
    } else {
      hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
  },
  getDomainName(hostName) {
    return hostName.substring(
      hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
    );
  },
  setCookie(cname, cvalue) {
    const exdays = 1;
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  },
  getCookie(cname) {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  },
  deleteAllCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

const tmpArgs = testTool.parseQuery();
const meetingConfig = {
  sdkKey: tmpArgs.sdkKey,
  meetingNumber: tmpArgs.mn,
  userName: (function () {
    if (tmpArgs.name) {
      try {
        return testTool.b64DecodeUnicode(tmpArgs.name);
      } catch (e) {
        return tmpArgs.name;
      }
    }
    return `CDN#${
      tmpArgs.version
    }#${testTool.detectOS()}#${testTool.getBrowserInfo()}`;
  })(),
  passWord: tmpArgs.pwd,
  leaveUrl: '/index.html',
  role: parseInt(tmpArgs.role, 10),
  userEmail: (function () {
    try {
      return testTool.b64DecodeUnicode(tmpArgs.email);
    } catch (e) {
      return tmpArgs.email;
    }
  })(),
  lang: tmpArgs.lang,
  signature: tmpArgs.signature || '',
  china: tmpArgs.china === '1'
};

console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

export function beginJoin(signature) {
  ZoomMtg.init({
    leaveUrl: meetingConfig.leaveUrl,
    disableCORP: !window.crossOriginIsolated, // default true
    disablePreview: true, // default false
    externalLinkPage: './externalLinkPage.html',

    success() {
      console.log(meetingConfig);
      console.log('signature', signature);
      ZoomMtg.i18n.load(meetingConfig.lang);
      ZoomMtg.i18n.reload(meetingConfig.lang);
      ZoomMtg.join({
        meetingNumber: meetingConfig.meetingNumber,
        userName: meetingConfig.userName,
        signature,
        sdkKey: meetingConfig.sdkKey,
        userEmail: meetingConfig.userEmail,
        passWord: meetingConfig.passWord,
        success(res) {
          console.log('join meeting success');
          console.log('get attendeelist');
          ZoomMtg.getAttendeeslist({});
          ZoomMtg.getCurrentUser({
            success(res) {
              console.log('success getCurrentUser', res.result.currentUser);
            }
          });
        },
        error(res) {
          console.log(res);
        }
      });
    },
    error(res) {
      console.log(res);
    }
  });

  ZoomMtg.inMeetingServiceListener('onUserJoin', (data) => {
    console.log('inMeetingServiceListener onUserJoin', data);
  });

  ZoomMtg.inMeetingServiceListener('onUserLeave', (data) => {
    console.log('inMeetingServiceListener onUserLeave', data);
  });

  ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', (data) => {
    console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
  });

  ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data) => {
    console.log('inMeetingServiceListener onMeetingStatus', data);
  });
}

ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

const SDK_KEY = 'igplR2KO3i3bUNwkeqxeUl5VrPRAu9C7uitc';
const SDK_SECRET = '6jKPgNnZZWPEP7ypcZ72DEeqwmj2fE0CNRe3';

function joinMeeting(e) {
  // e.preventDefault();

  const meetingConfig = testTool.getMeetingConfigCustom();
  if (!meetingConfig.mn || !meetingConfig.name) {
    // eslint-disable-next-line no-undef
    alert('Meeting number or username is empty');
    return false;
  }
  testTool.setCookie('meeting_number', meetingConfig.mn);
  testTool.setCookie('meeting_pwd', meetingConfig.pwd);

  const signature = ZoomMtg.generateSDKSignature({
    meetingNumber: meetingConfig.mn,
    sdkKey: SDK_KEY,
    sdkSecret: SDK_SECRET,
    role: meetingConfig.role,
    success(res) {
      console.log('here, in success function');
      console.log(res.result);
      meetingConfig.signature = res.result;
      meetingConfig.sdkKey = SDK_KEY;
    }
  });
  beginJoin(signature);
  return 'lol';
}

joinMeeting('');
