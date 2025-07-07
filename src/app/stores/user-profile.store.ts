import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
  // withDevtools, // Optional: for Redux DevTools integration
} from '@ngrx/signals';
import { tap, throwError, catchError, switchMap } from 'rxjs';

import { InitialUserProfileStoreState } from '../const/InitialUserProfileStoreState';
import { UserProfile } from '../classes/UserProfile';
import { englishNameRegex, emailRegex } from '../const/Regexp';
import { FakeApiService } from '../services/fakeApi.service';
import { DefaulUserProfile } from '../const/User';

export type UserProfileStoreType = typeof UserProfileStore;

export const UserProfileStore = signalStore(
  withState(InitialUserProfileStoreState),
  withMethods((store) => {
    const apiService = inject(FakeApiService);
    return {
      updateProfileField<K extends keyof UserProfile>(
        field: K,
        value: UserProfile[K]
      ) {
        patchState(store, {
          current$: {
            ...store.current$(),
            [field]: value,
          },
        });
      },
      saveProfile() {
        const profileToSave = store.current$(); // Get the current value from the signal

        if (!profileToSave) {
          console.warn('UserProfileService: No profile to save.');
          patchState(store, {
            loadingStatus$: 'idle',
          });
          return;
        }

        patchState(store, {
          loadingStatus$: 'loading',
        });
        apiService
          .setItemToIndexedDB(profileToSave)
          .pipe(
            // After saving successfully (next: of(void)), immediately try to read it back
            switchMap(() => {
              console.log(
                'UserProfileService: Profile was successfully saved IndexedDB. Now we are reading it back.'
              );
              return apiService.getItemFromIndexedDB<UserProfile>().pipe(
                // Handle potential errors during the *read* operation after save
                catchError((readError) => {
                  console.error(
                    'UserProfileService: Error during reading the profile after saving:',
                    readError
                  );
                  // Set the profile to current (edited) value if reading back failed
                  // To make it more predictable for user

                  patchState(store, {
                    original$: { ...store.current$() },
                  });

                  patchState(store, {
                    loadingStatus$: 'error',
                  });
                  // Re-throw the error so the main subscribe error handler catches it
                  return throwError(
                    () =>
                      new Error(
                        `Save OK, but read-back failed: ${
                          readError.message || readError
                        }`
                      )
                  );
                })
              );
            }),
            // This tap only runs if both save AND read-back were successful
            tap((readProfile) => {
              // Here, readProfile is the value *just read from IndexedDB*
              if (readProfile) {
                // Update the signal with the value read *back* from IndexedDB
                patchState(store, {
                  original$: { ...readProfile },
                });
                patchState(store, {
                  current$: { ...readProfile },
                });
                patchState(store, {
                  loadingStatus$: 'success',
                });
                console.log(
                  'UserProfileService: Profile was successfully saved and recieved back from storage',
                  readProfile
                );
              } else {
                // This case means save was OK, but getItemFromIndexedDB returned null (e.g., key mysteriously disappeared)
                console.warn(
                  'UserProfileService: Profile was saved but wasnt finded while recieving it back'
                );
                patchState(store, {
                  loadingStatus$: 'error',
                }); // Treat as an error in verification
              }
            }),
            // This catchError will catch errors from setItem OR getItemFromIndexedDB (if re-thrown by its catchError)
            catchError((error) => {
              console.error(
                'UserProfileService: Saving or verification error: ',
                error
              );
              patchState(store, {
                loadingStatus$: 'error',
              });
              return throwError(() => error); // Re-throw if you want component to handle it
            })
          )
          .subscribe(); // Subscribe to execute the entire save-then-verify sequence
      },

      resetProfile(): void {
        patchState(store, {
          current$: { ...store.original$() },
        });
      },

      /**
       * Load user profile from IndexedDB (which emulate API communication).
       * Update `userProfile$` Signal and `profileLoadStatus` Signal.
       */
      _loadProfile(): void {
        patchState(store, {
          loadingStatus$: 'loading',
        });

        apiService
          .getItemFromIndexedDB<UserProfile>()
          .pipe(
            // tap runs every time on succes from Observable.
            // Here we update Signal userProfileSource$ & currentProfileSource$ with a profile from storage.
            tap((profile) => {
              const profileToSet = profile
                ? { ...profile }
                : { ...DefaulUserProfile };

              patchState(store, {
                original$: { ...profileToSet },
              });
              patchState(store, {
                current$: { ...store.original$() },
              });

              patchState(store, {
                loadingStatus$: 'success',
              });
              console.log(
                'UserProfileService: connect successfully. Profile was downloaded if exists',
                profile
              );
            }),
            // catchError runs on error from Observable.
            // Here we proccess the error, set status of loading and return Observable
            // to ensure the stream complete
            catchError((error) => {
              console.error(
                'UserProfileService: Loading from IndexedDB error:',
                error
              );

              patchState(store, {
                original$: { ...DefaulUserProfile },
              });
              patchState(store, {
                current$: { ...store.original$() },
              });

              patchState(store, {
                loadingStatus$: 'success',
              });
              return throwError(() => error);
            })
          )
          .subscribe({
            /*
            next: () => {
            },
            error: (err) => {
            },
            complete: () => {
            }*/
          });
      },
      _isUserOlderThan18(userDateOfBirth: Date): boolean {
        const userDob = new Date(userDateOfBirth);
        const today = new Date();
        const eighteenYearsAgo = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate()
        );
        return userDob <= eighteenYearsAgo;
      },
    };
  }),
  withComputed((store) => {
    // We need to use typedStore here to let it use _isUserOlderThan18()
    const typedStore = store as typeof store & {
      _isUserOlderThan18: (userDateOfBirth: Date) => boolean;
    };

    return {
      isProfileValid$: computed(() => {
        return (
          englishNameRegex.test(typedStore.current$().name) &&
          emailRegex.test(typedStore.current$().email) &&
          typedStore._isUserOlderThan18(typedStore.current$().dateOfBirth)
        );
      }),

      hasChanges$: computed(() => {
        return typedStore.original$() !== typedStore.current$();
      }),
    };
  }),
  withHooks((store) => ({
    // onInit runs once when the store is initialized (like a constructor)
    onInit() {
      store._loadProfile();
    },
  }))
);
