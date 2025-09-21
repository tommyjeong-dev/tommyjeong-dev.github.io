// server.js (파일 업로드 기능이 추가된 전체 코드)

const express = require('express');
const { Song, Playlist } = require('./database');
const multer = require('multer'); // multer 가져오기
const path = require('path'); // 파일 경로를 다루기 위한 path 모듈

const app = express();
const PORT = 3000;

// --- 파일 업로드 설정 ---
// 파일이 저장될 위치와 파일 이름을 설정합니다.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'music-library/'); // 'music-library' 폴더에 저장
    },
    filename: function (req, file, cb) {
        // 중복을 피하기 위해 파일 이름에 타임스탬프를 추가하고, 한글 등 깨짐 방지
        const encodedName = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, Date.now() + '-' + encodedName);
    }
});
const upload = multer({ storage: storage });

app.use(express.static('.'));
app.use('/music-library', express.static(path.join(__dirname, 'music-library'))); // 이 줄 추가!
app.use(express.json());

// --- API 엔드포인트 ---

app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.findAll();
        res.json(songs);
    } catch (error) {
        res.status(500).send("서버에서 오류가 발생했습니다.");
    }
});

app.post('/api/songs', upload.single('songFile'), async (req, res) => {
    try {
        const { title, artist, date, composer } = req.body;
        // 업로드된 파일의 웹 접근 가능 경로를 사용
        const src = path.join('music-library', req.file.filename).replace(/\\/g, "/");
        
        const song = await Song.create({ title, artist, date, composer, src });
        res.status(201).json(song);
    } catch (error) {
        console.error(error);
        res.status(500).send("새 노래를 추가하는 중 서버에서 오류가 발생했습니다.");
    }
});

// server.js 에 추가

// DELETE /api/songs/:id: 특정 id의 노래를 DB에서 삭제
app.delete('/api/songs/:id', async (req, res) => {
    try {
        const id = req.params.id; // URL 주소에서 :id 부분의 값을 가져옵니다.
        const deleted = await Song.destroy({
            where: { id: id } // id가 일치하는 노래를 찾아서
        });

        if (deleted) {
            res.status(204).send(); // 성공적으로 삭제되었지만, 별도의 내용은 보내지 않음
        } else {
            res.status(404).send("해당 노래를 찾을 수 없습니다.");
        }
    } catch (error) {
        res.status(500).send("노래를 삭제하는 중 서버에서 오류가 발생했습니다.");
    }
});

// server.js 에 추가

// GET /api/songs/:id: 특정 id의 노래 하나만 찾아서 정보를 보내줌
app.get('/api/songs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const song = await Song.findByPk(id); // Primary Key(id)로 하나만 찾기
        if (song) {
            res.json(song);
        } else {
            res.status(404).send("해당 노래를 찾을 수 없습니다.");
        }
    } catch (error) {
        res.status(500).send("서버에서 오류가 발생했습니다.");
    }
});

// PUT /api/songs/:id: 특정 id의 노래 정보를 전달받은 내용으로 수정
app.put('/api/songs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // id로 노래를 찾아서, req.body에 담긴 새로운 정보로 업데이트
        const [updatedRows] = await Song.update(req.body, {
            where: { id: id }
        });

        if (updatedRows > 0) {
            const updatedSong = await Song.findByPk(id);
            res.status(200).json(updatedSong); // 수정된 노래 정보를 응답으로 보냄
        } else {
            res.status(404).send("해당 노래를 찾을 수 없습니다.");
        }
    } catch (error) {
        res.status(500).send("노래 정보를 수정하는 중 서버에서 오류가 발생했습니다.");
    }
});

// server.js 에 이어서 추가


// --- 플레이리스트 API ---

// GET /api/playlists: 모든 플레이리스트 목록을 가져옵니다.
app.get('/api/playlists', async (req, res) => {
    try {
        const playlists = await Playlist.findAll();
        res.json(playlists);
    } catch (error) {
        res.status(500).send("플레이리스트를 가져오는 중 오류가 발생했습니다.");
    }
});

