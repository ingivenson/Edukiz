import { db } from './src/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import questions from './src/data/questions_konesans_jeneral.json';

async function preranpliKonesansJeneral() {
    try {
        // Kreye yon nouvo dokiman pou kesyon konesans jeneral yo
        const examRef = doc(db, "examens", "konesans_jeneral_preranpli");
        
        await setDoc(examRef, {
            nom: "Konesans Jeneral",
            matiere: "Konesans Jeneral",
            universite: "Edukiz",
            description: "Yon seri kesyon pou teste konesans jeneral ou",
            dateCreation: new Date().toISOString(),
            questions: questions,
            creePa: "System",
            type: "Preranpli"
        });

        console.log("✅ Kesyon konesans jeneral yo preranpli ak siksè!");
    } catch (error) {
        console.error("❌ Erè nan preranplisman:", error);
    }
}

// Ekzekite fonksyon an
preranpliKonesansJeneral();
