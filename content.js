/**
 * 1. 블록 삭제 핵심 로직
 */
function cleanEntryBlocks() {
  try {
    // 엔트리 엔진이 로드되었는지 확인
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
      
      // 시작 블록, 마우스/키 입력, 함수 정의 등 핵심 블록은 제외
      const isStartBlock = 
        type.includes('when_') || type.includes('start_') || 
        type.includes('mouse_') || type.includes('key_press') || 
        type === 'func_def';
      return !isStartBlock;
    });

    threadsToRemove.forEach(t => { 
      t.destroy(); 
      deletedCount++; 
    });

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
  // 이미 버튼이 있거나 워크스페이스 주소가 아니면 생성 중단
  if (document.getElementById('entry-cleaner-btn') || !window.location.href.includes('/ws')) {
    return;
  }

  // inject_url.js가 저장해둔 이미지 주소 읽기
  const iconUrl = document.documentElement.getAttribute('data-cleaner-icon-url');
  if (!iconUrl) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';

  // 버튼 스타일 설정 (배경 투명, 아이콘만 표시)
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    backgroundColor: 'transparent', // 배경 지우기
    backgroundImage: `url(${iconUrl})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: 'none',
    cursor: 'pointer',
    zIndex: '999999',
    transition: 'transform 0.2s ease-in-out',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' // 아이콘 외곽선 그림자
  });

  // 호버 애니메이션
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // 클릭 이벤트 연결
  btn.onclick = cleanEntryBlocks;

  document.body.appendChild(btn);
}

// 2초마다 버튼이 필요한 상황인지 체크
setInterval(createCleanerButton, 2000);
