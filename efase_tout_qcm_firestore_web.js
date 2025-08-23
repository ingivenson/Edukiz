// Script pou efase tout QCM yo nan koleksyon Firestore 'examens' otomatikman (version web SDK)
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

async function efaseToutQCM() {
  const examensSnap = await getDocs(collection(db, 'examens'));
  for (const docSnap of examensSnap.docs) {
    const data = docSnap.data();
    if (Array.isArray(data.questions)) {
      // Retire tout QCM yo
      const sanQCM = data.questions.filter(q => q.type !== 'qcm');
      await updateDoc(doc(db, 'examens', docSnap.id), { questions: sanQCM });
      console.log(`Tout QCM efase pou: ${docSnap.id}`);
    }
  }
  console.log('Tout QCM efase nan Firestore!');
}

efaseToutQCM().catch(console.error);