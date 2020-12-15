var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) throw err
    console.log('Connected to the SQLite database.')
    db.run(`DROP TABLE IF EXISTS profiles;`, (err) => {
        db.run(`CREATE TABLE profiles (
            fullname TEXT,
            username TEXT PRIMARY KEY NOT NULL,
            followersCount INTEGER,
            followsCount INTEGER,
            mutualFollowsCount INTEGER,
            savedMediasCount INTEGER,
            highlightReelCount INTEGER,
            igTvVideosCount INTEGER,
            postsCount INTEGER,
            last12PostsLikeRate INTEGER,
            last12PostsVideosCount INTEGER,
            last12IgTvVideosLikeRate INTEGER,
            last12IgTvVideosTotalDuration INTEGER,
            last12IgTvVideosDurationRate INTEGER
        );`, (err) => {
            if (err) {
                // Table already created
                console.log(err);
                console.log('Profiles table already created.');
            } else {
                // Table just created, creating some rows
                console.log('Created profiles table.');
            }
        });
        db.close();
    });
    
});

module.exports = db