/**
 * 1. 블록 삭제 핵심 로직
 */
function cleanEntryBlocks() {
  try {
    if (typeof Entry === 'undefined' || !Entry.getMainWS() || !Entry.getMainWS().board) {
      return;
    }

    const board = Entry.getMainWS().board;
    const threads = board.code.getThreads();
    let deletedCount = 0;

    const threadsToRemove = threads.filter(thread => {
      const first = thread.getFirstBlock();
      if (!first) return false;
      const type = first.type;
      const isStartBlock = 
        type.includes('when_') || type.includes('start_') || 
        type.includes('mouse_') || type.includes('key_press') || 
        type === 'func_def';
      return !isStartBlock;
    });

    threadsToRemove.forEach(t => { t.destroy(); deletedCount++; });

    if (deletedCount > 0) {
      Entry.toast.success('청소 완료', deletedCount + '개의 블록을 삭제했습니다.');
    } else {
      Entry.toast.alert('알림', '삭제할 블록이 없습니다.');
    }
  } catch (e) {
    console.error("청소 중 오류:", e);
  }
}

/**
 * 2. 화면에 띄울 버튼 생성
 */
function createCleanerButton() {
  if (document.getElementById('entry-cleaner-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // --- 오류 수정 구간 시작 ---
  // world: "MAIN"에서 chrome.runtime.id를 읽지 못할 경우를 대비하여 
  // 이미지 경로를 안전하게 가져오는 방법입니다.
  let iconUrl = "";
  try {
    iconUrl = chrome.runtime.getURL('btn_icon.png');
  } catch (e) {
    // 만약 위 코드가 실패하면 엔트리의 기본 아이콘을 임시로 사용합니다.
    iconUrl = "https://playentry.org/img/assets/btn_confirm_check.png";
  }
  // --- 오류 수정 구간 끝 ---

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

  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // 클릭 시 삭제 실행
  btn.onclick = cleanEntryBlocks;

  document.body.appendChild(btn);
}

// 버튼 생성 실행
setInterval(createCleanerButton, 2000);
