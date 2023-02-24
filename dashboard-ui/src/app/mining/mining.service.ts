import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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

export interface MonthlyMiningStatistic {
  id: string;
  month: string;
  cost: number;
  income: number;
  profit: number;
}

@Injectable({
  providedIn: 'root'
})
export class MiningService {
  public readonly miningPayouts$: Observable<MiningPayout[]>;
  public readonly dailyMiningPowerUsage$: Observable<MiningPowerUsage[]>;
  public readonly monthlyMiningStatistics$: Observable<MonthlyMiningStatistic[]>;
  public readonly currentCost$: Observable<number>;
  public readonly currentIncome$: Observable<number>;
  public readonly currentProfit$: Observable<number>;

  constructor(http: HttpClient) {
    this.miningPayouts$ = http.get<MiningPayout[]>('/api/FetchMiningPayouts');
    this.dailyMiningPowerUsage$ = http.get<MiningPowerUsage[]>('/api/FetchMiningPowerUsage');
    this.monthlyMiningStatistics$ = http.get<MonthlyMiningStatistic[]>('/api/FetchMonthlyStatistics');
    this.currentCost$ = this.monthlyMiningStatistics$.pipe(map(value => value[0].cost));
    this.currentIncome$ = this.monthlyMiningStatistics$.pipe(map(value => value[0].income));
    this.currentProfit$ = this.monthlyMiningStatistics$.pipe(map(value => value[0].profit));
  }
}
