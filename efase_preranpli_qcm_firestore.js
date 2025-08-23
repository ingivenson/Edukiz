// Script pou efase tout QCM yo nan koleksyon Firestore 'examens' epi ajoute nouvo QCM preranpli ak chif
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Modifye chemen si sa nesesè

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Ranplase ak nouvo QCM ou vle ajoute
const nouvoQCM = [
  {
    type: 'qcm',
    texte: 'Egzanp kesyon QCM 1',
    choix: ['Chwa 1', 'Chwa 2', 'Chwa 3', 'Chwa 4'],
    reponsKorek: '1', // endis chif sèlman
  },
  {
    type: 'qcm',
    texte: 'Egzanp kesyon QCM 2',
    choix: ['Chwa A', 'Chwa B', 'Chwa C', 'Chwa D'],
    reponsKorek: '0,2', // plizyè repons kòrèk
  },
  // ...ajoute plis QCM jan ou vle
];

async function efaseEpiPreranpliQCM() {
  const examensSnap = await db.collection('examens').get();
  for (const docSnap of examensSnap.docs) {
    const data = docSnap.data();
    if (Array.isArray(data.questions)) {
      // Retire tout QCM yo
      data.questions = data.questions.filter(q => q.type !== 'qcm');
      // Ajoute nouvo QCM yo
      data.questions = [...data.questions, ...nouvoQCM];
      await db.collection('examens').doc(docSnap.id).update({ questions: data.questions });
      console.log(`QCM efase epi ranplase pou: ${docSnap.id}`);
    }
  }
  console.log('Tout QCM efase epi ranplase ak nouvo yo!');
}

efaseEpiPreranpliQCM().catch(console.error);
