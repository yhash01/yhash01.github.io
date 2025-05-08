
function setup() {

  Alpine.store('model', {
    // currentPage: 'home', // 'home', 'service'
    currentPage: 'service', 
    currentLanguage: 'english',
    dialNumber: 'AAAAerica.talking@ivr.vc',
    services: [],

    init() {
      const params = new URLSearchParams(location.search);
      if (params.has('number')) {
        this.dialNumber = params.get('number');
      }
      this.services = [
        { url: "sip:21", name: '受付', etc: "teset" },
        { url: "sip:22", name: 'Advice', etc: "aaa" },
        { url: "sip:23", name: 'Credit', etc: "" },
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

