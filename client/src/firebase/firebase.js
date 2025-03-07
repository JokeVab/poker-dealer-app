import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC7qfNJDF-_K0yVGWNgBP54zxlkBtkS15A",
  authDomain: "poker-dealer-app.firebaseapp.com",
  projectId: "poker-dealer-app",
  storageBucket: "poker-dealer-app.firebasestorage.app",
  messagingSenderId: "171291089487",
  appId: "1:171291089487:web:0988a6b5db88e2924b283a",
  measurementId: "G-XDGJ0X24TD"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Функции для работы с комнатами
export const createRoomInFirebase = async (roomData) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const docRef = await addDoc(roomsRef, {
      ...roomData,
      created_at: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const getRoomById = async (roomId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      return { id: roomSnap.id, ...roomSnap.data() };
    } else {
      throw new Error('Room not found');
    }
  } catch (error) {
    console.error('Error getting room:', error);
    throw error;
  }
};

export const updateRoomPlayers = async (roomId, players) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { players });
  } catch (error) {
    console.error('Error updating room players:', error);
    throw error;
  }
};

export const subscribeToRoom = (roomId, callback) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

export { db, storage }; 