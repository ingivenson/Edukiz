// Script pou netwaye tout QCM yo nan koleksyon Firestore 'examens'
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Modifye chemen si sa nesesè

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanAllQCM() {
  const examensSnap = await db.collection('examens').get();
  for (const docSnap of examensSnap.docs) {
    const data = docSnap.data();
    let changed = false;
    if (Array.isArray(data.questions)) {
      data.questions = data.questions.map(q => {
        if (q.type === 'qcm' && Array.isArray(q.choix)) {
          // Retire etikèt (let/chif romen) nan chwa yo
          q.choix = q.choix.map(ch =>
            ch.replace(/^[a-z]\)\s*|^[ivxlc]+\)\s*/i, '').trim()
          );
          // Asire reponsKorek se endis sèlman
          if (typeof q.reponsKorek === 'string') {
            q.reponsKorek = q.reponsKorek
              .split(',')
              .map(rep => rep.trim())
              .map(rep => {
                const idx = 'abcdefghijklmnopqrstuvwxyz'.indexOf(rep.toLowerCase());
                return idx >= 0 ? String(idx) : rep;
              })
              .join(',');
          }
          changed = true;
        }
        return q;
      });
    }
    if (changed) {
      await db.collection('examens').doc(docSnap.id).update({ questions: data.questions });
      console.log(`Netwaye: ${docSnap.id}`);
    }
  }
  console.log('Tout QCM yo netwaye nan Firestore!');
}

cleanAllQCM().catch(console.error);
