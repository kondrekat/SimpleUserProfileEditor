import { Injectable } from '@angular/core';
import { Observable, defer, throwError, delay, from, map, tap } from 'rxjs';

import { INDEXEDDB_KEY } from '../const/IndexedDB';
import { UserProfile } from '../classes/UserProfile';
import { set, get } from 'idb-keyval';

/**
 * FakeApiService - A service that emulates backend interaction through an API.
 * It uses IndexedDB to persist data.
 * In 30% of cases, it can throw an error on any action to emulate connection problems.
 * It uses a random delay between 100ms and 600ms to simulate network latency and demonstrate intermediate logging states.
 */

@Injectable({
  providedIn: 'root',
})
export class FakeApiService {
  setItemToIndexedDB<UserProfile>(value: UserProfile): Observable<void> {
    return defer(() => {
      // Random delay between 100ms and 600ms to allow console to log
      const artificialDelayMs = Math.random() * 500 + 100;
      console.log(
        `[FakeApiService] Operation for key '${INDEXEDDB_KEY}' will have an artificial delay of ${artificialDelayMs.toFixed(
          0
        )}ms.`
      );
      // --- END ARTIFICIAL DELAY ---
      try {
        // Error emulation
        const shouldEmulateError = Math.random() < 0.3;
        if (shouldEmulateError) {
          console.warn(
            `[Emulated Error] Simulating an error for key: ${INDEXEDDB_KEY}`
          );
          // Simulate a specific error, like a corrupted data error
          return throwError(
            () =>
              new Error(
                `Simulated IdexedDB data corruption for key: '${INDEXEDDB_KEY}'`
              )
          );
        }

        return from(set(INDEXEDDB_KEY, value))
          .pipe(delay(artificialDelayMs))
          .pipe(
            tap(() => {
              console.log(`Successfully saved key: ${INDEXEDDB_KEY}`);
            })
          );
      } catch (e: any) {
        console.error(`Error saving to IdexedDB for key: ${INDEXEDDB_KEY}`, e);
        return throwError(
          () =>
            new Error(
              `Failed to save item '${INDEXEDDB_KEY}': ${e?.message || e}`
            )
        ).pipe(delay(artificialDelayMs));
      }
    });
  }

  getItemFromIndexedDB<UserProfile>(): Observable<UserProfile | null> {
    return defer(() => {
      // --- ARTIFICIAL DELAY FOR DEMONSTRATION/DEBUGGING ---
      // Random delay between 100ms and 600ms to allow console to log
      const artificialDelayMs = 5000; /*Math.random() * 500 + 100*/
      console.log(
        `[FakeApiService] Operation for key '${INDEXEDDB_KEY}' will have an artificial delay of ${artificialDelayMs.toFixed(
          0
        )}ms.`
      );
      // --- END ARTIFICIAL DELAY ---
      try {
        // Error emulation
        const shouldEmulateError = Math.random() < 0.3;
        if (shouldEmulateError) {
          console.warn(
            `[Emulated Error] Simulating an error for key: ${INDEXEDDB_KEY}`
          );
          // Simulate a specific error, like a corrupted data error
          return throwError(
            () =>
              new Error(
                `Simulated IdexedDB data corruption for key: '${INDEXEDDB_KEY}'`
              )
          ).pipe(delay(artificialDelayMs));
        }

        return from(get(INDEXEDDB_KEY)).pipe(
          map((value) => (value === undefined ? null : (value as UserProfile))),
          delay(artificialDelayMs)
        );
      } catch (e: any) {
        console.error(
          `Error retrieving from IdexedDB for key: ${INDEXEDDB_KEY}`,
          e
        );
        // Handle potential errors like JSON parsing errors
        return throwError(
          () =>
            new Error(
              `Failed to save item '${INDEXEDDB_KEY}': ${e?.message || e}`
            )
        ).pipe(delay(artificialDelayMs));
      }
    });
  }
}
