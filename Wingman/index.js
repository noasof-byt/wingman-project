var express = require("express");
var bodyParser = require("body-parser");
const app = express();
const port = 3000;
const path = require('path');
const sql = require('./db/db');
const cookieParser = require("cookie-parser");
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const translations = {//תרגום שמות המגמות מאנגלית לעברית כדי שנוכל להציג אותן בעברית בטבלת המפקד ובתוצאות
    megamalimud: {
        'politics': 'פוליטיקה',
        'sys_men': 'ניהול מערכות מידע',
        'comp_sc': 'מדמ"ח',
        'economics': 'כלכלה'
    },
    megamatisa: {
        'krav': 'קרב',
        'nav_krav': 'נווטי קרב',
        'tovala': 'תובלה',
        'nav_tovala': 'נווטי תובלה',
        'mechonenim': 'מכוננים',
        'mesokim': 'מסוקים'
    },
    traits: {
        'אחריות אישית': 'responsibility',
        'סדר וארגון': 'organization',
        'יוזמה': 'initiative',
        'יצירתיות': 'creativity',
        'עבודה מול אנשים': 'socialSkill',
        'עבודה מול גורמים פיקודיים': 'commWork',
        'זמן השקעה שבועי': 'weeklyTime',
        'עמידה מול קהל': 'publicSpeaking',
        'עבודת צוות': 'teamWork',
        'אסרטיביות': 'assertiveness',
        'מנהיגות': 'leadership',
        'תכנון קדימה': 'forwardThinking'
    }
};

app.get('/', (req, res) => {//פתיחת עמוד התחברות בכניסה לאתר
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.HTML'));
});

app.post('/signup', (req, res) => {//תהליך רישום משתמש חדש
    const { fullname, email, username, role, commname, password } = req.body;//שליפת נתונים מהטופס

    let dbCommander;//אם המשתמש הוא מפקד או לא בחר מפקד
    if (role === 'commander') {
        dbCommander = null;
    } else if (commname === "" || !commname) {
        dbCommander = null;
    } else {
        dbCommander = commname;
    }

    const checkQuery = "SELECT * FROM users WHERE personal_id = ?";//בדיקה האם המשתמש כבר קיים במערכת
    sql.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.log(err);
            return res.send('<script>alert("שגיאת שרת בבדיקת נתונים"); window.history.back();</script>');
        }

        if (results.length > 0) {//אם המשתמש קיים
            return res.send('<script>alert("המספר האישי הזה כבר קיים במערכת! נסה להתחבר."); window.location.href="/html/login.HTML";</script>');
        }

        const insertQuery = `INSERT INTO users (personal_id, full_name, email, password, role, commander_id) VALUES (?, ?, ?, ?, ?, ?)`;//אם המשתמש חדש
        sql.query(insertQuery, [username, fullname, email, password, role, dbCommander], (err, result) => {
            if (err) {
                console.log(err);
                res.send('<script>alert("שגיאה בהרשמה: ' + err.sqlMessage + '"); window.history.back();</script>');
            } else {
                res.send('<script>alert("נרשמת בהצלחה! כעת ניתן להתחבר."); window.location.href="/html/login.HTML";</script>');
            }
        });
    });
});

app.get('/get-commanders', (req, res) => {//שליפת המפקדים
    sql.query("SELECT personal_id, full_name FROM users WHERE role = 'commander'", (err, results) => {
        if (err) {
            res.json([]);
        } else {
            res.json(results);
        }
    });
});

