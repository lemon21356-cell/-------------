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
      // 시작 블록들을 제외한 나머지 블록 선택
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
 * 2. 아이콘 전용 버튼 생성
 */
function createCleanerButton() {
  // 이미 버튼이 존재하거나 워크스페이스(/ws) 주소가 아니면 실행 안 함
  if (document.getElementById('entry-cleaner-btn') || !window.location.href.includes('/ws')) {
    return;
  }

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // 확장 프로그램 폴더 내의 이미지 경로 가져오기
  const iconUrl = chrome.runtime.getURL('btn_icon.png');

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    // 배경을 투명하게 설정
    backgroundColor: 'transparent',
    backgroundImage: `url(${iconUrl})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: 'none',
    cursor: 'pointer',
    zIndex: '999999',
    transition: 'transform 0.2s ease-in-out',
    // 아이콘이 더 잘 보이도록 부드러운 그림자 추가
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
  });

  // 마우스 호버 애니메이션
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // 클릭 시 삭제 함수 실행
  btn.onclick = cleanEntryBlocks;

  document.body.appendChild(btn);
}

// 엔트리 엔진 로딩 및 페이지 전환 대응을 위해 2초마다 체크
setInterval(createCleanerButton, 2000);
