import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { STATUS } from '../data/constants';

const reportsCollection = collection(db, 'reports');

export const createReport = async ({ title, description, category, subcategory, departamento, barrio, user }) => {
  const docRef = await addDoc(reportsCollection, {
    title,
    description,
    category,
    subcategory: subcategory || null,
    departamento,
    barrio: barrio || null,
    status: STATUS.ABIERTO,
    userId: user.uid,
    userName: user.displayName || user.email,
    upvotes: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const listReports = async ({ category, departamento } = {}) => {
  const constraints = [orderBy('createdAt', 'desc')];
  if (category) constraints.unshift(where('category', '==', category));
  if (departamento) constraints.unshift(where('departamento', '==', departamento));

  const snapshot = await getDocs(query(reportsCollection, ...constraints));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const listReportsByUser = async (userId) => {
  const snapshot = await getDocs(
    query(reportsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getReport = async (id) => {
  const snapshot = await getDoc(doc(db, 'reports', id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const deleteReport = (id) => deleteDoc(doc(db, 'reports', id));

export const updateReportStatus = (id, status) => updateDoc(doc(db, 'reports', id), { status });

export const toggleUpvote = async (id, userId, hasUpvoted) => {
  await updateDoc(doc(db, 'reports', id), {
    upvotes: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId),
  });
};
