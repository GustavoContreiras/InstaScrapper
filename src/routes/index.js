const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose()

const db = require("../db.js");

router.get('/', async function (req, res, next) {

    async function getProfileData(profileName) {
        const response = await fetch(`https://www.instagram.com/${profileName}/?__a=1`, {
            "method": "GET",
            "headers": {
                "cookie": "ig_did=57F71274-0954-46E2-96D1-14B6AF65C690; csrftoken=OnMjWWT0nkQsS5yASLb5kMuBeHYDH1Yd; mid=X9aqFAAEAAHY1tvndT0Rlx2dR3KC; urlgen=%22%7B%5C%222804%3A14d%3A5ce6%3A8de7%3Aa5c3%3A2ee6%3A509f%3Af2fc%5C%22%3A%2028573%7D%3A1kobDg%3AgJk4qIYn2FbkZFQVMQ5S4NZ-YfI%22; ig_nrcb=1",
            },
            "mode": "cors"
        }).catch(err => console.error(err));;
        return await response.json();
    }

    const profileName = req.query.profile;

    if (profileName === null || profileName === undefined) {
        res.render('index');
        return;
    }

    getProfileData(profileName).then(fullData => {

        if (fullData.graphql === undefined) {
            res.render('index');
            return;
        }

        const user = fullData.graphql.user;

        const username = user.username;
        const fullname = user.full_name;

        const followersCount = user.edge_followed_by.count;
        const followsCount = user.edge_follow.count;
        const mutualFollowsCount = user.edge_mutual_followed_by.count;
        const savedMediasCount = user.edge_saved_media.count;
        const highlightReelCount = user.highlight_reel_count;

        const postsCount = user.edge_owner_to_timeline_media.count;
        const posts = user.edge_owner_to_timeline_media.edges;
        const postsData = [];
        let postsTotalLikes = 0;
        let postsVideosCount = 0;

        for (let i = 0, post; post = posts[i++];) {
            const postData = {};
            postData.takenTimestamp = post.node.taken_at_timestamp;
            postData.likesCount = post.node.edge_media_preview_like.count;
            postData.commentsCount = post.node.edge_media_to_comment.count;
            postData.taggedUsersCount = post.node.edge_media_to_tagged_user.edges.length;
            postData.isVideo = post.node.is_video;
            postsData.push(postData);
            postsTotalLikes += postData.likesCount;
            if (postData.isVideo) postsVideosCount += 1;
        }

        const igTvVideosCount = user.edge_felix_video_timeline.count;
        const igTvVideos = user.edge_felix_video_timeline.edges;
        const igTvVideosData = [];
        let igTvVideosTotalLikes = 0;
        let igTvVideosTotalDuration = 0;

        for (let i = 0, video; video = igTvVideos[i++];) {
            const videoData = {};
            videoData.title = video.node.title;
            videoData.takenTimestamp = video.node.taken_at_timestamp;
            videoData.duration = video.node.video_duration;
            videoData.viewsCount = video.node.video_view_count;
            videoData.likesCount = video.node.edge_media_preview_like.count;
            videoData.commentsCount = video.node.edge_media_to_comment.count;
            igTvVideosData.push(videoData);
            igTvVideosTotalLikes += videoData.likesCount;
            igTvVideosTotalDuration += videoData.duration;
        }

        const data = {
            username: username,
            fullname: fullname,
            followersCount: followersCount,
            followsCount: followsCount,
            mutualFollowsCount: mutualFollowsCount,
            igTvVideosCount: igTvVideosCount,
            savedMediasCount: savedMediasCount,
            highlightReelCount: highlightReelCount,
            last12PostsLikeRate: postsTotalLikes / 12,
            last12PostsVideosCount: postsVideosCount,
            last12IgTvVideosLikeRate: igTvVideosTotalLikes / 12,
            last12IgTvVideosTotalDuration: igTvVideosTotalDuration,
            last12IgTvVideosDurationRate: igTvVideosTotalDuration / 12,
            postsData: postsData,
            igTvVideosData: igTvVideosData
        };

        res.render('index', data);
    });
});

