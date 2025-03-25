import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { RestClientV5, WebsocketClient } from 'bybit-api';

@Injectable({
  providedIn: 'root',
})
export class ByBitService {
  getExchangeRates() {
    const API_KEY = 'rX2hfPbf17wT3CYUY8';
    const PRIVATE_KEY = 'hUvCCld4ZOF9xBJe0UmKk8JD8M0x373v6Y9G';

    const wsConfig = {
      key: API_KEY,
      secret: PRIVATE_KEY,
    };
    const client = new RestClientV5(wsConfig);

    return client.getTickers({
      category: 'spot',
    });
  }
}
