"use client";

import { useSyncExternalStore } from "react";

export const COMPARE_LIMIT = 4;
const EMPTY: string[] = [];

/** A list of ids kept in localStorage and shared by every component, also across open tabs. */
function listStore(key: string) {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function get() {
    if (cache) return cache;
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      cache = Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function set(next: string[]) {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage is blocked or full: the list still works until the page closes.
    }
    emit();
  }

  function subscribe(listener: () => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      cache = null;
      emit();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { get, set, subscribe };
}

const favorites = listStore("saffet:favorites");
const compared = listStore("saffet:compare");

const server = () => EMPTY;
export const useFavorites = () => useSyncExternalStore(favorites.subscribe, favorites.get, server);
export const useCompared = () => useSyncExternalStore(compared.subscribe, compared.get, server);

export function removeFavorites(ids: string[]) {
  favorites.set(favorites.get().filter((id) => !ids.includes(id)));
  compared.set(compared.get().filter((id) => !ids.includes(id)));
}

export function toggleFavorite(id: string) {
  if (favorites.get().includes(id)) return removeFavorites([id]);
  favorites.set([id, ...favorites.get()]);
}

export function toggleCompared(id: string) {
  const list = compared.get();
  if (list.includes(id)) compared.set(list.filter((x) => x !== id));
  else if (list.length < COMPARE_LIMIT) compared.set([...list, id]);
}
