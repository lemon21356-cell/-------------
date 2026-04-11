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

  // --- 이미지 경로 설정 최적화 ---
  // manifest.json의 web_accessible_resources에 등록된 btn_icon.png를 불러옵니다.
  // world: "MAIN" 환경에서는 아래와 같이 직접 URL을 구성하는 것이 가장 안전합니다.
  const extensionId = document.currentScript ? new URL(document.currentScript.src).host : "";
  const iconUrl = `chrome-extension://${extensionId}/btn_icon.png`;

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    backgroundColor: '#5B67FF',
    // 이미지를 배경으로 설정
    backgroundImage: `url(${iconUrl})`,
    backgroundSize: '30px', // 아이콘 크기 조절
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '50%',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    zIndex: '999999',
    transition: 'all 0.2s ease-in-out'
  });

  // 호버 효과
  btn.onmouseover = () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.backgroundColor = '#4A56E2';
  };
  btn.onmouseout = () => {
    btn.style.transform = 'scale(1)';
    btn.style.backgroundColor = '#5B67FF';
  };

  btn.onclick = cleanEntryBlocks;
  document.body.appendChild(btn);
}

// 버튼 생성 주기적 확인 (엔트리 로딩 대기)
setInterval(createCleanerButton, 2000);
