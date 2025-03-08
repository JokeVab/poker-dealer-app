import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDElgxGzJ2xy1WtQZIhbmi5tUweON_Cy-g",
  authDomain: "poker-dealer-app.firebaseapp.com",
  projectId: "poker-dealer-app",
  storageBucket: "poker-dealer-app.appspot.com",
  messagingSenderId: "1073688999574",
  appId: "1:1073688999574:web:16e9b5a3fd2ed30a2f27ef"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Создание комнаты в Firebase
export const createRoomInFirebase = async (roomData) => {
  try {
    const roomsCollection = collection(db, 'rooms');
    const docRef = await addDoc(roomsCollection, roomData);
    console.log('Room created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Обновление списка игроков
export const updateRoomPlayers = async (roomId, players) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { players });
    console.log('Players updated for room:', roomId);
  } catch (error) {
    console.error('Error updating players:', error);
    throw error;
  }
};

// Получение данных комнаты по ID
export const getRoom = async (roomId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (roomDoc.exists()) {
      return { id: roomDoc.id, ...roomDoc.data() };
    } else {
      console.log('No room found with ID:', roomId);
      return null;
    }
  } catch (error) {
    console.error('Error getting room:', error);
    throw error;
  }
};

// Подписка на обновления комнаты
export const subscribeToRoom = (roomId, callback) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

export { db, storage }; 