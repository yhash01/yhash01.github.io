const roomId="Y2lzY29zcGFyazovL3VybjpURUFNOnVzLXdlc3QtMl9yL1JPT00vZGRmYzIwODAtMmNiYi0xMWYwLWIwMWQtYjlmYjBmMThkYWU1"
const hostMessage = `お客様が来社しました。受付までお迎えお願いいたします。


Details:
* 会社名: **$email**
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
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d733.7017395965593!2d138.24138020610994!3d36.66417184564897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601d88a0e023e8c7%3A0x7694d118895d2136!2z44Ob44Kv44OI55Sj5qWt77yI5qCq77yJIOacrOekvg!5e0!3m2!1sen!2sjp!4v1746151639124!5m2!1sen!2sjp',

  init() {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 30 * 1000);
    const params = new URLSearchParams(location.search);
    this.mapUrl = params.get('map') || this.mapUrl;
    this.theme = params.get('theme');

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
    this.page = 'home';
    this.reset();
  },

  reset() {
    this.name = '';
    this.email = '';
    this.currentHost = null;
    this.foundHosts = [];
    this.searchStatus = '';
    this.photo = null;
    this.phoneNumber = '';
    clearInterval(this.photoTimer);
  },

  call() {
    const defaultNumber = '47';
    // Get reception pram value from the URL
    const number = new URLSearchParams(location.search).get('reception') || defaultNumber;
    //location.href = `sip:${number}`;

    location.href='sip:webex.beta-gmu01@betantteast.webex.com'

    // My Original starts +++++++++++++++++++++++++++++
    // const token = this.getToken();

    // if (!token) {
    //   return;
    // }
    // sendMessage2(token, roomId="Y2lzY29zcGFyazovL3VybjpURUFNOnVzLXdlc3QtMl9yL1JPT00vZGRmYzIwODAtMmNiYi0xMWYwLWIwMWQtYjlmYjBmMThkYWU1")
    //   .catch(e => {
    //     console.warn(e);
    //     alert('We were not able to send a message to the host at this time.');
    //   });

    // My original Ends  +++++++++++++++++++++++++++++

  },

  get validForm() {
    const emailPattern = /\w+@\w+/;
    if (this.page === 'checkIn') {
      // return this.name.trim().length && this.email.match(emailPattern);
      return this.name.trim().length && this.company.trim().length;
    }
    else if (this.page === 'checkOut') {
      return this.email.match(emailPattern);
    }
    else if (this.page === 'taxi') {
      return this.phoneNumber.length > 3;
    }
    return true;
  },

  checkIn() {
    this.page = 'checkIn';
    this.focus('#name');
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
      .replace('$email', this.email.trim());
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
    const token = 'ZTAwZTE0OTUtMmU5NS00NmY4LWJjM2ItNDg1NTBmZGZlZWU3YzVlNjA3YmQtMzI0_P0A1_845e382f-ade3-49cf-ae92-cf4cdcfd1580';
    return token;
    // return new URLSearchParams(location.search).get('token');
  },

  next() {
    // home > checkIn > findHost > photo > confim > registered
    const { page } = this;

    if (page === 'home') {
      // this.checkIn();
      this.findHost();
    }

    else if (page === 'findHost') {
      this.confirmHost();
    }
    else if (page === 'confirmHost') {
      // this.showPhotoPage();
      this.checkIn();
    }
    else if (page === 'checkIn') {
      // this.findHost();
      this.showPhotoPage();
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
      // this.checkIn();
      this.home();
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


