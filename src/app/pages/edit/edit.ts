import {
  Component,
  computed,
  effect,
  inject,
  Renderer2,
  RendererFactory2,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserProfile } from '../../classes/UserProfile';
import { UserProfileService } from '../../services/userProfile.service';

@Component({
  selector: 'app-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit {
  public userProfileService = inject(UserProfileService);

  open: boolean = false;
  isDark: Signal<boolean> = computed(() => {
    return this.userProfileService.currentProfile$().themePreference === 'dark';
  });

  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    effect(() => {
      document.title =
        this.userProfileService.currentProfile$().name + "'s page";
    });
    effect(() => {
      if (typeof document !== 'undefined') {
        if (
          this.userProfileService.currentProfile$().themePreference === 'dark'
        ) {
          this.renderer.addClass(document.documentElement, 'dark'); // Add  'dark' class to <html>
        } else {
          this.renderer.removeClass(document.documentElement, 'dark'); // Remove 'dark' class from <html>
        }
      }
    });
  }

  prepareDataForSaving(field: keyof UserProfile, event: Event): void {
    let inputValue: string;
    if (field === 'themePreference') {
      inputValue = (event.target as HTMLInputElement).checked
        ? 'dark'
        : 'light';
    } else {
      inputValue = (event.target as HTMLInputElement).value;
    }
    this.userProfileService.updateProfileField(field, inputValue);
  }
}
