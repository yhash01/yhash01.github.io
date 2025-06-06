function setCalledNum(service) {
  const params = new URLSearchParams(location.search);
  calledNum = params.get(service.name) || service.tel;
  return calledNum;
}


function setup() {
  Alpine.store('texts', {
    lang: {
      japanese: "日本語",
      english: "English",
      chinese: "简体中文",
      korean: "한국어",
    },
    welcome: { 
      japanese: "ホクト産業へようこそ",
      english: "Welcome to Hokuto Industory",
      chinese: "欢迎来到 北斗工业",
      korean: "홋토 산업에 오신 것을 환영합니다",
    },
    touchToStart: { 
      japanese: "ここに触れてください",
      english: "Please Touch Here",
      chinese: "触摸这里",
      korean: "여기를 터치해주세요",
    },
    selectOption: { 
      japanese: "本日のご用件について選択してください",
      english: "What can we help you?",
      chinese: "请选择您今天的业务",
      korean: "용건을 선택해 주십시오",
    },
    
  });


  Alpine.store('model', {
    currentPage: 'home', // 'home', 'service'
    // currentPage: 'service', 
    currentLanguage: 'japanese',
    dialNumber: 'AAAAerica.talking@ivr.vc',
    services: [],
    callingScheme: 'sip:',

    

    init() {
      const params = new URLSearchParams(location.search);
      if (params.has('number')) {
        this.dialNumber = params.get('number');
      }

      if (params.has('webexapp')){
        this.callingScheme = 'webextel:'
      }
      
      this.services = [
        { name: 'a', tel: "8101", japanese: '総合受付', english: 'Reception', chinese: '一般接待', korean: '종합접수센터', picture: "ico_eringi.png" },
        { name: 'b', tel: "8102", japanese: '総務部', english: 'GA Dept.', chinese: '总务部', korean: '총무부 접수창구', picture: "ico_hokutokun.png" },
        { name: 'c', tel: "117", japanese: '時報', english: 'Human Resource', chinese: "人事部", korean: '인사부 접수창구', picture: "ico_maitake.png" },
      ];
 
    },
    get page() {
      return this.currentPage;
    },
    set page(nextPage) {
      this.currentPage = nextPage;
    },
    currentLanguage: 'japanese',
    languages: ['japanese','english', 'chinese', 'korean'],
    get language() {
      return this.currentLanguage;
    },
    set language(current) {
      this.currentLanguage = current;
    },
  });

}

document.addEventListener('alpine:init', setup);

