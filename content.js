// ==========================================
// 1. 엔트리 내부 엔진에 접근하는 로직 주입
// ==========================================
const script = document.createElement('script');
script.textContent = `
  document.addEventListener('CLEAN_BLOCKS_EVENT', () => {
    try {
      if (typeof Entry === 'undefined' || !Entry.getMainWS() || !Entry.getMainWS().board) {
        return;
      }
      
      const board = Entry.getMainWS().board;
      const threads = board.code.getThreads();
      let deletedCount = 0;

      const threadsToRemove = threads.filter(thread => {
        const firstBlock = thread.getFirstBlock();
        if (!firstBlock) return false;
        
        const type = firstBlock.type;
        // 이벤트/시작 블록 리스트
        const isStartBlock = type.includes('when_') || 
                             type.includes('start_') || 
                             type.includes('mouse_') || 
                             type.includes('key_press') || 
                             type === 'func_def';
        return !isStartBlock;
      });

      threadsToRemove.forEach(thread => {
        thread.destroy();
        deletedCount++;
      });

      if (deletedCount > 0) {
        Entry.toast.success('청소 완료', deletedCount + '개의 블록 묶음을 삭제했습니다.');
      } else {
        Entry.toast.alert('알림', '삭제할 블록이 없습니다.');
      }
    } catch(e) {
      console.error('청소기 오류:', e);
    }
  });
`;
(document.head || document.documentElement).appendChild(script);
script.remove();

// ==========================================
// 2. 화면에 띄울 플로팅 버튼 생성
// ==========================================
function createFloatingButton() {
  if (document.getElementById('entry-cleaner-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';
  
  // 이미지 경로 설정 (오류 방지를 위한 문자열 결합 방식)
  const iconUrl = chrome.runtime.getURL('btn_icon.png');
  
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
    transition: 'transform 0.2s ease'
  });

  // 마우스 호버 애니메이션
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // 클릭 시 이벤트 발생
  btn.onclick = () => {
    document.dispatchEvent(new CustomEvent('CLEAN_BLOCKS_EVENT'));
  };

  document.body.appendChild(btn);
}

// 엔트리가 동적으로 로드되므로 2초마다 버튼 존재 여부 확인 후 생성
setInterval(createFloatingButton, 2000);
