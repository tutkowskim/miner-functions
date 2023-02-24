import { Component, Input } from '@angular/core';

export interface ColumnDefinition {
  displayName: string;
  fetchColumnValue: (row: any) => string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @Input()
  public columnDefinitions: ColumnDefinition[] = [];

  @Input()
  public rows: null|any[] = [];
}
