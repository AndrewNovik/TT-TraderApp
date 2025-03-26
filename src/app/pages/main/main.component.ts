import { Component } from '@angular/core';
import { RatesComponent } from '../../shared/components/rates/rates.component';
@Component({
  selector: 'app-main',
  imports: [RatesComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {}
