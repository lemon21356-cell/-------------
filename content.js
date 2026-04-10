// 1. 실제 삭제 로직을 'Main World'에 등록 (보안 오류 방지)
function injectLogic() {
  const script = document.createElement('script');
  script.textContent = `
    document.addEventListener('DO_CLEAN_BLOCKS', () => {
      if (typeof Entry === 'undefined' || !Entry.getMainWS()) return;
      
      const board = Entry.getMainWS().board;
      const threads = board.code.getThreads();
      let deletedCount = 0;

      const threadsToRemove = threads.filter(thread => {
        const first = thread.getFirstBlock();
        if (!first) return false;
        const type = first.type;
        const isStart = type.includes('when_') || type.includes('start_') || 
                        type.includes('mouse_') || type.includes('key_press') || 
                        type === 'func_def';
        return !isStart;
      });

      threadsToRemove.forEach(t => { t.destroy(); deletedCount++; });

      if (deletedCount > 0) {
        Entry.toast.success('청소 완료', deletedCount + '개의 블록을 삭제했습니다.');
      } else {
        Entry.toast.alert('알림', '삭제할 블록이 없습니다.');
      }
    });
  `;
  (document.head || document.documentElement).appendChild(script);
}

// 2. 화면에 띄울 버튼 만들기
function createButton() {
  if (document.getElementById('entry-cleaner-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';
  
  // 이미지 경로 (문자열 결합으로 안전하게 호출)
  const iconUrl = chrome.runtime.getURL('btn_icon.png');
  
  // 버튼 스타일
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

  // 클릭 시 'Main World'에 등록된 로직 호출
  btn.onclick = () => {
    document.dispatchEvent(new CustomEvent('DO_CLEAN_BLOCKS'));
  };

  document.body.appendChild(btn);
}

// 실행
injectLogic();
setInterval(createButton, 2000);
