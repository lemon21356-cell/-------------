document.getElementById('cleanBtn').addEventListener('click', async () => {
  // 현재 활성화된 탭 정보 가져오기
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 엔트리 사이트인지 확인
  if (tab.url && tab.url.includes("playentry.org")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: cleanEntryBlocks, // 아래 정의된 함수를 실행
      world: 'MAIN'          // 중요: 엔트리 내부 JS 객체에 접근하기 위해 필요
    });
  } else {
    alert("엔트리 만들기 화면에서 실행해주세요!");
  }
});

/**
 * 엔트리 실행 환경(Main World)에서 직접 실행될 함수
 */
function cleanEntryBlocks() {
  try {
    // 1. 엔트리 엔진 및 워크스페이스가 로드되었는지 확인
    if (typeof Entry === 'undefined' || !Entry.getMainWS() || !Entry.getMainWS().board) {
      alert('엔트리 만들기 화면이 아니거나, 아직 로딩 중입니다.');
      return;
    }

    const board = Entry.getMainWS().board;
    const threads = board.code.getThreads(); // 모든 블록 묶음(스레드) 가져오기
    let deletedCount = 0;

    // 2. 삭제 대상 스레드 필터링
    // 시작 블록이 '이벤트(시작/신호/클릭)'나 '함수 정의'가 아닌 것들을 골라냅니다.
    const threadsToRemove = threads.filter(thread => {
      const firstBlock = thread.getFirstBlock();
      if (!firstBlock) return false;

      const type = firstBlock.type;
      
      // 시작 블록으로 인정되는 타입들
      const isStartBlock = 
        type.includes('when_') ||    // 클릭했을 때, 신호를 받았을 때 등
        type.includes('start_') ||   // 시작하기 버튼 클릭했을 때
        type.includes('mouse_') ||   // 마우스 클릭했을 때
        type.includes('key_press') || // 키를 눌렀을 때
        type === 'func_def';         // 함수 정의 블록

      // 위 조건에 해당하지 않는 '미연결 블록'만 true 반환
      return !isStartBlock;
    });

    // 3. 필터링된 블록들 삭제 처리
    threadsToRemove.forEach(thread => {
      thread.destroy(); // 스레드 통째로 삭제
      deletedCount++;
    });

    // 4. 결과 알림 (엔트리 자체 토스트 메시지 활용)
    if (deletedCount > 0) {
      Entry.toast.success('청소 완료', `${deletedCount}개의 흩어진 블록 묶음을 삭제했습니다.`);
    } else {
      Entry.toast.alert('알림', '삭제할 흩어진 블록이 없습니다.');
    }

  } catch (e) {
    console.error('엔트리 청소기 오류:', e);
    alert('블록을 지우는 중 오류가 발생했습니다. 개발자 도구(F12)를 확인하세요.');
  }
}
