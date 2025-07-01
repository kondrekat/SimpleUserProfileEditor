import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserProfile } from '../../classes/UserProfile';
import { UserProfileService } from '../../services/userProfile.service';

@Component({
  selector: 'app-edit',
  imports: [FormsModule],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit {
  public userProfileService = inject(UserProfileService);

  constructor() {
    effect(() => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(
        `[${timestamp}] EFFECT: UserProfileService profileLoadStatus changed to:`,
        this.userProfileService.profileLoadStatusSource$()
      );
    });
  }

  prepareDataForSaving(field: keyof UserProfile, event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.userProfileService.updateProfileField(field, inputValue);
  }
}