// POST /api/playlists: 새로운 플레이리스트를 생성합니다.
app.post('/api/playlists', async (req, res) => {
    try {
        // 요청 본문(body)에서 name 값을 꺼냅니다.
        const { name } = req.body;
        if (!name) {
            return res.status(400).send("플레이리스트 이름이 필요합니다.");
        }
        const newPlaylist = await Playlist.create({ name: name });
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).send("플레이리스트를 생성하는 중 오류가 발생했습니다.");
    }
});
// GET /api/playlists/:id : 특정 플레이리스트의 정보와 담긴 노래 목록을 함께 가져옴
app.get('/api/playlists/:id', async (req, res) => {
    try {
        const playlistId = req.params.id;
        const playlist = await Playlist.findByPk(playlistId, {
            include: Song // 관계가 설정된 Song 모델을 포함시킴
        });

        if (playlist) {
            res.json(playlist);
        } else {
            res.status(404).send("플레이리스트를 찾을 수 없습니다.");
        }
    } catch (error) {
        res.status(500).send("플레이리스트 정보를 가져오는 중 오류가 발생했습니다.");
    }
});

// POST /api/playlists/:playlistId/songs : 특정 플레이리스트에 노래를 추가합니다.
app.post('/api/playlists/:playlistId/songs', async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { songId } = req.body;

        const playlist = await Playlist.findByPk(playlistId);
        const song = await Song.findByPk(songId);

        if (!playlist || !song) {
            return res.status(404).send("플레이리스트 또는 노래를 찾을 수 없습니다.");
        }

        // Sequelize의 관계 메서드를 사용해 플레이리스트에 노래를 추가합니다.
        await playlist.addSong(song);

        res.status(200).send("플레이리스트에 노래가 추가되었습니다.");

    } catch (error) {
        console.error("플레이리스트에 노래 추가 중 오류:", error);
        res.status(500).send("플레이리스트에 노래를 추가하는 중 오류가 발생했습니다.");
    }
});

// DELETE /api/playlists/:playlistId/songs/:songId : 특정 플레이리스트에서 특정 노래를 삭제
app.delete('/api/playlists/:playlistId/songs/:songId', async (req, res) => {
    try {
        const { playlistId, songId } = req.params; // URL에서 두 ID를 모두 가져옴

        const playlist = await Playlist.findByPk(playlistId);
        const song = await Song.findByPk(songId);

        if (!playlist || !song) {
            return res.status(404).send("플레이리스트 또는 노래를 찾을 수 없습니다.");
        }

        // Sequelize의 관계 메서드를 사용해 플레이리스트에서 노래를 제거합니다.
        await playlist.removeSong(song);

        res.status(200).send("플레이리스트에서 노래가 삭제되었습니다.");

    } catch (error) {
        console.error("플레이리스트에서 노래 삭제 중 오류:", error);
        res.status(500).send("플레이리스트에서 노래를 삭제하는 중 오류가 발생했습니다.");
    }
});
// --- 서버 시작 및 초기 데이터 입력 ---
app.listen(PORT, async () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    
    // (최초 1회 실행) 데이터베이스가 비어있으면, 기존 데이터를 넣어줍니다.
    try {
        const count = await Song.count();
        if (count === 0) {
            console.log("데이터베이스가 비어있어 초기 데이터를 입력합니다...");
            const initialSongs = [
                 { title: "결국엔 괜찮아", date: "2024. 08. 15", artist: "Tommy", composer: "Tommy", src: "music-library/tjmc-k/song-01.wav" },
                 { title: "스쳐본 사랑에 대한 질문", date: "2023. 11. 20", artist: "Tommy", composer: "Tommy", src: "music-library/tjmc-k/song-02.wav" },
                 { title: "날 사랑하지 않는 너", date: "2023. 05. 01", artist: "Tommy", composer: "Tommy", src: "music-library/tjmc-k/song-03.wav" }
            ];
            await Song.bulkCreate(initialSongs);
            console.log("초기 데이터 입력 완료.");
        }
    } catch (error) {
        console.error("데이터베이스 초기화 중 오류 발생:", error);
    }
});