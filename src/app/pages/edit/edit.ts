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
      document.title =
        this.userProfileService.currentProfile$().name + "'s page";
    });
  }

  prepareDataForSaving(field: keyof UserProfile, event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.userProfileService.updateProfileField(field, inputValue);
  }
}
