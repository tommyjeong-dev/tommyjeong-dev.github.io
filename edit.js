// edit.js

const form = document.getElementById('edit-song-form');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const dateInput = document.getElementById('date');
const composerInput = document.getElementById('composer');
const srcInput = document.getElementById('src');

// 1. URL에서 수정할 노래의 id를 가져옵니다. (예: edit.html?id=3)
const params = new URLSearchParams(window.location.search);
const songId = params.get('id');

// 2. 페이지가 로드될 때, 서버에서 해당 id의 노래 정보를 가져와 폼에 채워 넣습니다.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`/api/songs/${songId}`);
        if (!response.ok) throw new Error('Failed to fetch song data');
        
        const song = await response.json();
        
        // 폼의 각 입력란에 기존 데이터를 채워줍니다.
        titleInput.value = song.title;
        artistInput.value = song.artist;
        dateInput.value = song.date;
        composerInput.value = song.composer;
        document.getElementById('genre').value = song.genre || ''; // <-- 장르 채우기 추가
        srcInput.value = song.src;
        document.getElementById('lyrics').value = song.lyrics || ''; // <-- 가사 채우기 추가

    } catch (error) {
        console.error('Error:', error);
        alert('노래 정보를 불러오는데 실패했습니다.');
    }
});

// 3. '변경사항 저장' 버튼을 눌렀을 때의 동작
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const updatedData = {
        title: titleInput.value,
        artist: artistInput.value,
        date: dateInput.value,
        composer: composerInput.value,
        genre: document.getElementById('genre').value, // <-- 장르 보내기 추가
        src: srcInput.value, 
        lyrics: document.getElementById('lyrics').value // <-- 가사 보내기 추가
    };

    try {
        const response = await fetch(`/api/songs/${songId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert('성공적으로 수정되었습니다.');
            window.location.href = '/admin.html'; // 수정 후 관리자 페이지로 이동
        } else {
            alert('수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('서버와 통신 중 오류가 발생했습니다.');
    }
});
