import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserProfileService } from '../../services/userProfile.service';

@Component({
  selector: 'app-view',
  imports: [DatePipe],
  templateUrl: './view.html',
  styleUrl: './view.scss',
})
export class View {
  public userProfileService = inject(UserProfileService);
}
