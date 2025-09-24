// database.js (최종 수정본)
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const Song = sequelize.define('Song', {
    title: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING },
    artist: { type: DataTypes.STRING },
    composer: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING }, // <-- 장르 저장을 위한 칸 추가
    src: { type: DataTypes.STRING, allowNull: false },
    lyrics: { type: DataTypes.TEXT }
});

const Playlist = sequelize.define('Playlist', {
    name: { type: DataTypes.STRING, allowNull: false }
});

// 중간 테이블을 직접 정의하여 불필요한 제약조건을 피합니다.
const PlaylistSongs = sequelize.define('PlaylistSongs', {});

Song.belongsToMany(Playlist, { through: PlaylistSongs });
Playlist.belongsToMany(Song, { through: PlaylistSongs });

// { force: true } 옵션은 서버가 시작될 때마다 테이블을 모두 지우고 새로 만듭니다.
// 개발 초기 단계에서 구조를 자주 바꿀 때 유용합니다.
sequelize.sync();

module.exports = { Song, Playlist, sequelize };
