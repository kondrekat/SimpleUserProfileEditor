# SimpleUserProfileEditor
Pet project to practice in Signals
- **Core State (`WritableSignal<UserProfile>`):** An object representing the user's profile (`name`, `email`, `bio`, `themePreference: 'light' | 'dark'`).
- **Computed Signals for Form State:**
    - `isProfileValid$`: A `computed` signal checking if all required fields have valid data.
    - `hasChanges$`: A `computed` signal comparing the current profile state with an `originalProfile$` signal (to enable/disable a "Save" button).
- **Actions:**
    - `updateProfileField(field: keyof UserProfile, value: any)`: A generic update method (like we just discussed!).
    - `saveProfile()`: Simulates sending updated data to a backend.
    - `resetProfile()`: Reverts changes to the `originalProfile$`.
- **Optional - Signals with Observables:**
    - Simulate a `saveProfile()` API call that returns an `Observable`, and use `toSignal()` to show a `savingStatus$: Signal<'idle' | 'saving' | 'success' | 'error'>`.
