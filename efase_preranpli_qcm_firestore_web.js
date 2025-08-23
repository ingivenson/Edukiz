// Script pou efase tout QCM yo nan koleksyon Firestore 'examens' epi ajoute nouvo QCM preranpli ak chif (version web SDK)
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Configuration Firebase (kopye depi nan config.js)
const firebaseConfig = {
  apiKey: "AIzaSyBiQng4jJWlmlrFBOfQvF14LgpuA3TlzNc",
  authDomain: "konkou-lakay.firebaseapp.com",
  projectId: "konkou-lakay",
  storageBucket: "konkou-lakay.appspot.com",
  messagingSenderId: "995665826821",
  appId: "1:995665826821:web:ce5d2e99ef0ce4730ef86c",
  measurementId: "G-0MV789VHW4"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  const examensSnap = await getDocs(collection(db, 'examens'));
  for (const docSnap of examensSnap.docs) {
    const data = docSnap.data();
    if (Array.isArray(data.questions)) {
      // Retire tout QCM yo
      data.questions = data.questions.filter(q => q.type !== 'qcm');
      // Ajoute nouvo QCM yo
      data.questions = [...data.questions, ...nouvoQCM];
      await updateDoc(doc(db, 'examens', docSnap.id), { questions: data.questions });
      console.log(`QCM efase epi ranplase pou: ${docSnap.id}`);
    }
  }
  console.log('Tout QCM efase epi ranplase ak nouvo yo!');
}

efaseEpiPreranpliQCM().catch(console.error);