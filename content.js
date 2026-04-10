/**
 * 1. 블록 삭제 로직
 */
function cleanBlocks() {
  if (typeof Entry === 'undefined' || !Entry.getMainWS()) return;
  
  const board = Entry.getMainWS().board;
  const threads = board.code.getThreads();
  let count = 0;

  threads.forEach(thread => {
    const first = thread.getFirstBlock();
    if (!first) return;
    const type = first.type;
    const isStart = type.includes('when_') || type.includes('start_') || 
                    type.includes('mouse_') || type.includes('key_press') || 
                    type === 'func_def';
    if (!isStart) {
      thread.destroy();
      count++;
    }
  });

  if (count > 0) Entry.toast.success('청소 완료', count + '개의 블록을 삭제했습니다.');
}

/**
 * 2. 상단 버튼 생성 및 배치
 */
function injectCleanerButton() {
  if (document.getElementById('entry-cleaner-btn')) return;

  // 엔트리 워크스페이스 상단 영역 찾기
  const menuArea = document.querySelector('.entryWorkspaceBoardV2');
  if (!menuArea) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // 폴더 안의 btn_icon.png 경로 가져오기
  // chrome.runtime.getURL은 world: "MAIN"에서 오류가 날 수 있어 수동으로 경로를 조합합니다.
  // 실제 확장프로그램 ID를 자동으로 감지하지 못할 경우를 대비한 안전한 설계가 필요합니다.
  
  btn.style.position = 'absolute';
  btn.style.top = '12px';        // 상단에서 거리 (사진 빨간 동그라미 높이)
  btn.style.left = '425px';      // 왼쪽에서 거리 (속성/변수 탭 옆)
  btn.style.width = '28px';      // 아이콘 크기
  btn.style.height = '28px';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';
  btn.style.backgroundColor = 'transparent'; // 배경 제거
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundSize = 'contain';
  btn.style.zIndex = '1000';

  // 이미지 경로 설정: 로컬 폴더 이미지를 불러오기 위한 시도
  // 만약 이미지가 안 나오면, 아래 'chrome-extension://' 부분을 실제 확장프로그램 ID로 바꾸거나
  // manifest의 web_accessible_resources가 정상 작동해야 합니다.
  btn.style.backgroundImage = "url('https://playentry.org/img/assets/btn_confirm_check.png')"; 
  // ↑ 우선 엔트리 기본 아이콘으로 테스트해보시고, 
  // 본인의 이미지를 쓰려면 아래 주석을 해제하세요. (단, ID가 필요함)
  // btn.style.backgroundImage = "url('chrome-extension://' + location.host + '/btn_icon.png')";

  btn.onclick = cleanBlocks;
  
  menuArea.appendChild(btn);
}

// 2초마다 버튼이 있는지 확인 후 생성
setInterval(injectCleanerButton, 2000);
