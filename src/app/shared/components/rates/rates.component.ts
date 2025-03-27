import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { TooltipModule } from 'primeng/tooltip';
import { ConvertNumsPipe } from '../../pipes/convert-nums.pipe';
import { FixNumsPipe } from '../../pipes/fix-nums.pipe';
import { WebsocketClient } from 'bybit-api';
import { ByBitService } from '../../services/bybit.service';
import { MessageService } from 'primeng/api';
import { WSCONFIG } from '../../../../enviroments/enviroment';
import { ExcahgeRate } from '../../interfaces/rates';
import { byBitTimeZone, RatesStatus } from '../../constants/rates';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-rates',
  imports: [
    TableModule,
    IconFieldModule,
    ButtonModule,
    InputIconModule,
    TooltipModule,
    CommonModule,
    ConvertNumsPipe,
    FixNumsPipe,
    ToastModule,
    MessagesModule,
  ],
  providers: [MessageService],
  templateUrl: './rates.component.html',
  styleUrl: './rates.component.scss',
})
export class RatesComponent implements OnInit, OnDestroy {
  wsConfig = WSCONFIG;
  loading: boolean = true;
  headerHeight = 80;
  itemHeight = 50;

  private readonly byBitService: ByBitService = inject(ByBitService);
  private readonly messageService: MessageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  exchangeRates: ExcahgeRate[] = [];

  byBitServerTimeStamp = signal(0);

  byBitServerTime = computed(() => {
    const bybitTime = new Date(this.byBitServerTimeStamp());
    // ByBit TimeZone Settings
    return bybitTime.toLocaleString('en-US', byBitTimeZone as any);
  });

  // i like use getters, but can and signals
  get exchangeRatesView(): ExcahgeRate[] {
    return [...this.exchangeRates].sort((rateA, rateB) =>
      +rateA.turnover24h < +rateB.turnover24h ? 1 : -1
    );
  }

  ws = new WebsocketClient(this.wsConfig);

  ngOnInit() {
    this.getData();
  }

  getData(): void {
    this.byBitService
      .getExchangeRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (response) => {
          if (response.retMsg === RatesStatus.Ok) {
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: 'Pairs Added',
              life: 2000,
            });

            this.exchangeRates = response.result.list;

            // generate list to websocet updates
            const ratesList = response.result.list.map(
              (rate) => `tickers.${rate.symbol}`
            );

            this.getDataFromWs(ratesList);
            return;
          }

          this.messageService.add({
            severity: 'info',
            summary: 'Danger',
            detail: 'Cant connect to ByBit',
            life: 2000,
          });

          this.exchangeRates = [];
        },
        (error) => {
          this.messageService.add({
            severity: 'info',
            summary: 'Danger',
            detail: `Error getExchangeRates()` + `${error}`,
            life: 3500,
          });
        }
      );
  }

  getDataFromWs(ratesList: string[]): void {
    this.ws.subscribeV5(ratesList, 'spot');

    this.ws.on('open', ({ wsKey, event }) => {
      this.messageService.add({
        severity: 'info',
        summary: 'Success',
        detail: `Connected for websocket with ID: ` + `${wsKey}`,
        life: 3500,
      });
    });

    this.ws.on('update', (update) => {
      this.byBitServerTimeStamp.set(update.ts);

      // only one package from ws, so find by symbol
      const rateIndex = this.exchangeRates.findIndex(
        (rate) => rate.symbol === update.data.symbol
      );

      // if symbol was found, update rates
      if (rateIndex !== -1) {
        this.exchangeRates[rateIndex] = update.data;
      }
    });

    this.ws.on('close', () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Danger',
        detail: `Closed connection for websocket with ID: `,
        life: 3500,
      });

      this.exchangeRates = [];
    });

    this.loading = false;
  }

  isRateRising(value: number): boolean {
    return value >= 0;
  }

  ngOnDestroy() {
    this.ws.closeAll();
  }
}
