import { db } from "../firebase/config";
import { 
  collection, addDoc, query, where, getDocs, 
  updateDoc, doc, deleteDoc, onSnapshot, 
  serverTimestamp, limit, orderBy 
} from "firebase/firestore";

export const createNewCycle = async (userId, data) => {
  try {
    return await addDoc(collection(db, "ciclos"), {
      userId,
      montoInicial: parseFloat(data.monto),
      diasTotales: parseInt(data.dias),
      fechaInicio: data.fechaInicio,
      baseDiariaFija: parseFloat(data.monto) / parseInt(data.dias),
      estado: "activo",
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creando ciclo:", error);
    throw error;
  }
};

export const updateCycle = async (cycleId, data) => {
  const cycleRef = doc(db, "ciclos", cycleId);
  return await updateDoc(cycleRef, {
    montoInicial: parseFloat(data.monto),
    diasTotales: parseInt(data.dias),
    fechaInicio: data.fechaInicio,
    baseDiariaFija: parseFloat(data.monto) / parseInt(data.dias)
  });
};

export const closeCycle = async (cycleId) => {
  const cycleRef = doc(db, "ciclos", cycleId);
  return await updateDoc(cycleRef, { estado: "cerrado" });
};

// OBTENER CICLO ACTIVO
export const getActiveCycle = async (userId) => {
  const q = query(collection(db, "ciclos"), where("userId", "==", userId), where("estado", "==", "activo"), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  return null;
};

// --- NUEVA FUNCIÓN: OBTENER HISTORIAL (CERRADOS) ---
export const getClosedCycles = async (userId) => {
  const q = query(
    collection(db, "ciclos"), 
    where("userId", "==", userId), 
    where("estado", "==", "cerrado"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToExpenses = (cycleId, callback) => {
  const q = query(collection(db, "gastos"), where("cycleId", "==", cycleId));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(expenses);
  });
};

export const addTransaction = async (cycleId, data) => {
  return await addDoc(collection(db, "gastos"), {
    cycleId, monto: parseFloat(data.monto), motivo: data.motivo, metodo: data.metodo, fecha: data.fecha, tipo: data.tipo, createdAt: serverTimestamp()
  });
};

export const deleteExpense = async (expenseId) => {
  await deleteDoc(doc(db, "gastos", expenseId));
};