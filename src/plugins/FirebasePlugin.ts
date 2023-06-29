import Phaser from 'phaser'
import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    Firestore,
    getDoc,
    setDoc,
    doc,
    DocumentSnapshot,
    collection,
    addDoc,
    orderBy,
    limit,
    getDocs,
    query,
} from 'firebase/firestore'
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    Auth,
    signInWithEmailAndPassword,
    Unsubscribe,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    browserPopupRedirectResolver
} from 'firebase/auth'

const firebaseConfig = {
    //apiKey: 'AIzaSyAF_Wawq4by-Rza3On2GbHV4TpyV2jyibg',
    apiKey: 'AIzaSyAF_Wawq4by-Rza3On2GbHV4TpyV2jyiba',
    authDomain: 'dunk-shot-phaser.firebaseapp.com',
    projectId: 'dunk-shot-phaser',
    storageBucket: 'dunk-shot-phaser.appspot.com',
    messagingSenderId: '275371751196',
    appId: '1:275371751196:web:b2c651cdcc12ee3c282cd9',
    measurementId: 'G-Y9XG2WQM39',
}

export default class FirebasePlugin extends Phaser.Plugins.BasePlugin {
    private readonly db: Firestore
    private readonly auth: Auth
    private authStateChangedUnsubscribed: Unsubscribe
    private onLoggedInCallback?: () => void

    constructor(manager: Phaser.Plugins.PluginManager) {
        super(manager)
        const app = initializeApp(firebaseConfig)
        this.db = getFirestore(app)
        this.auth = getAuth(app)

        this.authStateChangedUnsubscribed = onAuthStateChanged(this.auth, (user) => {
            if (user && this.onLoggedInCallback) {
                this.onLoggedInCallback()
            }
        })
    }

    async saveGameData(userId: string, data: { name: string; score: number }) {
        await setDoc(doc(this.db, 'game-data', userId), data)
    }

    async loadGameData(userId: string) {
        const snap = (await getDoc(doc(this.db, 'game-data', userId))) as DocumentSnapshot<{
            name: string
            score: number
        }>
        return snap.data()
    }

    async createUserWithEmail(email: string, password: string) {
        const credentials = await createUserWithEmailAndPassword(this.auth, email, password)
        return credentials.user
    }

    async signInUserWithEmail(email: string, password: string) {
        const credentials = await signInWithEmailAndPassword(this.auth, email, password)
        return credentials.user
    }

    async signInAnonymously() {
        const credentials = await signInAnonymously(this.auth)
    }

    async signInWithPopup() {
        const provider = new GoogleAuthProvider()
        const auth = getAuth()
        signInWithPopup(auth, provider, browserPopupRedirectResolver)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                //const credential = GoogleAuthProvider.credentialFromResult(result)
                return result.user
            })
            .catch((error) => {
                console.log(error)
            })
    }

    public destroy(): void {
        this.authStateChangedUnsubscribed()
        super.destroy()
    }

    public onLoggedIn(callback: () => void): void {
        this.onLoggedInCallback = callback
    }

    public getUser() {
        return this.auth.currentUser
    }

    async addHighScore(name: string, score: number) {
        await addDoc(collection(this.db, 'high-scores'), { name, score })
    }

    async getHighScores() {
        const q = query(collection(this.db, 'high-scores'), orderBy('score', 'desc'), limit(10))
        const snap = await getDocs(q)
        return snap.docs.map((ref) => ref.data())
    }
}