app.post('/login', (req, res) => {//תהליך התחברות למערכת
    const { email, username, password } = req.body;//שליפת נתונים מהטופס

    const query = "SELECT * FROM users WHERE email = ? AND personal_id = ?";//בדיקה האם קיים משתמש עם אימייל ומספר אישי כזה
    sql.query(query, [email, username], (err, results) => {
        if (err) {
            console.log("Login error:", err);
            return res.send('<script>alert("שגיאת שרת בהתחברות. נסה שוב."); window.history.back();</script>');
        }

        if (results.length === 0) {//אם לא נמצא משתמש
            return res.send('<script>alert("מספר אישי או אימייל שגויים. נסה שוב"); window.history.back();</script>');
        }

        const user = results[0];
        if (user.password !== password) {//אם המשתמש קיים אך הסיסמה שגויה
            return res.send('<script>alert("הסיסמה שגויה! נסה שוב."); window.history.back();</script>');
        }
        res.cookie('userId', user.personal_id, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
        if (user.role === 'cadet') {//העברה לדף המתאים לפי תפקיד
            // בדיקה האם החניך כבר מילא שאלון בעבר
            sql.query("SELECT cadet_id FROM cadet_profiles WHERE cadet_id = ?", [user.personal_id], (err, profileResults) => {
                if (!err && profileResults.length > 0) {
                    res.redirect(`/results/${user.personal_id}`);
                } else {
                    res.redirect('/html/Chanichim.HTML');
                }
            });
        }
        else if (user.role === 'commander') {
            res.redirect('/html/Mefeked.HTML');
        }
    });
});

app.get('/results/:id', (req, res) => {
    const userId = req.params.id;

    // שליפת שם ופרטי המשתמש
    const sqlQuery = `
        SELECT u.full_name, p.* FROM users u
        JOIN cadet_profiles p ON u.personal_id = p.cadet_id
        WHERE u.personal_id = ?
    `;

    sql.query(sqlQuery, [userId], (err, results) => {
        if (err) {
            console.log("Database error:", err);
            res.status(500).send("שגיאה בבסיס הנתונים");
            return;
        }

        else if (results.length === 0) {
            res.status(400).send("לא נמצאו נתונים לחניך זה");
            return;
        }

        const data = results[0];

        fs.readFile(path.join(__dirname, 'public', 'html', 'results.HTML'), 'utf8', (err, html) => {
            if (err) {
                console.log("Error reading HTML template:", err);
                return res.send("שגיאה בטעינת הדף");
            }

            const parseList = (jsonStr) => {
                try {
                    //טיפול במקרים שזה כבר מערך או סטרינג
                    if (Array.isArray(jsonStr)) return jsonStr.join(', ');
                    const arr = JSON.parse(jsonStr || "[]");
                    return Array.isArray(arr) ? arr.join(', ') : arr;
                } catch (e) { return jsonStr; }
            };

            // יצירת שורות לטבלת הציונים
            let scoresHtml = `
                <tr><td>אחריות אישית</td><td>${data.score_responsibility}</td></tr>
                <tr><td>סדר וארגון</td><td>${data.score_organization}</td></tr>
                <tr><td>יוזמה</td><td>${data.score_initiative}</td></tr>
                <tr><td>יצירתיות</td><td>${data.score_creativity}</td></tr>
                <tr><td>עבודה מול אנשים</td><td>${data.score_socialSkill}</td></tr>
                <tr><td>עבודה מול גורמים פיקודיים</td><td>${data.score_commWork}</td></tr>
                <tr><td>זמן השקעה שבועי</td><td>${data.score_weeklyTime}</td></tr>
                <tr><td>עמידה מול קהל</td><td>${data.score_publicSpeaking}</td></tr>
                <tr><td>עבודת צוות</td><td>${data.score_teamWork}</td></tr>
                <tr><td>אסרטיביות</td><td>${data.score_assertiveness}</td></tr>
                <tr><td>מנהיגות</td><td>${data.score_leadership}</td></tr>
                <tr><td>תכנון קדימה</td><td>${data.score_forwardThinking}</td></tr>
            `;

            // הכנסה של הנתונים ל-HTML (החלפה פשוטה כפי שביקשת)
            let finalHtml = html
                .replace('{FULL_NAME}', data.full_name)
                .replace('{MEGAMA_LIMUD}', translations.megamalimud[data.megamalimud] || data.megamalimud)
                .replace('{MEGAMA_TISA}', translations.megamatisa[data.megamatisa] || data.megamatisa)
                .replace('{PREV_JOBS}', parseList(data.previous_jobs))
                .replace('{IMPROVE_QUALITIES}', parseList(data.improve_list))
                .replace('{PREFERRED_JOBS}', parseList(data.preferred_jobs))
                .replace('{SKILLS}', parseList(data.skills))
                .replace('{QUALITIES_ROWS}', scoresHtml);

            res.send(finalHtml);
        });
    });
});

app.get('/api/me', (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    sql.query("SELECT full_name, role FROM users WHERE personal_id = ?", [userId], (err, results) => {//לטובת הסתרת כפתור בדף התוצאות
        if (err || results.length === 0) return res.status(500).json({ error: "User not found" });
        res.json({
            name: results[0].full_name,
            role: results[0].role
        });
    });
});

app.get('/api/check-status', (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) return res.json({ loggedIn: false });

    sql.query("SELECT cadet_id FROM cadet_profiles WHERE cadet_id = ?", [userId], (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        if (results.length > 0) {
            res.json({ filled: true, userId: userId });
        } else {
            res.json({ filled: false });
        }
    });
});

