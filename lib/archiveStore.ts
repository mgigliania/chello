"use client";

import type { Archive } from "@/lib/types";
import {
  emptyArchive,
  loadArchive,
  loadKeys,
  saveArchive,
  saveKey,
} from "@/lib/storage";

/**
 * The archive as an external store.
 *
 * localStorage is genuinely external to React, and modelling it as a store
 * rather than as state-plus-an-effect means the first read happens when React
 * subscribes — no hydration flash, no cascading render, and a snapshot that
 * stays referentially stable between changes.
 */
export interface Snapshot {
  archive: Archive;
  /** One key per provider, so switching back does not mean retyping. */
  keys: Record<string, string>;
  hydrated: boolean;
}

/** Returned during server rendering and before the first subscribe. Must be
 *  the same object every time, or React will re-render forever. */
const SERVER_SNAPSHOT: Snapshot = {
  archive: emptyArchive(),
  keys: {},
  hydrated: false,
};

let snapshot: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // React re-reads the snapshot straight after subscribing, so hydrating here
  // is picked up without a setState.
  if (!snapshot.hydrated) {
    snapshot = {
      archive: loadArchive(),
      keys: loadKeys(),
      hydrated: true,
    };
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

export function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export function writeArchive(next: Archive): void {
  snapshot = { ...snapshot, archive: next };
  saveArchive(next);
  emit();
}

export function updateArchive(mutate: (current: Archive) => Archive): void {
  writeArchive(mutate(snapshot.archive));
}

export function writeKey(provider: string, key: string): void {
  snapshot = { ...snapshot, keys: { ...snapshot.keys, [provider]: key } };
  saveKey(provider, key);
  emit();
}