router.post('/save', async function (req, res, next) {

    const body = req.body;

    const username = body.username;
    const fullname = body.fullname;

    const followersCount = body.followersCount;
    const followsCount = body.followsCount;
    const mutualFollowsCount = body.mutualFollowsCount;
    const savedMediasCount = body.savedMediasCount;
    const highlightReelCount = body.highlightReelCount;

    const igTvVideosCount = body.igTvVideosCount;
    const postsCount = body.postsCount;

    const last12PostsLikeRate = body.last12PostsLikeRate;
    const last12PostsVideosCount = body.last12PostsVideosCount;
    const last12IgTvVideosLikeRate = body.last12IgTvVideosLikeRate;
    const last12IgTvVideosTotalDuration = body.last12IgTvVideosTotalDuration;
    const last12IgTvVideosDurationRate = body.last12IgTvVideosDurationRate;

    let db = new sqlite3.Database("db.sqlite", (err) => { if (err) throw err; })

    const statement = db.prepare("INSERT INTO profiles (fullname, username, followersCount, followsCount, mutualFollowsCount, savedMediasCount, highlightReelCount, igTvVideosCount, postsCount, last12PostsLikeRate, last12PostsVideosCount, last12IgTvVideosLikeRate, last12IgTvVideosTotalDuration, last12IgTvVideosDurationRate) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");
    
    const params = [
        fullname !== null ? fullname : 'NULL',
        username !== null ? username : 'NULL',
        followersCount !== null ? followersCount : 'NULL',
        followsCount !== null ? followsCount : 'NULL',
        mutualFollowsCount !== null ? mutualFollowsCount : 'NULL',
        savedMediasCount !== null ? savedMediasCount : 'NULL',
        highlightReelCount !== null ? highlightReelCount : 'NULL',
        igTvVideosCount !== null ? igTvVideosCount : 'NULL',
        postsCount !== null ? postsCount : 'NULL',
        last12PostsLikeRate !== null ? last12PostsLikeRate : 'NULL',
        last12PostsVideosCount !== null ? last12PostsVideosCount : 'NULL',
        last12IgTvVideosLikeRate !== null ? last12IgTvVideosLikeRate : 'NULL',
        last12IgTvVideosTotalDuration !== null ? last12IgTvVideosTotalDuration : 'NULL',
        last12IgTvVideosDurationRate !== null ? last12IgTvVideosDurationRate : 'NULL'];

    console.log('Trying to insert profile...');

    statement.run(params, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {

                console.log('Preparing query to update profile...');

                db.run('UPDATE profiles SET fullname = $fullname, followersCount = $followersCount, followsCount = $followsCount, mutualFollowsCount = $mutualFollowsCount, savedMediasCount = $savedMediasCount, highlightReelCount = $highlightReelCount, igTvVideosCount = $igTvVideosCount, postsCount = $postsCount, last12PostsLikeRate = $last12PostsLikeRate, last12PostsVideosCount = $last12PostsVideosCount, last12IgTvVideosLikeRate = $last12IgTvVideosLikeRate, last12IgTvVideosTotalDuration = $last12IgTvVideosTotalDuration, last12IgTvVideosDurationRate = $last12IgTvVideosDurationRate WHERE username = $username;', {
                    $fullname: fullname,
                    $followersCount: followersCount,
                    $followsCount: followsCount,
                    $mutualFollowsCount: mutualFollowsCount,
                    $savedMediasCount: savedMediasCount,
                    $highlightReelCount: highlightReelCount,
                    $igTvVideosCount: igTvVideosCount,
                    $postsCount: postsCount,
                    $last12PostsLikeRate: last12PostsLikeRate,
                    $last12PostsVideosCount: last12PostsVideosCount,
                    $last12IgTvVideosLikeRate: last12IgTvVideosLikeRate,
                    $last12IgTvVideosTotalDuration: last12IgTvVideosTotalDuration,
                    $last12IgTvVideosDurationRate: last12IgTvVideosDurationRate,
                    $username: username
                }, (err) => {
                    if (err) {
                        console.log('Couldnt save or update profile.')
                        closeDatabase(db);
                        return res.status(500).send(JSON.stringify(err));
                    } else {
                        console.log('Updated profile.')
                        closeDatabase(db);
                        return res.status(200).send(JSON.stringify(req.body));
                    }
                });

            } else {
                console.log('Couldnt save or update profile.')
                closeDatabase(db);
                return res.status(500).send(JSON.stringify(err));
            }
        } else {
            console.log('Saved profile.')
            closeDatabase(db);
            return res.status(200).send(JSON.stringify(req.body));
        }
    });

    statement.finalize();
});

router.get('/list', async function (req, res, next) {

    let db = new sqlite3.Database("db.sqlite", (err) => { if (err) throw err; })
    
    db.all("SELECT * FROM profiles", (err, rows) => {

        if (err) {
            console.log('Couldnt list profiles.')
            closeDatabase(db);
            return res.status(500).send(JSON.stringify(err));
        } else {
            console.log('Listed profiles.')
            closeDatabase(db);
            return res.status(200).send(JSON.stringify(rows));
        }

    });
});

async function closeDatabase(db) {
    console.log('Closing database...')
    return new Promise(resolve => {
        db.close(err => {
            if (err) {
                console.log('Didnt close the database connection.');
                resolve(err);
            } else {
                console.log('Closed the database connection.');
                resolve();
            }
        });
    }); 
}

module.exports = router;
