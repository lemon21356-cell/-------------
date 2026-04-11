// 확장 프로그램 내부의 이미지 실제 주소를 가져와서 HTML 데이터 속성에 저장합니다.
const realUrl = chrome.runtime.getURL('btn_icon.png');
document.documentElement.setAttribute('data-cleaner-icon-url', realUrl);
