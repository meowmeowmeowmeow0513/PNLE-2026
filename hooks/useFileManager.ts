import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, FirestoreError, updateDoc, orderBy, getDocs } from 'firebase/firestore';
import { UserFile, UserFolder, ResourceType } from '../types';

export const useFileManager = (userId: string | undefined) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [rawFolders, setRawFolders] = useState<UserFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Home'}]);
  
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  // Fetch All Folders (Realtime)
  useEffect(() => {
    if (!userId) {
        setRawFolders([]);
        return;
    }
    const q = query(collection(db, 'users', userId, 'folders'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserFolder[];
        setRawFolders(fetched);
    });
    return () => unsubscribe();
  }, [userId]);

  // Compute Valid Folder Tree
  const allFolders = useMemo(() => {
    if (!rawFolders.length) return [];
    const folderMap = new Map<string, UserFolder>();
    rawFolders.forEach(f => folderMap.set(f.id, f));

    const validIds = new Set<string>();
    const queue = rawFolders.filter(f => !f.parentId);
    queue.forEach(f => validIds.add(f.id));

    let head = 0;
    while(head < queue.length){
        const curr = queue[head++];
        const children = rawFolders.filter(f => f.parentId === curr.id);
        children.forEach(c => {
            validIds.add(c.id);
            queue.push(c);
        });
    }

    return rawFolders
        .filter(f => validIds.has(f.id))
        .map(f => {
            let path = f.name;
            let curr = f;
            while(curr.parentId && folderMap.has(curr.parentId)) {
                const parent = folderMap.get(curr.parentId)!;
                path = parent.name + " / " + path;
                curr = parent;
            }
            return { ...f, path };
        })
        .sort((a, b) => a.path.localeCompare(b.path));
  }, [rawFolders]);

  // Fetch Current View Folders & Files (Resources)
  useEffect(() => {
    if (!userId) {
      setFiles([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const uid = userId;

    const foldersRef = collection(db, 'users', uid, 'folders');
    const foldersQuery = query(foldersRef, where('parentId', '==', currentFolderId));
    
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

  // --- ACTIONS ---

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
  
  const updateFolder = async (folderId: string, name: string, color: string) => {
    if (!userId) return;
    try {
      const folderRef = doc(db, 'users', userId, 'folders', folderId);
      await updateDoc(folderRef, { name, color });
    } catch (error) {
      console.error("Error updating folder:", error);
      throw error;
    }
  };

  // ADD RESOURCE (Replaces uploadFile)
  const addResource = async (
    title: string, 
    type: ResourceType, 
    url: string = '', 
    content: string = '', 
    color: string = 'yellow'
  ) => {
    if (!userId) throw new Error("User not authenticated");
    
    try {
      await addDoc(collection(db, 'users', userId, 'files'), {
        fileName: title,
        downloadUrl: url,
        fileType: type,
        fileSize: 0,
        createdAt: new Date().toISOString(),
        folderId: currentFolderId,
        userNotes: content, // Used for Sticky Note content
        color: color,       // Used for Sticky Note bg
        aiSummary: ''
      });
    } catch (error) {
      console.error("Add resource failed:", error);
      throw error;
    }
  };

  // EDIT RESOURCE (For Sticky Notes mainly)
  const editResource = async (
    id: string, 
    updates: { title?: string, url?: string, content?: string, color?: string, type?: ResourceType }
  ) => {
      if (!userId) return;
      try {
          const itemRef = doc(db, 'users', userId, 'files', id);
          const firebaseUpdates: any = {};
          
          if (updates.title !== undefined) firebaseUpdates.fileName = updates.title;
          if (updates.url !== undefined) firebaseUpdates.downloadUrl = updates.url;
          if (updates.content !== undefined) firebaseUpdates.userNotes = updates.content;
          if (updates.color !== undefined) firebaseUpdates.color = updates.color;
          if (updates.type !== undefined) firebaseUpdates.fileType = updates.type;

          await updateDoc(itemRef, firebaseUpdates);
      } catch (error) {
          console.error("Error editing resource:", error);
          throw error;
      }
  };

  const moveItem = async (itemId: string, targetFolderId: string | null, type: 'file' | 'folder') => {
    if (!userId) return;
    try {
        const collectionName = type === 'file' ? 'files' : 'folders';
        const itemRef = doc(db, 'users', userId, collectionName, itemId);
        const updateData = type === 'file' ? { folderId: targetFolderId } : { parentId: targetFolderId };
        await updateDoc(itemRef, updateData);
    } catch (error) {
        console.error("Error moving item:", error);
        throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!userId) return;
    try {
      // No storage to delete, just the doc
      await deleteDoc(doc(db, 'users', userId, 'files', fileId));
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  const deleteFolder = async (folderId: string) => {
      if (!userId) return;
      const performDelete = async (fid: string) => {
          const filesQ = query(collection(db, 'users', userId, 'files'), where('folderId', '==', fid));
          const filesSnap = await getDocs(filesQ);
          const fileDeletes = filesSnap.docs.map(docSnap => deleteDoc(doc(db, 'users', userId, 'files', docSnap.id)));
          await Promise.all(fileDeletes);

          const subFoldersQ = query(collection(db, 'users', userId, 'folders'), where('parentId', '==', fid));
          const subFoldersSnap = await getDocs(subFoldersQ);
          for (const sub of subFoldersSnap.docs) {
              await performDelete(sub.id);
          }
          await deleteDoc(doc(db, 'users', userId, 'folders', fid));
      };
      try {
          await performDelete(folderId);
      } catch (e) {
          console.error("Recursive delete failed", e);
      }
  };

  // Sort Function
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
    updateFolder,
    addResource,
    editResource,
    moveItem,
    deleteFile,
    deleteFolder,
    loading,
    sortBy,
    setSortBy
  };
};