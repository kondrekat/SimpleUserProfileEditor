import {
  Injectable,
  signal,
  WritableSignal,
  computed,
  Signal,
  inject,
  effect,
} from '@angular/core';
import { tap, throwError, catchError, switchMap } from 'rxjs';

import { UserProfile } from '../classes/UserProfile';
import { DefaulUserProfile } from '../const/User';
import { englishNameRegex, emailRegex } from '../const/Regexp';
import { FakeApiService } from './fakeApi.service';

/**
 * UserProfileService - The core service of this demo project.
 * This service acts as the single source of truth for the user profile data.
 * It enables components and any other part of the system to operate with the user profile,
 * providing functionalities such as: get, edit & reset, save, and validate.
 * It also provides the current status of these profile-related operations.
 */

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiService = inject(FakeApiService);

  private userProfileSource$: WritableSignal<UserProfile> =
    signal(DefaulUserProfile);
  private currentProfileSource$: WritableSignal<UserProfile> =
    signal(DefaulUserProfile);

  // TODO: change to private
  // Set public to test idea with effect in component
  public profileLoadStatusSource$: WritableSignal<
    'idle' | 'loading' | 'success' | 'error'
  > = signal('idle');

  public readonly userProfile$: Signal<UserProfile> =
    this.userProfileSource$.asReadonly();
  public readonly currentProfile$: Signal<UserProfile> =
    this.currentProfileSource$.asReadonly();
  public readonly isProfileValid$: Signal<boolean> = computed(() => {
    return (
      englishNameRegex.test(this.currentProfileSource$().name) &&
      emailRegex.test(this.currentProfileSource$().email) &&
      this.isUserOlderThan18(this.currentProfileSource$().dateOfBirth)
    );
  });

  public readonly profileLoadStatus$: Signal<
    'idle' | 'loading' | 'success' | 'error'
  > = this.profileLoadStatusSource$.asReadonly();

  public readonly hasChanges$: Signal<boolean> = computed(() => {
    return this.userProfileSource$() !== this.currentProfileSource$();
  });

  constructor() {
    this.loadProfile();
  }

  public updateProfileField(field: keyof UserProfile, value: any) {
    this.currentProfileSource$.set({
      ...this.currentProfileSource$(),
      [field]: value,
    });
  }

  public saveProfile() {
    const profileToSave = this.currentProfileSource$(); // Get the current value from the signal

    if (!profileToSave) {
      console.warn('UserProfileService: No profile to save.');
      this.profileLoadStatusSource$.set('idle');
      console.log(
        'this.profileLoadStatusSource$ = ' + this.profileLoadStatusSource$()
      );
      return;
    }

    this.profileLoadStatusSource$.set('loading');
    console.log(
      'this.profileLoadStatusSource$ = ' + this.profileLoadStatusSource$()
    );
    this.apiService
      .setItemToLocalStorage(profileToSave)
      .pipe(
        // After saving successfully (next: of(void)), immediately try to read it back
        switchMap(() => {
          console.log(
            'UserProfileService: Profile was successfully saved localStorage. Now we are reading it back.'
          );
          return this.apiService.getItemFromLocalStorage<UserProfile>().pipe(
            // Handle potential errors during the *read* operation after save
            catchError((readError) => {
              console.error(
                'UserProfileService: Error during reading the profile after saving:',
                readError
              );
              // Set the profile to current (edited) value if reading back failed
              // To make it more predictable for user
              this.userProfileSource$.set({ ...this.currentProfileSource$() });
              this.profileLoadStatusSource$.set('error');
              console.log(
                'this.profileLoadStatusSource$ = ' +
                  this.profileLoadStatusSource$()
              );
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
          // Here, readProfile is the value *just read from localStorage*
          if (readProfile) {
            // Update the signal with the value read *back* from localStorage
            this.userProfileSource$.set({ ...readProfile });
            this.currentProfileSource$.set({ ...readProfile });
            this.profileLoadStatusSource$.set('success');
            console.log(
              'this.profileLoadStatusSource$ = ' +
                this.profileLoadStatusSource$()
            );
            console.log(
              'UserProfileService: Profile was successfully saved and recieved back from storage',
              readProfile
            );
          } else {
            // This case means save was OK, but getItemFromLocalStorage returned null (e.g., key mysteriously disappeared)
            console.warn(
              'UserProfileService: Profile was saved but wasnt finded while recieving it back'
            );
            this.profileLoadStatusSource$.set('error'); // Treat as an error in verification
            console.log(
              'this.profileLoadStatusSource$ = ' +
                this.profileLoadStatusSource$()
            );
          }
        }),
        // This catchError will catch errors from setItem OR getItemFromLocalStorage (if re-thrown by its catchError)
        catchError((error) => {
          console.error(
            'UserProfileService: Saving or verification error: ',
            error
          );
          this.profileLoadStatusSource$.set('error');
          console.log(
            'this.profileLoadStatusSource$ = ' + this.profileLoadStatusSource$()
          );
          return throwError(() => error); // Re-throw if you want component to handle it
        })
      )
      .subscribe(); // Subscribe to execute the entire save-then-verify sequence
  }

  public resetProfile() {
    this.currentProfileSource$.set({ ...this.userProfileSource$() });
  }

  /**
   * Load user profile from LocalStorage (which emulate API communication).
   * Update `userProfile$` Signal and `profileLoadStatus` Signal.
   */
  private loadProfile(): void {
    this.profileLoadStatusSource$.set('loading');
    console.log(
      'this.profileLoadStatusSource$ = ' + this.profileLoadStatusSource$()
    );

    this.apiService
      .getItemFromLocalStorage<UserProfile>()
      .pipe(
        // tap runs every time on succes from Observable.
        // Here we update Signal userProfileSource$ & currentProfileSource$ with a profile from storage.
        tap((profile) => {
          this.userProfileSource$.set(
            profile ? { ...profile } : { ...DefaulUserProfile }
          );
          this.currentProfileSource$.set({ ...this.userProfileSource$() });
          this.profileLoadStatusSource$.set('success');
          console.log(
            'this.profileLoadStatusSource$ = ' + this.profileLoadStatusSource$()
          );
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
            'UserProfileService: Loading from localStorage error:',
            error
          );
          this.userProfileSource$.set({ ...DefaulUserProfile }); // Set Default value
          this.currentProfileSource$.set({ ...this.userProfileSource$() });
          this.profileLoadStatusSource$.set('error');
          console.log(
            'this.profileLoadStatusSource$ = ' + this.profileLoadStatusSource$()
          );
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
  }

  private isUserOlderThan18(userDateOfBirth: Date): boolean {
    const userDob = new Date(userDateOfBirth);
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return userDob <= eighteenYearsAgo;
  }
}
