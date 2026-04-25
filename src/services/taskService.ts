import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Task, Priority, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const taskService = {
  subscribeTasks: (userId: string, callback: (tasks: Task[]) => void) => {
    let unsubscribe: () => void = () => {};
    let isCancelled = false;

    const startSubscription = () => {
      if (!db) {
        const syncLocal = () => {
          const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
          const userTasks = localTasks.filter((t: any) => t.userId === userId);
          callback(userTasks);
        };
        syncLocal();
        window.addEventListener('storage-update', syncLocal);
        unsubscribe = () => window.removeEventListener('storage-update', syncLocal);
        return;
      }

      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        callback(tasks);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'tasks');
      });
    };

    startSubscription();

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  },

  addTask: async (userId: string, title: string) => {
    const newTask = {
      title,
      description: '',
      isCompleted: false,
      isDeleted: false,
      priority: Priority.NONE,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (!db) {
      const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const taskWithId = { ...newTask, id: Math.random().toString(36).substr(2, 9) };
      localStorage.setItem('tasks', JSON.stringify([taskWithId, ...localTasks]));
      window.dispatchEvent(new Event('storage-update'));
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), newTask);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const finalUpdates = {
      ...updates,
      updatedAt: Date.now()
    };

    if (!db) {
      const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const newTasks = localTasks.map((t: any) => t.id === taskId ? { ...t, ...finalUpdates } : t);
      localStorage.setItem('tasks', JSON.stringify(newTasks));
      window.dispatchEvent(new Event('storage-update'));
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, finalUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  },

  deleteTask: async (taskId: string) => {
    if (!db) {
      const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const newTasks = localTasks.filter((t: any) => t.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(newTasks));
      window.dispatchEvent(new Event('storage-update'));
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  }
};
