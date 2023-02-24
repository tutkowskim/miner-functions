import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

import { ColumnDefinition } from '../table/table.component';
import { MiningPayout, MiningPowerUsage, MiningService, MonthlyMiningStatistic } from './mining.service';

@Component({
  selector: 'app-mining',
  templateUrl: './mining.component.html',
  styleUrls: ['./mining.component.css']
})
export class MiningComponent implements OnInit {
  public readonly miningPayouts$;
  public readonly dailyMiningPowerUsage$;
  public readonly currentCost$;
  public readonly monthlyMiningStatistics$;
  public readonly currentIncome$;
  public readonly currentProfit$;

  public readonly miningPayoutsColumDefinitions: ColumnDefinition[];
  public readonly dailyMiningPowerUsageColumDefinitions: ColumnDefinition[];
  public chart: Chart<"line", string[], string> | null = null;

  constructor(private miningService: MiningService) {
    this.miningPayouts$ = this.miningService.miningPayouts$;
    this.currentCost$ = this.miningService.currentCost$;
    this.dailyMiningPowerUsage$ = this.miningService.dailyMiningPowerUsage$;
    this.monthlyMiningStatistics$ = this.miningService.monthlyMiningStatistics$;    
    this.currentIncome$ = this.miningService.currentIncome$;
    this.currentProfit$ = this.miningService.currentProfit$;

    this.miningPayoutsColumDefinitions = [
      { displayName: 'Timestamp', fetchColumnValue: (item: MiningPayout) => new Date(item.timestamp).toISOString() },
      { displayName: 'Asset', fetchColumnValue: (item: MiningPayout) => item.asset_acquired },
      { displayName: 'Quantity', fetchColumnValue: (item: MiningPayout) => String(item.quantity_acquired.toPrecision(6)) },
      { displayName: 'Income ($)', fetchColumnValue: (item: MiningPayout) => String(item.income.toFixed(2)) },
    ];

    this.dailyMiningPowerUsageColumDefinitions = [
      { displayName: 'Date', fetchColumnValue: (item: MiningPowerUsage) => new Date(item.date).toDateString() },
      { displayName: 'Rig', fetchColumnValue: (item: MiningPowerUsage) => item.rig },
      { displayName: 'Power (kW)', fetchColumnValue: (item: MiningPowerUsage) => String(item.power_usage_kw.toFixed(3)) },
      { displayName: 'Cost ($)', fetchColumnValue: (item: MiningPowerUsage) => String((item.power_usage_kw * item.usd_per_kw).toFixed(2)) },
    ];
  }

  public ngOnInit(): void {
    this.monthlyMiningStatistics$.subscribe(stats => {
      this.createChart(stats);
    });
  }

  public createChart(stats: MonthlyMiningStatistic[]){
    const orderedStats = stats.sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    this.chart = new Chart("mining-profit-chart", {
      type: 'line',
      data: {
        labels: orderedStats.map(stat => stat.month), 
	       datasets: [
          {
            label: "Cost",
            data: orderedStats.map(stat => String(stat.cost)),
            backgroundColor: 'red'
          },
          {
            label: "Income",
            data: orderedStats.map(stat => String(stat.income)),
            backgroundColor: 'blue'
          },
          {
            label: "Profit",
            data: orderedStats.map(stat => String(stat.profit)),
            backgroundColor: 'green'
          },
        ]
      },
      options: {
        maintainAspectRatio: false,
      }
    });
  }
}
