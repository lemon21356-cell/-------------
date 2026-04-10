// =========================================================================
// 1. 엔트리 환경(Main World)에서 실행될 청소 로직을 페이지에 몰래 주입합니다.
// =========================================================================
const script = document.createElement('script');
script.textContent = `
  // 확장 프로그램 버튼에서 'CLEAN_BLOCKS' 신호를 보내면 이 코드가 실행됩니다.
  document.addEventListener('CLEAN_BLOCKS', () => {
    try {
      if (typeof Entry === 'undefined' || !Entry.getMainWS() || !Entry.getMainWS().board) {
        alert('엔트리 만들기 화면이 아닙니다.');
        return;
      }
      
      const board = Entry.getMainWS().board;
      const threads = board.code.getThreads();
      let deletedCount = 0;

      const threadsToRemove = threads.filter(thread => {
        const firstBlock = thread.getFirstBlock();
        if (!firstBlock) return false;
        
        const type = firstBlock.type;
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
        Entry.toast.success('청소 완료', deletedCount + '개의 흩어진 블록 묶음을 삭제했습니다.');
      } else {
        Entry.toast.alert('알림', '삭제할 흩어진 블록이 없습니다.');
      }
    } catch(e) {
      console.error(e);
    }
  });
`;
(document.head || document.documentElement).appendChild(script);
script.remove(); // 주입 후 껍데기는 지움


// =========================================================================
// 2. 화면 우측 하단에 예쁜 플로팅 버튼(동그란 버튼)을 만듭니다.
// =========================================================================
function createExtensionButton() {
  // 이미 버튼이 만들어져 있다면 중복해서 만들지 않음
  if (document.getElementById('entry-cleaner-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'entry-cleaner-btn';
  
  // manifest에 등록된 이미지 경로 가져오기 (이게 폴더 안의 이미지입니다)
  const iconUrl = chrome.runtime.getURL('btn_icon.png');
  
  // 버튼 디자인 설정 (엔트리 스타일)
  btn.style.position = 'fixed';
  btn.style.bottom = '30px';        // 아래에서 30px 띄움
  btn.style.right = '30px';         // 오른쪽에서 30px 띄움
  btn.style.width = '60px';         // 버튼 너비
  btn.style.height = '60px';        // 버튼 높기
  btn.style.backgroundColor = '#5B67FF'; // 쨍한 파란색 배경
  btn.style.backgroundImage = \`url('\${iconUrl}')\`; // 준비한 이미지 쏙!
  btn.style.backgroundSize = '50%'; // 이미지 크기 조절 (필요시 수정)
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.borderRadius = '50%';   // 동그랗게 만들기
  btn.style.border = 'none';
  btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)'; // 그림자 효과
  btn.style.cursor = 'pointer';
  btn.style.zIndex = '99999';       // 다른 화면 요소보다 무조건 맨 위에 오도록
  btn.style.transition = 'transform 0.2s'; // 애니메이션 효과

  // 마우스 올렸을 때 살짝 커지는 효과
  btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  // 클릭하면 위에서 만든 'CLEAN_BLOCKS' 신호를 쏨
  btn.onclick = () => {
    document.dispatchEvent(new CustomEvent('CLEAN_BLOCKS'));
  };

  document.body.appendChild(btn);
}

// 엔트리는 화면이 늦게 뜨는 경우가 있어서 주기적으로 확인하며 버튼을 달아줍니다.
setInterval(createExtensionButton, 2000);
