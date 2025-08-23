// Script pou efase tout QCM yo nan koleksyon Firestore 'examens' otomatikman
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Modify chemen si sa nesesè

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function efaseToutQCM() {
  const examensSnap = await db.collection('examens').get();
  for (const docSnap of examensSnap.docs) {
    const data = docSnap.data();
    if (Array.isArray(data.questions)) {
      // Retire tout QCM yo
      const sanQCM = data.questions.filter(q => q.type !== 'qcm');
      await db.collection('examens').doc(docSnap.id).update({ questions: sanQCM });
      console.log(`Tout QCM efase pou: ${docSnap.id}`);
    }
  }
  console.log('Tout QCM efase nan Firestore!');
}

efaseToutQCM().catch(console.error);