app.get('/api/my-cadets', (req, res) => {//שליפת החניכים של המפקד המחובר
    const commanderId = req.cookies.userId;
    if (!commanderId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    const query = "SELECT * FROM users WHERE role = 'cadet' AND commander_id = ?";
    sql.query(query, [commanderId], (err, results) => {
        if (err) {
            console.log(err);
            return res.json([]);
        }
        res.json(results);
    });
});

app.get('/logout', (req, res) => {//תהליך התנתקות
    res.clearCookie('userId'); //מחיקת הקוקי
    res.redirect('/html/login.HTML'); //חזרה לעמוד התחברות
});

app.get('/api/jobs', (req, res) => {//שליפת כל הקצינויות
    sql.query("SELECT * FROM jobs", (err, result) => {
        if (err) res.status(500).send("Error fetching jobs");
        else res.json(result);
    });
});

app.post('/submit-profile', (req, res) => {
    const cadetId = req.cookies.userId;
    if (!cadetId) return res.status(401).json({ error: "אינך מחובר למערכת" });

    const data = req.body;

    const query = `
        INSERT INTO cadet_profiles 
        (
            cadet_id, megamalimud, megamatisa, 
            previous_jobs, preferred_jobs, skills, improve_list,
            score_responsibility, score_organization, score_initiative, score_creativity,
            score_socialSkill, score_commWork, score_weeklyTime, score_publicSpeaking,
            score_teamWork, score_assertiveness, score_leadership, score_forwardThinking
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            megamalimud=VALUES(megamalimud), megamatisa=VALUES(megamatisa),
            previous_jobs=VALUES(previous_jobs), preferred_jobs=VALUES(preferred_jobs),
            skills=VALUES(skills), improve_list=VALUES(improve_list)
    `;

    const values = [
        cadetId,
        data.megamot?.limud || "-",
        data.megamot?.tisa || "-",
        JSON.stringify(data.previousJobs || []),
        JSON.stringify(data.preferedJobs || []),
        JSON.stringify(data.skills || []),
        JSON.stringify(data.improveQualities || []),

        data.score_responsibility || 0, data.score_organization || 0,
        data.score_initiative || 0, data.score_creativity || 0,
        data.score_socialSkill || 0, data.score_commWork || 0,
        data.score_weeklyTime || 0, data.score_publicSpeaking || 0,
        data.score_teamWork || 0, data.score_assertiveness || 0,
        data.score_leadership || 0, data.score_forwardThinking || 0
    ];

    sql.query(query, values, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ error: "שגיאה בשמירת הנתונים" });
        }

        // החזרת תשובה ללקוח כדי שהוא יבצע את המעבר
        res.status(200).json({
            message: "נשמר בהצלחה",
            redirectUrl: `/results/${cadetId}`
        });
    });
});

