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
 * 2. 상단 메뉴에 아이콘 버튼 생성
 */
function createCleanerButton() {
  if (document.getElementById('entry-cleaner-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // 이미지 경로 설정 (이미지가 안 나오면 주소 부분을 외부 링크로 바꿔보세요)
  const iconUrl = chrome.runtime.getURL('btn_icon.png');

  Object.assign(btn.style, {
    position: 'absolute',
    top: '10px',            // 위에서 10px 내려옴 (사진의 빨간 동그라미 위치)
    left: '420px',          // 왼쪽에서 420px 이동 (탭 메뉴 옆)
    width: '32px',          // 아이콘 크기
    height: '32px',
    backgroundColor: 'transparent', // 배경 투명
    backgroundImage: 'url(' + iconUrl + ')',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: 'none',
    cursor: 'pointer',
    zIndex: '999',          // 메뉴 위에 보이도록
    transition: 'opacity 0.2s'
  });

  // 호버 시 살짝 투명하게 해서 눌리는 느낌 주기
  btn.onmouseover = () => btn.style.opacity = '0.7';
  btn.onmouseout = () => btn.style.opacity = '1';

  btn.onclick = cleanEntryBlocks;

  // 엔트리의 메뉴 바 영역(속성 탭 등이 있는 곳)을 찾아 버튼을 붙입니다.
  const targetParent = document.querySelector('.entryWorkspaceBoardV2') || document.body;
  targetParent.appendChild(btn);
}

// 2초마다 확인하여 버튼 생성
setInterval(createCleanerButton, 2000);
