import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../../CommonComponents/nav-bar/nav-bar.component';
import { HeaderComponent } from '../../../CommonComponents/header/header.component';

@Component({
  selector: 'layout',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, HeaderComponent],
  templateUrl: './Layout.component.html',
  styleUrl: './Layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}
