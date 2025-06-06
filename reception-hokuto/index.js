const defaultRoomId="Y2lzY29zcGFyazovL3VybjpURUFNOnVzLXdlc3QtMl9yL1JPT00vZGRmYzIwODAtMmNiYi0xMWYwLWIwMWQtYjlmYjBmMThkYWU1";
const defaultToken = 'ZTAwZTE0OTUtMmU5NS00NmY4LWJjM2ItNDg1NTBmZGZlZWU3YzVlNjA3YmQtMzI0_P0A1_845e382f-ade3-49cf-ae92-cf4cdcfd1580';
const defaultNumber = "8101";
const hostMessage = `
お客様が来社しました。受付までお迎えお願いいたします。

Details:
* 会社名: **$company**
* お名前: **$name**

`;





const dataModel = {
// home > checkIn > findHost > confirmHost > photo > confim > registered | checkOut > checkOutResult
  page: 'home',
  name: '',
  company: '',
  email: '',
  hostSearch: '',
  currentHost: null,
  date: 'October 6, 2022',
  time: '10:35 AM',
  foundHosts: [],
  searchStatus: '',
  photo: null,
  photoTimer: 0,
  photoTime: 0,
  videoStream: null,
  phoneNumber: '',
  taxiNumber: '',
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1164.6801015712374!2d138.24126911484294!3d36.66409278567029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601d88a0e023e8c7%3A0x7694d118895d2136!2z44Ob44Kv44OI55Sj5qWt77yI5qCq77yJIOacrOekvg!5e0!3m2!1sja!2sjp!4v1749101318738!5m2!1sja!2sjp',
  qrVideo: null,
  qrVideoWidth: 0,
  qrVideoHeight: 0,
  qrCanvasContext: null,
  qrContentWidth: 0,
  qrContentHeight: 0,
  bookDateTime: "",
  bookRoom: "",
  guest: '',
  host: '',
  hostExtension: '',
  hostEmail: '',
  callingScheme: 'sip:',


  init() {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 30 * 1000);
    const params = new URLSearchParams(location.search);
    this.mapUrl = params.get('map') || this.mapUrl;
    this.theme = params.get('theme');

    if (params.has('webexapp')){
      this.callingScheme = 'webextel:'
    }


    if (this.theme) {
      // <link href="styles/theme-night.css" rel="stylesheet">
      const head = document.getElementsByTagName("head")[0];
      head.insertAdjacentHTML(
        "beforeend",
        `<link rel="stylesheet" href="styles/theme-cisco.css" />`);
    }
    // quick jump to photo page for dev:
    // this.showPhotoPage();
    // this.name = 'Tore Bjolseth';
    // this.email = 'tbjolset@cisco.com';
    // this.currentHost = { displayName: 'Anna Gjerlaug' };
  },

  home() {
    if(this.page === 'qrCheckIn'){
      this.qrStopCamera();
    }
    this.page = 'home';
    this.reset();
  },

  reset() {
    this.name = '';
    this.company = '';
    this.email = '';
    this.currentHost = null;
    this.foundHosts = [];
    this.searchStatus = '';
    this.photo = null;
    this.phoneNumber = '';
    this.host ='';
    this.guest = '';
    this.hostEmail ='';
    this.hostExtension ='';
    clearInterval(this.photoTimer);
  },

  call() {
    // const defaultNumber = '47';
    // Get reception pram value from the URL
    const number = new URLSearchParams(location.search).get('reception') || defaultNumber;
    //location.href = `sip:${number}`;

    location.href=this.callingScheme + number;

  },

  call2(number) {
    location.href=this.callingScheme + number;

  },

  get validForm() {
    const emailPattern = /\w+@\w+/;
    if (this.page === 'checkIn') {
      // return this.name.trim().length && this.email.match(emailPattern);
      return this.name.trim().length && this.company.trim().length;
    }
    else if (this.page === 'checkOut') {S
      return this.email.match(emailPattern);
    }
    else if (this.page === 'taxi') {
      return this.phoneNumber.length > 3;
    }
    return true;
  },

  qrCheckIn() {
    // document.getElementById('qr-msg').textContent ='';
    this.page = 'qrCheckIn';
    this.focus('#qr-msg');
    document.getElementById('qr-msg').textContent = '受付QRコードをカメラにかざしてください';
    

    this.qrVideo = document.getElementById('myVideo');
    const qrMedia =  navigator.mediaDevices.getUserMedia({ audio: false, video: {width:800, height:500, frameRate:5} })
    .then((stream) => {
        this.qrVideo.srcObject = stream;
        this.qrVideoWidth = this.qrVideo.clientWidth;
        this.qrVideoHeight = this.qrVideo.clientHeight;     
        this.qrVideo.onloadeddata = () => {  // add listener when video frame gets available
          // this.qrVideo.play();  // it works without this line, why is it needed?
          this.qrContentWidth = this.qrVideo.clientWidth;  // moved this line to upper line
          this.qrContentHeight = this.qrVideo.clientHeight; // moved this line to upper line
          canvasUpdate();  
          qrCheckImage();   // check QR code
        }
    }).catch((e) => {
        console.log(e);
    });
    
    // カメラ映像のキャンバス表示
    const qrCanvasCvs = document.getElementById('camera-canvas');
    qrCanvasCvs.width =this.qrVideo.clientWidth;
    qrCanvasCvs.height = this.qrVideo.clientHeight;
    const qrCanvasContext = qrCanvasCvs.getContext('2d',{willReadFrequently: true});


    // QRコードの検出
    const qrRectCvs = document.getElementById('rect-canvas');
    qrRectCvs.width = this.qrVideo.clientWidth;
    qrRectCvs.height = this.qrVideo.clientHeight;
    const qrRectContext =  qrRectCvs.getContext('2d',{willReadFrequently: true});

    const canvasUpdate = () => { 
      qrCanvasCvs.width = this.qrContentWidth;
      qrCanvasCvs.height = this.qrContentHeight;
      qrCanvasContext.drawImage(this.qrVideo, 0, 0, this.qrContentWidth, this.qrContentHeight);
      requestAnimationFrame(canvasUpdate);
    };

    // 四辺形の描画 
    const drawRect = (location) => {
      qrRectCvs.width = this.qrContentWidth;
      qrRectCvs.height = this.qrContentHeight;
      drawLine(location.topLeftCorner, location.topRightCorner);
      drawLine(location.topRightCorner, location.bottomRightCorner);
      drawLine(location.bottomRightCorner, location.bottomLeftCorner);
      drawLine(location.bottomLeftCorner, location.topLeftCorner)
    };

    // 線の描画
    const drawLine = (begin, end) => {
      qrRectContext.lineWidth = 4;
      qrRectContext.strokeStyle = "#F00";
      qrRectContext.beginPath();
      qrRectContext.moveTo(begin.x, begin.y);
      qrRectContext.lineTo(end.x, end.y);
      qrRectContext.stroke();
    };


    const qrCheckImage = () => {
      // imageDataを作る
      const imageData = qrCanvasContext.getImageData(0, 0, this.qrContentWidth, this.qrContentHeight);
      
      // jsQRに渡して QR Code 情報取得
      console.log("imageData=", imageData);
   

      const code = jsQR(imageData.data, this.qrContentWidth, this.qrContentHeight);
      

      // 検出結果に合わせて処理を実施
      if (code) {
        console.log("QRcodeが見つかりました", code);
        drawRect(code.location);
        document.getElementById('qr-msg').textContent = `QRコード: ${code.data}`;
        // if it is the QR code issued by us
   
        // {"issuer": "NTTEast", "bookDateTime": "2025-05-25T13:35", "bookRoom": "応接室１", "guest": "お客様会社名:お客様A", "host": "ビジネス開発本部:東太郎"}
        // const data= '{"issuer": "NTTEast", "bookDateTime": "2025-05-25T13:35", "bookRoom": "応接室１", "guest": "お客様会社名:お客様A", "host": "ビジネス開発本部 電電太郎"}';
        // const data= '{"issuer":"NTTEast", "bookDateTime": "2025-05-26T09:01:00+09:00", "bookRoom": "応接室１", "guest": "株式会社DX 是星衣", "host": "ビジネス開発本部 電電未来", "hostExtension": "8101", "hostEmail": "webex.beta-gm+u01@east.ntt.co.jp"}';
        try {
          // const data =JSON.parse(code.data);
          const data = code.data;

          console.log(data);
          
          ret=this.qrCheckData(data);
          console.log("reason: ", ret.reason);
          if(ret.result == true) {
            this.qrStopCamera();

            // send message to the host
            msg="## お客様来社通知\n**" + this.guest + "** 様が到着されました。\n**" + this.bookRoom + "** にてお待ちです。";
            const token=this.getToken();

          
            sendMessage(token, this.hostEmail, msg, this.photo)
            .catch(e => {
              console.warn(e);
              alert('We were not able to send a message to the host at this time.');
            });
            
            const message="### お客様来社通知" + "\n * お客様名: " + this.guest + "\n * 部屋: " + this.bookRoom + "\n * 担当: " + this.host + "\n";

            const roomId = this.getRoomId();
            sendMessageRoom(token, roomId, message)
            .catch(e => {
              console.warn(e);
              alert('We were not able to send a message to the host at this time.');
            });

            this.page = "qrConfirm";

          } else {
            document.getElementById('qr-msg').textContent = ret.reason;
          }
        } catch (e) {
          console.log("JSON Parse error.", e)
        }


      } else {
        console.log("QRcodeが見つかりません…", code);
        qrRectContext.clearRect(0, 0, this.qrContentWidth, this.qrContentHeight);
        document.getElementById('qr-msg').textContent = '受付QRコードをカメラにかざしてください';
      }
      if(this.page === 'qrCheckIn'){
        setTimeout(()=>{ qrCheckImage()}, 200);
      }

    };
  },

  mystub () {

    let aa = {result:false, reason: "test"};

    ret = qrCheckData(data);
    console.log("reason: ", ret.reason);
  },

  qrCheckData (data) {
    let result=false;
    let reason=""
    try {
      const objData=JSON.parse(data);

      if(objData == null) {  // Invalid JSON data
        // console.log("objData=null");
        result=false;
        reason="弊社のデータではありません"
        return {result, reason};

      } else {  // valid JSON data is fine
        // console.log("objData=", objData);
        // check issuer
        if (objData.issuer != "NTTEast") { // check issuer
          reason = "弊社発行のQRコードではありません"
          return {result, reason};
        }

        // check Date and Time
        const date = new Date(objData.bookDateTime)
        if (date == "Invalid Date") {
          reason = "Date: 正しいフォーマットではありません"
          return {result, reason};
        } else { // Date format is fine
          // Check the date is not obsolete
          const today = new Date(Date.now()) 
          today.setHours(hours=0, min=0, sec=0);  // 当日以降の予約は許可するために今日の時刻は00:00とする
          // console.log("getDate()= ", date.getDate(), date.toISOString(), today.toISOString() );
          if(date < today) {
            reason = "すでに予約日を過ぎています"
            return {result, reason};
          }
        }

        // check bookRoom field
        if (objData.bookRoom == null) {
          reason = "bookRoom:  正しいフォーマットではありません";
          return {result, reason};
        }

        // check guest field
        if (objData.guest == null) {
          reason = "Guest:  正しいフォーマットではありません";
          return {result, reason};
        }


        // populate data
        this.bookDateTime = objData.bookDateTime;
        this.bookRoom = objData.bookRoom;
        this.guest = objData.guest;
        this.host=objData.host;
        this.hostExtension = objData.hostExtension;
        this.hostEmail = objData.hostEmail;
        console.log("guest: ", this.guest);

      
      }
    } catch (e)  {
      // console.log("Not Valid Data.", e);
      result=false;
      reason="Not Valid Data. 弊社のQRコードではありません。"
      return {result, reason};    
      // return ({"false", "Not Valid Data."});

    }
    result = true;
    reason = "Success";
    return {result, reason};
  },


  qrStopCamera() {
    if (this.qrVideo.srcObject) {
      this.qrVideo.srcObject.getTracks().forEach(track => {
        track.stop();
      });
    }
  },


  focus(id) {
    // need to wait for DOM to be updated
    setTimeout(() => {
      const firstInput = document.querySelector(id);
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);

  },

  findHost() {
    this.page = 'findHost';
    this.focus('#host');
  },

  register() {
    this.page = 'registered';
    const msg = hostMessage
      .replace('$name', this.name.trim())
      .replace('$company', this.company.trim());
    if (!this.currentHost) {
      return;
    }

    const email = this.currentHost.emails[0];
    const token = this.getToken();

    if (!token) {
      return;
    }
    sendMessage(token, email, msg, this.photo)
      .catch(e => {
        console.warn(e);
        alert('We were not able to send a message to the host at this time.');
      });
    

    const message="### お客様来社通知" + "\n * お客様名: " + this.guest + "\n * 部屋: " + this.bookRoom + "\n * 担当: " + this.host + "\n";

    const roomId = this.getRoomId();
    if (!roomId){
      return;
    }
    sendMessageRoom(token, roomId, message)
    .catch(e => {
      console.warn(e);
      alert('We were not able to send a message to the host at this time.');
    });

   },

  selectHost(host) {
    this.currentHost = host;
    this.hostSearch = '';
    this.searchStatus = '';
    this.foundHosts = [];
    this.next();
  },

  getToken() {
    // TODO perhaps use localStorage intead?  
     
    token = new URLSearchParams(location.search).get('token') || defaultToken;
    console.log("token=", token);
    return token;
    // return new URLSearchParams(location.search).get('token');
  },

  getRoomId() {
    // TODO perhaps use localStorage intead?  
     
    roomId = new URLSearchParams(location.search).get('roomId') || defaultRoomId;
    console.log("roomId=", roomId);
    return roomId;
    // return new URLSearchParams(location.search).get('token');
  },

  next() {
    // home > checkIn > findHost > photo > confim > registered
    const { page } = this;

    if (page === 'home') {
      this.checkIn();
      // this.findHost();   

      //  this.showPhotoPage(); 
    } 
    else if (page === 'checkIn') {
      // this.findHost();
      this.findHost();
    }

    else if (page === 'findHost') {
      this.confirmHost();
    }
    else if (page === 'confirmHost') {
      this.showPhotoPage();
      // this.checkIn();
    }
    else if (page === 'photo') {
      this.showConfirmation();
      // this.checkIn();
    }

    else if (page === 'confirm') {
      this.register();
    }

    else if (page === 'checkOut') {
      this.page = 'checkOutResult';
    }
    else if (page === 'taxi') {
      this.taxiNumber = Math.ceil(Math.random() * 10000);
      this.page = 'taxiConfirmed';
    }

    else {
      console.error('unknown next page');
    }
  },

  back() {
    // home > checkIn > findHost > photo > confim > registered | checkOut
    const { page } = this;
    if (page === 'checkIn') {
      this.home();
    }
    else if (page === 'findHost') {
      this.checkIn();
      // this.home();
    }
    else if (page === 'confirmHost') {
      this.findHost();
    }
    else if (page === 'photo') {
      this.confirmHost();
    }
    else if (page === 'confirm') {
      this.showPhotoPage();
    }
    else {
      console.error('unknown previous page');
    }

  },

  checkIn() {
    this.page = 'checkIn';
  },

  showConfirmation() {
    this.stopCamera();
    this.page = 'confirm';
  },

  checkout() {
    this.page = 'checkOutResult';
  },

  async showPhotoPage() {
    this.page = 'photo';
    try {
      if (navigator.mediaDevices.getUserMedia) {
        this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.querySelector('.webcam');
        video.srcObject = this.videoStream;
      }
    }
    catch(e) {
      console.error('not able to get video', e);
    }
  },

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  },

  takePhotoCountdown() {
    this.photo = null;
    document.querySelector('.photo-flash').classList.remove('blink');
    clearInterval(this.photoTimer);
    this.photoTime = 3;
    this.photoTimer = setInterval(() => {
      this.photoTime -= 1;
      if (this.photoTime < 1) {
        clearInterval(this.photoTimer);
        this.takePhoto();
      }
    }, 1000);
  },

  takePhoto() {
    // user has navigated away, skip
    if (this.page !== 'photo') {
      return;
    }

    document.querySelector('#shutter-sound').play();
    document.querySelector('.photo-flash').classList.add('blink');

    const w = 600;
    const h = 337;
    const canvas = document.querySelector('.photo');
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);

    const video = document.querySelector('.webcam');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 600, 337);
    // this.photo = canvas.toDataURL('image/jpeg');

    const format = 'jpeg';
    this.photo = canvas.toBlob(photo => {
      this.photo = new File([photo], this.name + '.' + format, { type: "image/" + format, });
    }, 'image/' + format);

    // to compress for jpeg for webex cards, look at:
    // https://github.com/jpeg-js/jpeg-js/blob/master/lib/encoder.js
  },

  searchHost() {
    const word = this.hostSearch.trim();
    const token = this.getToken();



    if (word.length > 0) {
      this.searchStatus = '検索中...';
      searchPerson(word, token, list => {
        this.foundHosts = list;
        this.searchStatus= '結果: ' + list.length + '件';
      });
    }
    else {
      this.foundHosts = [];
      this.searchStatus = '';
    }
  },

  confirmHost() {
    this.page = 'confirmHost';
  },

  getAvatar(person) {
    const { avatar } = person || {};
    return avatar
      ? { backgroundImage: `url(${avatar.replace('~1600', '~110')})` }
      : null;
  },

  checkOut() {
    this.page = 'checkOut';
  },

  updateTimeAndDate() {
    const now = new Date();
    this.date = now.format('mmmm d, yyyy');
    this.time = now.format('HH:MM');
  },

  // create img data url from blob
  photoSrc() {
    if (!this.photo) return;
    const url = window.URL.createObjectURL(this.photo);
    console.log('created', url);
    return url;
  }
};


