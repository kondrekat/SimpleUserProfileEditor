import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserProfileStore } from '../../stores/user-profile.store';

@Component({
  selector: 'app-view',
  imports: [DatePipe],
  templateUrl: './view.html',
  styleUrl: './view.scss',
})
export class View {
  public store = inject(UserProfileStore);
}