app.get('/api/commander/my-cadets', (req, res) => {//שליפת חניכים להצגה בטבלת המפקד וחישוב תפקידים מומלצים ומאתגרים באמצעות אלגוריתם
    const commanderId = req.cookies.userId;
    if (!commanderId) return res.status(401).send("אינך מחובר");

    sql.query("SELECT * FROM jobs", (err, jobsResults) => {//שליפת כל הקצינויות
        if (err) return res.status(500).send("שגיאה בשליפת קצינויות");

        const allJobs = jobsResults;

        const jobsMap = {};//יצירת מילון התרגום כדי שנוכל לעבור בין שמות בעברית ובאנגלית
        allJobs.forEach(j => jobsMap[j.id] = j.title);

        const queryCadets = `
            SELECT u.personal_id, u.full_name, p.* FROM users u
            LEFT JOIN cadet_profiles p ON u.personal_id = p.cadet_id
            WHERE u.role = 'cadet' AND u.commander_id = ?
        `;//שליפת החניכים של המפקד עם גויין שמאלי כדי שיוצג החניך גם אם עדיין לא מילא טופס

        sql.query(queryCadets, [commanderId], (err, cadetsResults) => {
            if (err) return res.status(500).send("שגיאה בשליפת חניכים");

            const dashboardData = cadetsResults.map(cadet => {
                if (!cadet.cadet_id) {//אם החניך רשום אך טרם מילא טופס
                    return {
                        personal_id: cadet.personal_id,
                        name: cadet.full_name,
                        filled: false,
                        megama_tisa: "-",
                        megama_limud: "-"
                    };
                }

                //פונקציה לפענוח בטוח של ה-JSON כדי למנוע קריסה
                const safeJson = (str) => {
                    if (!str) return [];
                    try {
                        if (Array.isArray(str)) return str;
                        const res = JSON.parse(str);
                        return Array.isArray(res) ? res : [res];
                    } catch (e) {
                        return [str];
                    }
                };

                let improveList = safeJson(cadet.improve_list);//חזרה למערכים
                let prevJobs = safeJson(cadet.previous_jobs);
                let prefJobs = safeJson(cadet.preferred_jobs); // שימוש בשם העמודה בבסיס הנתונים

                // המרה לשמות ואיחוד למחרוזת
                let prevJobsNames = prevJobs.map(id => jobsMap[id] || id).join(', ');
                const prefJobsNames = prefJobs.map(id => jobsMap[id] || id);

                const tisaHebrew = translations.megamatisa[cadet.megamatisa] || cadet.megamatisa;
                const limudHebrew = translations.megamalimud[cadet.megamalimud] || cadet.megamalimud;

                const comparisons = [//הגדרת דירוג החניך לתכונה על עצמו ודירוג המפקד לתכונה נדרשת עבור הקצינות
                    { c: 'score_responsibility', j: 'req_responsibility' },
                    { c: 'score_organization', j: 'req_organization' },
                    { c: 'score_initiative', j: 'req_initiative' },
                    { c: 'score_creativity', j: 'req_creativity' },
                    { c: 'score_socialSkill', j: 'req_socialSkill' },
                    { c: 'score_commWork', j: 'req_commWork' },
                    { c: 'score_weeklyTime', j: 'req_weeklyTime' },
                    { c: 'score_publicSpeaking', j: 'req_publicSpeaking' },
                    { c: 'score_teamWork', j: 'req_teamWork' },
                    { c: 'score_assertiveness', j: 'req_assertiveness' },
                    { c: 'score_leadership', j: 'req_leadership' },
                    { c: 'score_forwardThinking', j: 'req_forwardThinking' }
                ];

                const scoredJobs = allJobs.map(job => {//חישוב ציון התאמה לכל קצינות
                    let diff = 0;
                    comparisons.forEach(item => {
                        diff += Math.abs((cadet[item.c] || 0) - (job[item.j] || 0));
                    });

                    return {
                        title: job.title,
                        totalDiff: diff,
                        isChallenging: checkIsChallenging(job, improveList)
                    };
                });

                scoredJobs.sort((a, b) => a.totalDiff - b.totalDiff);//סידור לפי רמת התאמה

                const recJobs = scoredJobs.slice(0, 2); //השתיים עם ההפרש הכי קטן בין דירוג החניך לבין דירוג הקצינות הם שתי הקצינויות המומלצות
                const challengeJobs = scoredJobs.filter(j => j.isChallenging).slice(0, 2);//סינון שתי הקצינויות שקיבלו כן בבחינת האתגר בפונקצית העזר

                //טיפול במקרה שאין מספיק מומלצים/מאתגרים
                const finalChal1 = challengeJobs[0]?.title || (scoredJobs[2]?.title || '-');
                const finalChal2 = challengeJobs[1]?.title || (scoredJobs[3]?.title || '-');

                return {
                    personal_id: cadet.personal_id,
                    name: cadet.full_name,
                    filled: true,
                    megama_tisa: tisaHebrew,
                    megama_limud: limudHebrew,
                    previous: prevJobsNames || '-', //מונע מקף אם יש ערך
                    rec1: recJobs[0]?.title || '-',
                    rec2: recJobs[1]?.title || '-',
                    chal1: finalChal1,
                    chal2: finalChal2,
                    pref1: prefJobsNames[0] || '-',
                    pref2: prefJobsNames[1] || '-',
                    pref3: prefJobsNames[2] || '-'
                };
            });

            res.json(dashboardData);
        });
    });
});

