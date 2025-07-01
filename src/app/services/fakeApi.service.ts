import { Injectable } from '@angular/core';
import { Observable, of, defer, throwError, delay } from 'rxjs';

import { LOCAL_STORAGE_KEY } from '../const/LocalStorage';
import { UserProfile } from '../classes/UserProfile';

/**
 * FakeApiService - A service that emulates backend interaction through an API.
 * It uses localStorage to persist data.
 * In 30% of cases, it can throw an error on any action to emulate connection problems.
 * It uses a random delay between 100ms and 600ms to simulate network latency and demonstrate intermediate logging states.
 */

@Injectable({
  providedIn: 'root',
})
export class FakeApiService {
  setItemToLocalStorage<UserProfile>(value: UserProfile): Observable<void> {
    return defer(() => {
      // Random delay between 100ms and 600ms to allow console to log
      const artificialDelayMs = Math.random() * 500 + 100;
      console.log(
        `[LocalStorageService] Operation for key '${LOCAL_STORAGE_KEY}' will have an artificial delay of ${artificialDelayMs.toFixed(
          0
        )}ms.`
      );
      // --- END ARTIFICIAL DELAY ---
      try {
        // Error emulation
        const shouldEmulateError = Math.random() < 0.3;
        if (shouldEmulateError) {
          console.warn(
            `[Emulated Error] Simulating an error for key: ${LOCAL_STORAGE_KEY}`
          );
          // Simulate a specific error, like a corrupted data error
          return throwError(
            () =>
              new Error(
                `Simulated localStorage data corruption for key: '${LOCAL_STORAGE_KEY}'`
              )
          );
        }
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedValue);
        console.log(`Successfully saved key: ${LOCAL_STORAGE_KEY}`);
        return of(undefined).pipe(delay(artificialDelayMs));
      } catch (e: any) {
        console.error(
          `Error saving to localStorage for key: ${LOCAL_STORAGE_KEY}`,
          e
        );
        return throwError(
          () =>
            new Error(
              `Failed to save item '${LOCAL_STORAGE_KEY}': ${e?.message || e}`
            )
        ).pipe(delay(artificialDelayMs));
      }
    });
  }

  getItemFromLocalStorage<UserProfile>(): Observable<UserProfile | null> {
    return defer(() => {
      // --- ARTIFICIAL DELAY FOR DEMONSTRATION/DEBUGGING ---
      // Random delay between 100ms and 600ms to allow console to log
      const artificialDelayMs = 5000; /*Math.random() * 500 + 100*/
      console.log(
        `[LocalStorageService] Operation for key '${LOCAL_STORAGE_KEY}' will have an artificial delay of ${artificialDelayMs.toFixed(
          0
        )}ms.`
      );
      // --- END ARTIFICIAL DELAY ---
      try {
        // Error emulation
        const shouldEmulateError = Math.random() < 0.3;
        if (shouldEmulateError) {
          console.warn(
            `[Emulated Error] Simulating an error for key: ${LOCAL_STORAGE_KEY}`
          );
          // Simulate a specific error, like a corrupted data error
          return throwError(
            () =>
              new Error(
                `Simulated localStorage data corruption for key: '${LOCAL_STORAGE_KEY}'`
              )
          ).pipe(delay(artificialDelayMs));
        }

        const serializedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedValue === null) {
          return of(null).pipe(delay(artificialDelayMs)); // Key not found
        }
        const parsedValue = JSON.parse(serializedValue) as UserProfile;
        return of(parsedValue).pipe(delay(artificialDelayMs));
      } catch (e: any) {
        console.error(
          `Error retrieving from localStorage for key: ${LOCAL_STORAGE_KEY}`,
          e
        );
        // Handle potential errors like JSON parsing errors
        return throwError(
          () =>
            new Error(
              `Failed to save item '${LOCAL_STORAGE_KEY}': ${e?.message || e}`
            )
        ).pipe(delay(artificialDelayMs));
      }
    });
  }
}
