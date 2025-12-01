import { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { UserFile } from '../types';

export const useFileManager = (userId: string | undefined) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Fetch files in real-time
  useEffect(() => {
    if (!userId) {
      setFiles([]);
      setLoadingFiles(false);
      return;
    }

    const filesRef = collection(db, 'users', userId, 'files');
    // Fetch files ordered by creation date descending (newest first)
    const q = query(filesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFiles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserFile[];
      setFiles(fetchedFiles);
      setLoadingFiles(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const uploadFile = async (file: File, userNotes: string = '') => {
    if (!userId) throw new Error("User not authenticated");
    
    setUploading(true);
    try {
      // 1. Upload to Storage
      // Path: user_uploads/{uid}/{fileName}
      // Note: Using file.name directly. In a production app, you might want to sanitize this or add a timestamp to prevent overwrites.
      const storageRef = ref(storage, `user_uploads/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Save Metadata to Firestore
      await addDoc(collection(db, 'users', userId, 'files'), {
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
      // 1. Delete from Storage
      const storageRef = ref(storage, `user_uploads/${userId}/${fileName}`);
      await deleteObject(storageRef).catch(err => {
         console.warn("File might not exist in storage, proceeding to delete DB record.", err);
      });

      // 2. Delete from Firestore
      await deleteDoc(doc(db, 'users', userId, 'files', fileId));
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  return { files, uploadFile, deleteFile, uploading, loadingFiles };
};
