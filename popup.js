document.getElementById('cleanBtn').addEventListener('click', async () => {
  // 현재 활성화된 탭 찾기
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("playentry.org")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } else {
    alert("엔트리 만들기 화면에서 실행해주세요!");
  }
});