function checkIsChallenging(job, improveList) {
    if (!improveList || !Array.isArray(improveList)) return false;

    return improveList.some(traitHebrew => {//תרגום
        const traitEnglish = translations.traits[traitHebrew];
        return traitEnglish && job['req_' + traitEnglish] >= 7;
    });
};
//בודקת האם ברשימת התכונות לשיפור של החניך יש תכונה שהתפקיד דורש בה ציון 7 ומעלה
//תפקיד זה מדורג גבוה בתכונה חלשה של החניך ועל כן יאלץ אותו לעבוד על החולשות שלו

app.delete('/api/jobs/:id', (req, res) => {//מחיקת קצינות עם דליט
    sql.query("DELETE FROM jobs WHERE id = ?", [req.params.id], (err) => {
        if (err) res.status(500).json({ error: "Error deleting" });
        else res.json({ message: "Deleted" });
    });
});

app.put('/api/jobs/:id', (req, res) => {//עריכת קצינות עם פוט
    const q = req.body.qualities;
    const query = `UPDATE jobs SET req_responsibility=?, req_organization=?, req_initiative=?, req_creativity=?,
    req_socialSkill=?, req_commWork=?, req_weeklyTime=?, req_publicSpeaking=?, req_teamWork=?, req_assertiveness=?,
    req_leadership=?, req_forwardThinking=? WHERE id = ?`;

    const values = [
        q.req_responsibility, q.req_organization, q.req_initiative, q.req_creativity,
        q.req_socialSkill, q.req_commWork, q.req_weeklyTime,
        q.req_publicSpeaking, q.req_teamWork, q.req_assertiveness, q.req_leadership, q.req_forwardThinking,
        req.params.id
    ];

    sql.query(query, values, (err) => {
        if (err) res.status(500).json({ error: "Error updating" });
        else res.json({ message: "Updated" });
    });
});

app.post('/api/jobs', (req, res) => {//הוספת קצינות עם פוסט
    const d = req.body;
    const q = d.qualities;

    const query = `INSERT INTO jobs (title, description, req_responsibility, req_organization, req_initiative,
    req_creativity, req_socialSkill, req_commWork, req_weeklyTime, req_publicSpeaking, req_teamWork, req_assertiveness,
    req_leadership, req_forwardThinking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        d.title, d.description,
        q.req_responsibility, q.req_organization, q.req_initiative, q.req_creativity,
        q.req_socialSkill, q.req_commWork, q.req_weeklyTime,
        q.req_publicSpeaking, q.req_teamWork, q.req_assertiveness, q.req_leadership, q.req_forwardThinking
    ];

    sql.query(query, values, (err) => {
        if (err) { console.log(err); res.status(500).json({ error: "Error adding job" }); }
        else res.json({ message: "Job added" });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});