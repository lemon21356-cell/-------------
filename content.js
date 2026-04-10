// 웹페이지 환경에서 window.Entry에 접근하기 위해 script 태그를 만들어 삽입합니다.
function injectScript() {
  const scriptContent = `
    try {
      if (typeof Entry === 'undefined' || !Entry.getMainWS()) {
        alert('엔트리 만들기 화면이 아닙니다.');
      } else {
        const board = Entry.getMainWS().board;
        const threads = board.code.getThreads();
        let deletedCount = 0;

        // 모든 블록 묶음(스레드)을 확인합니다.
        const threadsToRemove = threads.filter(thread => {
          const firstBlock = thread.getFirstBlock();
          if (!firstBlock) return false;

          // 시작 블록이 이벤트 블록(시작하기 버튼 클릭할 때 등)이거나 함수 정의 블록인지 확인
          const type = firstBlock.type;
          const isEventBlock = type.includes('when_') || 
                               type.includes('start_') || 
                               type.includes('mouse_') || 
                               type === 'func_def';

          // 이벤트 블록이 아니라면 쓸모없이 흩어진 블록으로 간주
          return !isEventBlock;
        });

        // 조건에 맞는 블록들을 삭제
        threadsToRemove.forEach(thread => {
          thread.destroy();
          deletedCount++;
        });

        // 엔트리 자체 알림(토스트)으로 결과 표시
        if (deletedCount > 0) {
          Entry.toast.success('청소 완료', deletedCount + '개의 쓸모없는 블록 묶음을 삭제했습니다.');
        } else {
          Entry.toast.success('알림', '삭제할 블록이 없습니다.');
        }
      }
    } catch (e) {
      console.error('블록 청소 중 오류:', e);
      alert('오류가 발생했습니다. 개발자 도구를 확인해주세요.');
    }
  `;

  const script = document.createElement('script');
  script.textContent = scriptContent;
  (document.head || document.documentElement).appendChild(script);
  script.remove(); // 실행 후 스크립트 태그는 깔끔하게 지웁니다.
}

injectScript();
