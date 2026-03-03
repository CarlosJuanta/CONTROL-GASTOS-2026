import { db } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  limit,
  orderBy
} from "firebase/firestore";

// Crear ciclo inicial
export const createNewCycle = async (userId, data) => {
  try {
    const cycleData = {
      userId,
      montoInicial: parseFloat(data.monto),
      diasTotales: parseInt(data.dias),
      fechaInicio: data.fechaInicio,
      baseDiariaFija: parseFloat(data.monto) / parseInt(data.dias),
      estado: "activo",
      createdAt: serverTimestamp()
    };
    return await addDoc(collection(db, "ciclos"), cycleData);
  } catch (error) {
    console.error("Error creando ciclo:", error);
    throw error;
  }
};

// Obtener ciclo activo
export const getActiveCycle = async (userId) => {
  const q = query(
    collection(db, "ciclos"), 
    where("userId", "==", userId), 
    where("estado", "==", "activo"),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  }
  return null;
};

// Suscribirse a transacciones (gastos e ingresos)
export const subscribeToExpenses = (cycleId, callback) => {
  const q = query(
    collection(db, "gastos"),
    where("cycleId", "==", cycleId)
  );
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(expenses);
  });
};

// Registrar Transacción (Gasto o Ingreso Extra)
export const addTransaction = async (cycleId, data) => {
  try {
    return await addDoc(collection(db, "gastos"), {
      cycleId,
      monto: parseFloat(data.monto),
      motivo: data.motivo,
      metodo: data.metodo,
      fecha: data.fecha,
      tipo: data.tipo, // "gasto" o "ingreso"
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al registrar transacción:", error);
    throw error;
  }
};

// Eliminar Transacción
export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, "gastos", expenseId));
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
};