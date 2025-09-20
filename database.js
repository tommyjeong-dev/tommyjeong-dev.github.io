// database.js

const { Sequelize, DataTypes } = require('sequelize');

// 'database.sqlite' 라는 파일에 데이터베이스를 저장하겠다고 설정합니다.
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// 'Song'이라는 이름의 표(Table)를 설계합니다.
const Song = sequelize.define('Song', {
    // 각 칸(Column)의 이름과 데이터 형식을 지정합니다.
    title: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING },
    artist: { type: DataTypes.STRING },
    composer: { type: DataTypes.STRING },
    src: { type: DataTypes.STRING, allowNull: false }
});

// 설계도를 바탕으로 실제 데이터베이스 파일을 동기화(생성)합니다.
sequelize.sync();

// 다른 파일에서 Song 모델을 사용할 수 있도록 내보냅니다.
module.exports = { Song };