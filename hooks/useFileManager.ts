
import { useState, useEffect, useMemo } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, FirestoreError, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { UserFile, UserFolder } from '../types';

export const useFileManager = (userId: string | undefined) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [allFolders, setAllFolders] = useState<UserFolder[]>([]); // For Move Modal (Directory Tree)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Home'}]);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  // Fetch All Folders (for directory tree / move operations)
  useEffect(() => {
    if (!userId) {
        setAllFolders([]);
        return;
    }
    const q = query(collection(db, 'users', userId, 'folders'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserFolder[];
        setAllFolders(fetched);
    });
    return () => unsubscribe();
  }, [userId]);

  // Fetch Current View Folders & Files
  useEffect(() => {
    if (!userId) {
      setFiles([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const uid = userId;

    // 1. Fetch Folders in current directory
    const foldersRef = collection(db, 'users', uid, 'folders');
    const foldersQuery = query(foldersRef, where('parentId', '==', currentFolderId));
    
    // 2. Fetch Files in current directory
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

  const moveItem = async (itemId: string, targetFolderId: string | null, type: 'file' | 'folder') => {
    if (!userId) return;
    try {
        const collectionName = type === 'file' ? 'files' : 'folders';
        const itemRef = doc(db, 'users', userId, collectionName, itemId);
        
        // Field name differs: files use 'folderId', folders use 'parentId'
        const updateData = type === 'file' 
            ? { folderId: targetFolderId } 
            : { parentId: targetFolderId };

        await updateDoc(itemRef, updateData);
    } catch (error) {
        console.error("Error moving item:", error);
        throw error;
    }
  };

  const renameItem = async (itemId: string, newName: string, type: 'file' | 'folder') => {
      if (!userId) return;
      try {
          const collectionName = type === 'file' ? 'files' : 'folders';
          const itemRef = doc(db, 'users', userId, collectionName, itemId);
          const updateData = type === 'file'
            ? { fileName: newName }
            : { name: newName };
          
          await updateDoc(itemRef, updateData);
      } catch (error) {
          console.error("Error renaming item:", error);
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

  const deleteFolder = async (folderId: string) => {
      if (!userId) return;
      // Note: This does not delete sub-items. In a real app, you'd want a cloud function for recursive delete.
      await deleteDoc(doc(db, 'users', userId, 'folders', folderId));
  };

  // Sort Function using useMemo
  const { sortedFolders, sortedFiles } = useMemo(() => {
    const sortedFolders = [...folders].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const sortedFiles = [...files].sort((a, b) => {
        if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { sortedFolders, sortedFiles };
  }, [folders, files, sortBy]);

  return {
    sortedFolders, 
    sortedFiles,
    allFolders,
    currentFolderId,
    breadcrumbs,
    navigateToFolder,
    navigateUp,
    createFolder,
    uploadFile,
    moveItem,
    renameItem,
    deleteFile,
    deleteFolder,
    uploading,
    loading,
    sortBy,
    setSortBy
  };
};
