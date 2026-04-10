/**
 * 1. 블록 삭제 핵심 로직
 */
function cleanEntryBlocks() {
  try {
    // 엔트리 워크스페이스 확인
    if (typeof Entry === 'undefined' || !Entry.getMainWS() || !Entry.getMainWS().board) {
      console.log("엔트리 조립소 화면이 아닙니다.");
      return;
    }

    const board = Entry.getMainWS().board;
    const threads = board.code.getThreads();
    let deletedCount = 0;

    // 시작 블록이 연결되지 않은 스레드 필터링
    const threadsToRemove = threads.filter(thread => {
      const first = thread.getFirstBlock();
      if (!first) return false;
      
      const type = first.type;
      const isStartBlock = 
        type.includes('when_') || 
        type.includes('start_') || 
        type.includes('mouse_') || 
        type.includes('key_press') || 
        type === 'func_def';

      return !isStartBlock;
    });

    // 필터링된 블록 삭제
    threadsToRemove.forEach(t => {
      t.destroy();
      deletedCount++;
    });

    // 결과 알림
    if (deletedCount > 0) {
      Entry.toast.success('청소 완료', deletedCount + '개의 흩어진 블록을 삭제했습니다.');
    } else {
      Entry.toast.alert('알림', '삭제할 흩어진 블록이 없습니다.');
    }
  } catch (e) {
    console.error("블록 청소 중 오류 발생:", e);
  }
}

/**
 * 2. 화면에 띄울 버튼 생성
 */
function createCleanerButton() {
  if (document.getElementById('entry-cleaner-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // 이미지 경로 설정
  // world: MAIN 에서는 chrome.runtime.getURL을 쓸 수 없으므로 엔트리용 확장프로그램 경로를 직접 생성합니다.
  const extensionId = "YOUR_EXTENSION_ID"; // 아래 주의사항 참고
  const iconUrl = 'chrome-extension://' + chrome.runtime.id + '/btn_icon.png';

  // 스타일 설정
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    backgroundColor: '#5B67FF',
    backgroundImage: 'url(' + iconUrl + ')',
    backgroundSize: '50%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '50%',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    zIndex: '999999',
    transition: 'transform 0.2s'
  });

  // 호버 효과
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // 클릭 시 삭제 실행
  btn.onclick = cleanEntryBlocks;

  document.body.appendChild(btn);
}

// 2초마다 실행하여 엔트리 로딩 완료 후 버튼 생성
setInterval(createCleanerButton, 2000);
