import { Component, inject } from '@angular/core';
import { ByBitService } from '../../shared/services/bybit.service';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { WebsocketClient } from 'bybit-api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ConvertNumsPipe } from '../../shared/pipes/convert-nums.pipe';

@Component({
  selector: 'app-main',
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    ButtonModule,
    InputIconModule,
    TooltipModule,
    CommonModule,
    ConvertNumsPipe,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  private readonly byBitService: ByBitService = inject(ByBitService);

  exchangeRates: any[] = [];
  ratesList: string[] = [];
  dateFromByBit: number = 0;
  loading: boolean = true;
  searchValue: string | undefined;

  customSort(event: any) {
    console.log(event);
  }

  get exchangeRatesView(): any[] {
    return [...this.exchangeRates].sort((rateA, rateB) =>
      +rateA.turnover24h < +rateB.turnover24h ? 1 : -1
    );
  }

  ngOnInit() {
    this.byBitService
      .getExchangeRates()
      .then((response) => {
        if (response.retMsg === 'OK') {
          this.exchangeRates = response.result.list;
          this.ratesList = response.result.list.map(
            (rate) => `tickers.${rate.symbol}`
          );

          const API_KEY = 'rX2hfPbf17wT3CYUY8';
          const PRIVATE_KEY = 'hUvCCld4ZOF9xBJe0UmKk8JD8M0x373v6Y9G';

          const wsConfig = {
            key: API_KEY,
            secret: PRIVATE_KEY,
          };

          const ws = new WebsocketClient(wsConfig);

          // (v5) subscribe to multiple topics at once
          ws.subscribeV5(this.ratesList, 'spot');

          ws.on('open', ({ wsKey, event }) => {
            console.log('connection open for websocket with ID: ', wsKey);
          });

          ws.on('update', (update) => {
            // console.log('data received', JSON.stringify(data, null, 2));
            this.dateFromByBit = update.ts;

            const rate = this.exchangeRates.find(
              (rate) => rate.symbol === update.data.symbol
            );
            rate.lastPrice = +update.data.lastPrice;
            rate.price24hPcnt = +update.data.price24hPcnt;
            rate.highPrice24h = +update.data.highPrice24h;
            rate.lowPrice24h = +update.data.lowPrice24h;
            rate.volume24h = +update.data.volume24h;
            rate.turnover24h = +update.data.turnover24h;
          });

          ws.on('close', () => {
            console.log('connection closed');
          });
          this.loading = false;
          return;
        }

        console.log(response);
        this.exchangeRates = [];
      })
      .catch((error) => {
        console.error('error getExchangeRates()');
      });
  }

  isRateRising(value: number): boolean {
    return value >= 0;
  }
}
