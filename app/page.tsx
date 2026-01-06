"use client"
import { redirect } from 'next/navigation';

export default function Home() {
  // Use a server-side redirect to avoid client-side navigation/hydration issues
  redirect('/dashboard');
  return null;
}

