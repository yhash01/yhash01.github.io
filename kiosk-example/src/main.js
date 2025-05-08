
function setup() {

  Alpine.store('model', {
    currentPage: 'home', // 'home', 'service'
    // currentPage: 'service', 
    currentLanguage: 'english',
    dialNumber: 'AAAAerica.talking@ivr.vc',
    services: [],

    init() {
      const params = new URLSearchParams(location.search);
      if (params.has('number')) {
        this.dialNumber = params.get('number');
      }
      this.services = [
        { url: "sip:50", name: '総合受付', etc: "teset", picture: "avatar1.jpg" },
        { url: "sip:94", name: '総務部', etc: "aaa", picture: "avatar2.jpg" },
        { url: "sip:95", name: '人事部', etc: "", picture: "ahauge.png" },
      ];
    },
    get page() {
      return this.currentPage;
    },
    set page(nextPage) {
      this.currentPage = nextPage;
    },
    currentLanguage: 'english',
    languages: ['english', 'japanese'],
    get language() {
      return this.currentLanguage;
    },
    set language(current) {
      this.currentLanguage = current;
    },
  });

}

document.addEventListener('alpine:init', setup);

