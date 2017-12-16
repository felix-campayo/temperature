import { Component, ViewChild } from '@angular/core';
import { AppService } from './../app.service';
import { City } from '../../models/city.model';
import { MatTableDataSource, MatSelectChange, MatPaginator, MatSort, MatProgressSpinnerModule } from '@angular/material';
import { Temperature } from '../../models/temperature.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public readonly displayedColumns: string[] = ['temperature', 'date'];
  public readonly pageSizeOptions: number[] = [5, 10, 20];
  public cities: City[];
  public dataTable: MatTableDataSource<Temperature>;
  public selectedCity: City;
  private dataSource: Map<string, Temperature[]>;

  constructor(private appService: AppService) {
    this.initTemperatures();
  }

  public showSpinner(): boolean {
    return (this.cities === undefined && this.dataTable === undefined);
  }

  public showInfo(): boolean {
    return !this.showSpinner();
  }

  public selectionChange(event: MatSelectChange): void {
    this.selectedCity = event.value;
    this.dataTable = this.filterDataSource(this.selectedCity, this.dataSource);
  }

  private initTemperatures(): void {
    this.appService.getCities()
      .flatMap((cities: City[]) => {
        this.cities = cities;
        return this.appService.subscribeToTemperatures(this.cities);
      })
      .subscribe((result: Map<string, Temperature[]>) => {
        this.dataSource = result;
        this.dataTable = this.filterDataSource(this.selectedCity, this.dataSource);
      });
  }

  private filterDataSource(city: City, dataSource: Map<string, Temperature[]>): MatTableDataSource<Temperature> {
    const response: MatTableDataSource<Temperature> =
      new MatTableDataSource<Temperature>();

    if (city && dataSource && dataSource.size > 0) {
      response.data = dataSource.get(this.selectedCity.getCityNameAndCode());
    }
    response.paginator = this.paginator;
    response.sort = this.sort;

    return response;
  }
}
