import { Injectable } from '@angular/core';
import { RestClientV5 } from 'bybit-api';
import { WSCONFIG } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ByBitService {
  wsConfig = WSCONFIG
  client = new RestClientV5(this.wsConfig);
  
  getExchangeRates() {
    return this.client.getTickers({
      category: 'spot',
    });
  }

  getServerTime() {
    return this.client.getServerTime();
  }
}
