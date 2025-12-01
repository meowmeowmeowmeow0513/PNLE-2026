import { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, FirestoreError } from 'firebase/firestore';
import { UserFile } from '../types';

export const useFileManager = (userId: string | undefined) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Fetch files in real-time
  useEffect(() => {
    // strict check: if no userId, clear files and stop
    if (!userId) {
      setFiles([]);
      setLoadingFiles(false);
      return;
    }

    const uid = userId; // capture strict string type
    const filesRef = collection(db, 'users', uid, 'files');
    // Fetch files ordered by creation date descending (newest first)
    const q = query(filesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const fetchedFiles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserFile[];
        setFiles(fetchedFiles);
        setLoadingFiles(false);
      },
      (error: FirestoreError) => {
        console.error("Error fetching files:", error);
        setLoadingFiles(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const uploadFile = async (file: File, userNotes: string = '') => {
    if (!userId) throw new Error("User not authenticated");
    
    setUploading(true);
    try {
      // Sanitize filename to prevent path issues
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // 1. Upload to Storage
      // Path: user_uploads/{uid}/{fileName}
      const storageRef = ref(storage, `user_uploads/${userId}/${safeFileName}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Save Metadata to Firestore
      // We use file.name (original) for display, but could use safeFileName for reference if needed
      const filesCollectionRef = collection(db, 'users', userId, 'files');
      
      await addDoc(filesCollectionRef, {
        fileName: file.name,
        downloadUrl,
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        userNotes: userNotes,
        aiSummary: '' 
      });

    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string, fileName: string) => {
    if (!userId) return;

    try {
      // Re-construct the safe filename to match upload logic (simple replacement for now)
      // Ideally, store 'storagePath' in firestore to be 100% sure. 
      // For now, we assume the file name in storage matches the logic above if we used it, 
      // but to match previous logic, we try to delete the exact name first.
      
      // Try to delete with the sanitized name if original fails, or just use original if we didn't sanitize before.
      // Current implementation assumes original name for simplicity unless we migrate DB.
      // Let's stick to the fileName provided.
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // 1. Delete from Storage
      const storageRef = ref(storage, `user_uploads/${userId}/${safeFileName}`);
      
      await deleteObject(storageRef).catch(async (err) => {
         console.warn("File might not exist in storage or name mismatch, trying original name...", err);
         // Fallback: try original name just in case old files exist
         if (safeFileName !== fileName) {
            const oldRef = ref(storage, `user_uploads/${userId}/${fileName}`);
            await deleteObject(oldRef).catch(e => console.warn("Could not delete legacy file", e));
         }
      });

      // 2. Delete from Firestore
      const docRef = doc(db, 'users', userId, 'files', fileId);
      await deleteDoc(docRef);
      
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  return { files, uploadFile, deleteFile, uploading, loadingFiles };
};
