
import { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, FirestoreError, getDoc, updateDoc } from 'firebase/firestore';
import { UserFile, UserFolder } from '../types';

export const useFileManager = (userId: string | undefined) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Home'}]);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  // Fetch Folders & Files based on currentFolderId
  useEffect(() => {
    if (!userId) {
      setFiles([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const uid = userId;

    // 1. Fetch Folders
    const foldersRef = collection(db, 'users', uid, 'folders');
    const foldersQuery = query(foldersRef, where('parentId', '==', currentFolderId));
    
    // 2. Fetch Files
    const filesRef = collection(db, 'users', uid, 'files');
    const filesQuery = query(filesRef, where('folderId', '==', currentFolderId));

    const unsubFolders = onSnapshot(foldersQuery, (snapshot) => {
        const fetchedFolders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserFolder[];
        setFolders(fetchedFolders);
    });

    const unsubFiles = onSnapshot(filesQuery, (snapshot) => {
        const fetchedFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserFile[];
        setFiles(fetchedFiles);
        setLoading(false);
    }, (error: FirestoreError) => {
        console.error("Error fetching data:", error);
        setLoading(false);
    });

    return () => {
        unsubFolders();
        unsubFiles();
    };
  }, [userId, currentFolderId]);

  // Navigate Logic
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateUp = (targetFolderId: string | null) => {
    const index = breadcrumbs.findIndex(b => b.id === targetFolderId);
    if (index !== -1) {
      setBreadcrumbs(prev => prev.slice(0, index + 1));
      setCurrentFolderId(targetFolderId);
    }
  };

  // Actions
  const createFolder = async (name: string, color: string) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'folders'), {
        name,
        color,
        parentId: currentFolderId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  };

  const uploadFile = async (file: File, userNotes: string = '') => {
    if (!userId) throw new Error("User not authenticated");
    
    setUploading(true);
    try {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `user_uploads/${userId}/${safeFileName}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'users', userId, 'files'), {
        fileName: file.name,
        downloadUrl,
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        folderId: currentFolderId,
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

  const moveFile = async (fileId: string, targetFolderId: string | null) => {
    if (!userId) return;
    try {
      const fileRef = doc(db, 'users', userId, 'files', fileId);
      await updateDoc(fileRef, {
        folderId: targetFolderId
      });
    } catch (error) {
      console.error("Error moving file:", error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string, fileName: string) => {
    if (!userId) return;
    try {
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `user_uploads/${userId}/${safeFileName}`);
      
      await deleteObject(storageRef).catch(async () => {
         // Fallback logic handled silently
      });

      await deleteDoc(doc(db, 'users', userId, 'files', fileId));
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  // Delete folder (Optional: Recursive delete would be better, but keeping simple for now)
  const deleteFolder = async (folderId: string) => {
      if (!userId) return;
      // Note: This leaves orphaned files if not recursive. 
      // For a V1, we just delete the folder doc.
      await deleteDoc(doc(db, 'users', userId, 'folders', folderId));
  };

  // Sort Function
  const getSortedItems = () => {
    const sortedFolders = [...folders].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const sortedFiles = [...files].sort((a, b) => {
        if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { sortedFolders, sortedFiles };
  };

  return {
    ...getSortedItems(),
    currentFolderId,
    breadcrumbs,
    navigateToFolder,
    navigateUp,
    createFolder,
    uploadFile,
    moveFile,
    deleteFile,
    deleteFolder,
    uploading,
    loading,
    sortBy,
    setSortBy
  };
};
