import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface MiningPayout {
  id: string;
  timestamp: string;
  pool: string;
  broker: string;
  wallet_id: string;
  asset_acquired: string;
  quantity_acquired: number;
  conversion_rate: number;
  income: number;
}

export interface MiningPowerUsage {
  id: string;
  date: string;
  rig: string;
  power_usage_kw: number;
  usd_per_kw: number;
}

@Injectable({
  providedIn: 'root'
})
export class MiningService {
  public readonly miningPayouts$: Observable<MiningPayout[]>;
  public readonly dailyMiningPowerUsage$: Observable<MiningPowerUsage[]>;

  constructor(http: HttpClient) {
    this.miningPayouts$ = http.get<MiningPayout[]>('/api/FetchMiningPayouts');
    this.dailyMiningPowerUsage$ = http.get<MiningPowerUsage[]>('/api/FetchMiningPowerUsage');
  }
}
