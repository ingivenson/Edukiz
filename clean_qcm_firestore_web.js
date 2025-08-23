// Script pou netwaye tout QCM yo nan koleksyon Firestore 'examens' (version web SDK)
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

async function cleanAllQCM() {
  const examensSnap = await getDocs(collection(db, 'examens'));
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
      await updateDoc(doc(db, 'examens', docSnap.id), { questions: data.questions });
      console.log(`Netwaye: ${docSnap.id}`);
    }
  }
  console.log('Tout QCM yo netwaye nan Firestore!');
}

cleanAllQCM().catch(console.error);