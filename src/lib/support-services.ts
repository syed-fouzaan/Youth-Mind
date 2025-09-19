'use server';

import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { moderateText } from '@/ai/flows/moderate-text';

export interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: Date;
  likes: number;
  replies: number;
}

export interface NewThread {
  title: string;
  content: string;
  tags: string[];
}

export async function createThread(newThread: NewThread): Promise<Thread> {
  const author = "AnonymousUser"; // In a real app, this would come from auth

  // Moderate content before saving
  const titleModeration = await moderateText({ text: newThread.title });
  if (!titleModeration.isSafe) {
    throw new Error(`Title content flagged as unsafe: ${titleModeration.reason}`);
  }
  
  const contentModeration = await moderateText({ text: newThread.content });
   if (!contentModeration.isSafe) {
    throw new Error(`Post content flagged as unsafe: ${contentModeration.reason}`);
  }

  const threadData = {
    ...newThread,
    author,
    createdAt: serverTimestamp(),
    likes: 0,
    replies: 0,
  };

  const docRef = await addDoc(collection(db, 'supportThreads'), threadData);

  return {
    ...threadData,
    id: docRef.id,
    createdAt: new Date(), // serverTimestamp is resolved on the server
  };
}

export async function fetchThreads(): Promise<Thread[]> {
  const threadsCollection = collection(db, 'supportThreads');
  const q = query(threadsCollection, orderBy('createdAt', 'desc'));
  const threadSnapshot = await getDocs(q);
  
  const threads: Thread[] = [];
  threadSnapshot.forEach((doc) => {
    const data = doc.data();
    threads.push({
      id: doc.id,
      title: data.title,
      content: data.content,
      author: data.author,
      tags: data.tags,
      likes: data.likes,
      replies: data.replies,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    });
  });

  return threads;
}
