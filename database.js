// database.js (여러 플레이리스트를 지원하도록 업그레이드)

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// 'Song' 모델 정의 (기존과 동일)
const Song = sequelize.define('Song', {
    title: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING },
    artist: { type: DataTypes.STRING },
    composer: { type: DataTypes.STRING },
    src: { type: DataTypes.STRING, allowNull: false }
});

// --- 추가된 부분 ---
// 'Playlist' 모델 (새로운 '책장')을 정의합니다.
const Playlist = sequelize.define('Playlist', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// --- 관계 설정 (가장 중요!) ---
// 노래와 플레이리스트는 '다대다(Many-to-Many)' 관계입니다.
// 하나의 노래는 여러 플레이리스트에 속할 수 있고,
// 하나의 플레이리스트는 여러 노래를 가질 수 있습니다.
// 'PlaylistSongs'라는 중간 테이블을 통해 이 관계를 관리합니다.
Song.belongsToMany(Playlist, { through: 'PlaylistSongs' });
Playlist.belongsToMany(Song, { through: 'PlaylistSongs' });
// --------------------

// 설계도를 바탕으로 실제 데이터베이스 파일을 동기화합니다.
// { alter: true } 옵션은 기존 데이터(노래 목록)를 유지하면서 변경사항을 적용합니다.
sequelize.sync({ alter: true });

// 다른 파일에서 Song과 Playlist 모델을 모두 사용할 수 있도록 내보냅니다.
module.exports = { Song, Playlist, sequelize };
