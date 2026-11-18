'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '@/lib/firebase';
import ErrorBoundary from '@/components/ErrorBoundary';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  signingIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clampString(value: string | null | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max);
}

async function syncUserProfile(firebaseUser: User): Promise<void> {
  const path = `users/${firebaseUser.uid}`;
  const userRef = doc(db, 'users', firebaseUser.uid);

  let exists = false;
  try {
    const snap = await getDoc(userRef);
    exists = snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  const profileFields = {
    displayName: clampString(firebaseUser.displayName || 'Usuário', 120),
    email: clampString(firebaseUser.email || '', 200),
    photoURL: clampString(firebaseUser.photoURL || '', 500),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!exists) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        ...profileFields,
        createdAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        profileFields,
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, exists ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    void testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        void syncUserProfile(nextUser).catch((err) => {
          console.error('Erro ao sincronizar perfil:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('O login foi cancelado antes de concluir.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'O navegador bloqueou a janela de login. Permita popups para entrar com Google.'
        );
      } else {
        setAuthError('Não foi possível entrar com sua conta Google agora. Tente novamente.');
      }
      return null;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch {
      setAuthError('Não foi possível encerrar a sessão agora.');
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <ErrorBoundary>
      <AuthContext.Provider
        value={{
          user,
          authReady,
          signingIn,
          authError,
          signInWithGoogle,
          signOutUser,
          clearAuthError,
        }}
      >
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de FirebaseProvider.');
  }
  return ctx;
}
