// admin.js (삭제 기능이 추가된 전체 코드)

const form = document.getElementById('add-song-form');
const songList = document.getElementById('song-management-list');

// (새로운 함수) 서버에서 노래 목록을 가져와 화면에 표시하는 함수
// admin.js 의 fetchAndRenderSongs 함수 내부를 수정

async function fetchAndRenderSongs() {
    try {
        const response = await fetch('/api/songs');
        const songs = await response.json();
        
        songList.innerHTML = '';
        songs.forEach(song => {
            const listItem = document.createElement('li');
            // admin.js 의 fetchAndRenderSongs 함수 내부 listItem.innerHTML 부분

listItem.innerHTML = `
    <div class="song-info">
        <span class="song-title">${song.title}</span>
        <span class="song-meta">${song.artist}</span>
    </div>
    <div class="buttons">
        <a href="edit.html?id=${song.id}" class="admin-btn btn-edit">수정</a>
        <button class="admin-btn btn-delete" data-id="${song.id}">삭제</button>
    </div>
`;
            // -------------------------
            songList.appendChild(listItem);
        });
    } catch (error) {
        console.error('노래 목록 로딩 오류:', error);
    }
}

// '새 노래 추가' 폼 제출 이벤트 리스너 (기존과 동일)
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('노래가 성공적으로 추가되었습니다!');
            form.reset();
            fetchAndRenderSongs(); // 노래 추가 후 목록을 새로고침합니다.
        } else {
            alert('업로드에 실패했습니다.');
        }
    } catch (error) {
        console.error('오류 발생:', error);
        alert('서버와 통신 중 오류가 발생했습니다.');
    }
});

// (새로운 이벤트 리스너) '삭제' 버튼 클릭 처리
songList.addEventListener('click', async function(event) {
    if (event.target.matches('.remove-from-playlist-btn')) {
        const songId = event.target.dataset.id;
        
        // 실수로 삭제하는 것을 방지하기 위해 확인창을 띄웁니다.
        if (confirm(`정말로 이 노래를 삭제하시겠습니까?`)) {
            try {
                const response = await fetch(`/api/songs/${songId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('노래가 삭제되었습니다.');
                    fetchAndRenderSongs(); // 삭제 후 목록을 새로고침합니다.
                } else {
                    alert('삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('삭제 오류:', error);
                alert('서버와 통신 중 오류가 발생했습니다.');
            }
        }
    }
});


// 페이지가 처음 열릴 때 노래 목록을 불러옵니다.
fetchAndRenderSongs();