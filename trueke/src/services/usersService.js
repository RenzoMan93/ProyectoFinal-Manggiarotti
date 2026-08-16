import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function ensureUserProfile(uid, { email }) {
  await setDoc(
    doc(db, 'users', uid),
    {
      email,
      verificationStatus: 'unverified',
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function savePersonalData(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Stores the uploaded KYC documents/selfie and flips the profile into
 * "pending" review. Real identity verification (document authenticity,
 * face match) requires a third-party KYC vendor (Onfido, Veriff, AWS
 * Rekognition, etc.) — see functions/index.js `reviewKycSubmission` for the
 * stubbed extension point that would call one.
 */
export async function submitKycDocuments(uid, { docFrontUrl, docBackUrl, selfieUrl }) {
  await updateDoc(doc(db, 'users', uid), {
    docFrontUrl,
    docBackUrl,
    selfieUrl,
    verificationStatus: 'pending',
    kycSubmittedAt: serverTimestamp(),
  });
}
