import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './ui/nav-bar/nav-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'my-angular-project';
}
