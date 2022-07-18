import pkg from '@zoomus/websdk';

const { ZoomMtg } = pkg;


const SDK_KEY = 'igplR2KO3i3bUNwkeqxeUl5VrPRAu9C7uitc';
const SDK_SECRET = '6jKPgNnZZWPEP7ypcZ72DEeqwmj2fE0CNRe3';

var meetingConfig = {
  mn: 86555323602,
  name: 'abc',
  pwd: "066787",
  email: '',
  role: 0,
  lang: 'English',
  signature: '',
  china: 0
};

const signature = ZoomMtg.generateSDKSignature({
  meetingNumber: meetingConfig.mn,
  sdkKey: SDK_KEY,
  sdkSecret: SDK_SECRET,
  role: 0,
  success(res) {
    console.log('here, in success function');
    console.log(res.result);
    meetingConfig.signature = res.result;
    meetingConfig.sdkKey = SDK_KEY;
  }
});

ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

function beginJoin() {
  ZoomMtg.init({
    leaveUrl: 'www.google.com',
    disablePreview: true, // default false
    externalLinkPage: './externalLinkPage.html',

    success() {
      ZoomMtg.i18n.load(meetingConfig.lang);
      ZoomMtg.i18n.reload(meetingConfig.lang);
      ZoomMtg.join({
        meetingNumber: meetingConfig.mn,
        userName: meetingConfig.name,
        signature,
        sdkKey: SDK_KEY,
        passWord: meetingConfig.pwd,
        success(res) {
          console.log('join meeting success');
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

  // ZoomMtg.inMeetingServiceListener('onUserJoin', (data) => {
  //   console.log('inMeetingServiceListener onUserJoin', data);
  // });
  //
  // ZoomMtg.inMeetingServiceListener('onUserLeave', (data) => {
  //   console.log('inMeetingServiceListener onUserLeave', data);
  // });
  //
  // ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', (data) => {
  //   console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
  // });
  //
  // ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data) => {
  //   console.log('inMeetingServiceListener onMeetingStatus', data);
  // });
}

x = beginJoin();
