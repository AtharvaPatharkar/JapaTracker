import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { authState, Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL, } from '@angular/fire/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  authState$ = authState(this.auth);
  
  // 👤 Centralized reactive profile state
  userProfile = signal<any | null>(null);
  loadingProfile = signal<boolean>(true);
  private unsubscribeProfileListener: (() => void) | null = null;

  constructor() {
    setPersistence(this.auth, browserLocalPersistence);
    this.initializeProfileListener();
  }

  private initializeProfileListener() {
    // Synchronously load cache on start to prevent layout pop
    const cached = localStorage.getItem('user_profile_data');
    if (cached) {
      try {
        this.userProfile.set(JSON.parse(cached));
        this.loadingProfile.set(false);
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        if (this.unsubscribeProfileListener) {
          this.unsubscribeProfileListener();
        }

        // Establish real-time Firestore listener for profile updates
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        this.unsubscribeProfileListener = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const profile = {
              uid: user.uid,
              email: user.email,
              ...data
            };
            this.userProfile.set(profile);
            localStorage.setItem('user_profile_data', JSON.stringify(profile));
          } else {
            // Profile doesn't exist yet (new registration)
            const profile = {
              uid: user.uid,
              email: user.email
            };
            this.userProfile.set(profile);
          }
          this.loadingProfile.set(false);
        }, (err) => {
          console.error("Profile sync error:", err);
          this.loadingProfile.set(false);
        });
      } else {
        // Logged out
        if (this.unsubscribeProfileListener) {
          this.unsubscribeProfileListener();
          this.unsubscribeProfileListener = null;
        }
        this.userProfile.set(null);
        localStorage.removeItem('user_profile_data');
        this.loadingProfile.set(false);
      }
    });
  }

  // =========================
  // ✅ REGISTER (WITH createdAt)
  // =========================
  async register(user: any): Promise<boolean> {
    try {
      const cred = await createUserWithEmailAndPassword(
        this.auth,
        user.email.trim(),
        user.password
      );

      const uid = cred.user.uid;

      await setDoc(doc(this.firestore, `users/${uid}`), {
        name: user.name,
        email: user.email,
        role: 'user',
        profileImage: "",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        deletedAt: null
      });

      console.log("Register + Profile Saved ✅");
      return true;

    } catch (err: any) {
      console.log(err);
      throw err;
    }
  }

  // =========================
  // ✅ LOGIN (WITH 30 DAYS LOGIC + FIX)
  // =========================
  async login(email: string, password: string): Promise<{ success: boolean, error?: string }> {
    try {
      const cred = await signInWithEmailAndPassword(
        this.auth,
        email.trim(),
        password
      );

      const profile = await this.getUserProfile();

      // 🔥 check deleted account
      if (profile?.['deletedAt']) {

        const deletedDate = new Date(profile['deletedAt']);
        const now = new Date();

        const diffDays =
          (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24);

        // ✅ restore within 30 days
        if (diffDays <= 30) {

          await this.updateUser({
            deletedAt: null,
            lastActive: new Date().toISOString()
          });

          return { success: true };
        } else {

          // ❌ permanent delete after 30 days
          await cred.user.delete();

          return {
            success: false,
            error: 'account-deleted'
          };
        }
      }

      // 🔥 normal login update
      await this.updateUser({
        lastActive: new Date().toISOString()
      });

      console.log("Login Success");

      return { success: true };

    } catch (err: any) {

      console.log("Login Error:", err.code);

      return {
        success: false,
        error: err.code
      };
    }
  }

  // =========================
  // ✅ LOGOUT
  // =========================
  // auth.ts

  async logout() {
    const user = this.auth.currentUser;

    // ✅ clear session and cached user profile
    localStorage.removeItem('active_japa_session');
    localStorage.removeItem('user_profile_data');
    this.setGuestMode(false);

    if (this.unsubscribeProfileListener) {
      this.unsubscribeProfileListener();
      this.unsubscribeProfileListener = null;
    }
    this.userProfile.set(null);

    await signOut(this.auth);
  }

  // =========================
  // ✅ CURRENT USER (Firebase)
  // =========================
  getCurrentUser() {
    return this.auth.currentUser;   // 🔥 Firebase user
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error("User not found");

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      console.error("Password change error:", error);
      throw error;
    }

  }

  // =========================
  // ✅ CURRENT USER (Combined Auth + Firestore)
  // =========================


  async getCurrentUserAsync(): Promise<any> {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(this.auth, async (user) => {
        unsub();

        if (user) {
          try {
            const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
            const profileData = userDoc.exists() ? userDoc.data() : {};

            resolve({
              uid: user.uid,
              email: user.email,
              ...profileData
            });
          } catch (e) {
            console.error("Profile fetch error:", e);
            resolve(user);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // =========================
  // 📿 SAVE JAPA DATA
  // =========================
  // async saveJapa(data: any) {

  //   const user = await this.getCurrentUserAsync();

  //   if (!user) {
  //     alert("⚠️ Login required to save japa");
  //     return;
  //   }

  //   const ref = collection(this.firestore, `users/${user.uid}/japa`);

  //   await addDoc(ref, {
  //     ...data,
  //     createdAt: new Date().toISOString()
  //   });

  //   console.log("✅ Japa Saved");
  // }


  // // =========================
  // // 📊 GET JAPA DATA
  // // =========================
  // getJapaRealtime(callback: (data: any[]) => void) {

  //   const user = this.auth.currentUser;
  //   if (!user) return;

  //   const ref = collection(this.firestore, `users/${user.uid}/japa`);

  //   return onSnapshot(ref, (snapshot) => {

  //     const data = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     }));

  //     callback(data);
  //   });
  // }


  // =========================
  // ✅ GET ALL JAPA
  // =========================

  // १. जपा डेटा मिळवण्यासाठी (Real-time)
  getMyJapaRealtime(callback: (data: any[]) => void) {
    const user = this.auth.currentUser;

    if (!user) {
      console.log("User not logged in");
      return () => { };
    }
    const ref = collection(this.firestore, `users/${user.uid}/japa`);

    return onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("🔥 LIVE JAPA:", data);
      callback(data);
    });
  }


  async saveJapa(data: any) {
    const user = await this.getCurrentUserAsync();
    if (!user) return;

    const ref = collection(this.firestore, `users/${user.uid}/japa`);

    await addDoc(ref, {
      ...data,
      uid: user.uid,
      createdAt: data.date || new Date().toISOString()
    });
  }


  // =========================
  // ✅ UPDATE JAPA
  // =========================
  async updateJapa(id: string, data: any) {
    await setDoc(doc(this.firestore, `japaLogs/${id}`), data, { merge: true });
  }

  // =========================
  // ✅ DELETE JAPA
  // =========================
  // async deleteJapa(id: string) {
  //   await deleteDoc(doc(this.firestore, `japaLogs/${id}`));
  // }

  // ✅ DELETE JAPA (Correct Path)
  async deleteJapa(id: string) {
    const user = this.auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(this.firestore, `users/${user.uid}/japa/${id}`));
  }


  // =========================
  // 📅 DAILY QUESTS (Firebase)
  // =========================

  async getDailyQuests() {

    const user = this.auth.currentUser;
    if (!user) return null;

    const today = new Date().toDateString();

    const ref = doc(
      this.firestore,
      `users/${user.uid}/dailyQuests/${today}`
    );

    const snap = await getDoc(ref);

    return snap.exists() ? snap.data() : null;
  }

  async saveDailyQuests(data: any) {

    const user = this.auth.currentUser;
    if (!user) return;

    const today = new Date().toDateString();

    const ref = doc(
      this.firestore,
      `users/${user.uid}/dailyQuests/${today}`
    );

    await setDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  // =========================
  // 🏆 ACHIEVEMENTS (Firebase)
  // =========================
  async getAchievements() {

    const user = this.auth.currentUser;
    if (!user) return {};

    try {
      const ref = doc(this.firestore, `users/${user.uid}/achievements/data`);
      const snap = await getDoc(ref);

      return snap.data() || {};

    } catch (err) {
      console.log("Achievements Fetch Error", err);
      return {};
    }
  }

  async saveAchievements(data: any) {

    const user = this.auth.currentUser;
    if (!user) return;

    const ref = doc(this.firestore, `users/${user.uid}/achievements/data`);

    await setDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }


  // =========================
  // 👤 UPDATE USER PROFILE (Firebase)
  // =========================

  async getUserProfile() {
    const profile = this.userProfile();
    if (profile) return profile;

    const user = this.auth.currentUser;
    if (!user) return null;

    const snap = await getDoc(
      doc(this.firestore, `users/${user.uid}`)
    );

    return snap.exists() ? snap.data() : null;
  }

  async updateUser(updatedUser: any) {

    const user = this.auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(this.firestore, `users/${user.uid}`),
      {
        ...updatedUser,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }

  async uploadProfileImage(base64: string): Promise<string> {

    const user = this.auth.currentUser;
    if (!user) throw new Error("User not logged in");

    // 🔥 unique path
    const filePath = `users/${user.uid}/profile.jpg`;

    const storageRef = ref(this.storage, filePath);

    // 🔥 upload base64
    await uploadString(storageRef, base64, 'data_url');

    // 🔥 get URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  }


  // =========================
  // 👤 Admin Login (Firebase)
  // =========================

  getAllUsersRealtime(callback: (users: any[]) => void) {

    const usersRef = collection(this.firestore, 'users');

    return onSnapshot(usersRef, (snapshot) => {

      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      console.log("🔥 LIVE USERS:", users);

      callback(users);
    });
  }

  async adminDeleteUser(uid: string) {

    await deleteDoc(doc(this.firestore, `users/${uid}`));

    const ref = collection(this.firestore, `users/${uid}/japa`);
    const snap = await getDocs(ref);

    const promises = snap.docs.map(d =>
      deleteDoc(doc(this.firestore, `users/${uid}/japa/${d.id}`))
    );

    await Promise.all(promises);
  }


  async isAdmin(): Promise<boolean> {
    const profile = await this.getUserProfile();

    return profile?.['role'] === 'admin';
  }

  setGuestMode(status: boolean) {
    if (status) {
      localStorage.setItem('isGuest', 'true');
    } else {
      localStorage.removeItem('isGuest');
    }
  }

  isGuestMode(): boolean {
    return localStorage.getItem('isGuest') === 'true';
  }

}