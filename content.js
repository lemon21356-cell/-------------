/**
 * 1. 블록 삭제 로직 (기존과 동일)
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
      return !(type.includes('when_') || type.includes('start_') || 
               type.includes('mouse_') || type.includes('key_press') || 
               type === 'func_def');
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
 * 2. 아이콘 전용 버튼 생성
 */
function createCleanerButton() {
  // 이미 버튼이 있거나, 만들기 페이지(/ws)가 아니면 생성하지 않음
  if (document.getElementById('entry-cleaner-btn') || !window.location.href.includes('/ws')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // 이미지 경로 설정
  const iconUrl = chrome.runtime.getURL('btn_icon.png');

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '50px',
    height: '50px',
    // 배경색을 투명하게 하여 아이콘만 보이게 함
    backgroundColor: 'transparent', 
    backgroundImage: `url(${iconUrl})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: 'none',
    cursor: 'pointer',
    zIndex: '999999',
    transition: 'transform 0.2s',
    // 선택사항: 약간의 그림자를 주어 아이콘을 식별하기 쉽게 함
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
  });

  // 호버 효과: 살짝 커지게
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  btn.onclick = cleanEntryBlocks;
  document.body.appendChild(btn);
}

// 2초마다 페이지 상태를 확인하여 버튼 생성 시도
setInterval(createCleanerButton, 2000);
