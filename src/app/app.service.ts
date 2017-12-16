import { Temperature } from './../models/temperature.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { City } from '../models/city.model';
import { Observer } from 'rxjs/Observer';
import { IConf } from '../interfaces/conf.interface';
import { ITemperature } from '../interfaces/temperature.interface';
import { ICity } from '../interfaces/city.interface';
import { IHistory } from '../interfaces/history.interface';

@Injectable()
export class AppService {

    private readonly URL: string = 'http://api.openweathermap.org/data/2.5/weather';
    private readonly APP_ID: string = '1577a78450f1de14579f3be3702d6e59';
    private readonly CITIES_RESOURCES = '/assets/cities.json';
    private readonly CONF_RESOURCES = '/assets/conf.json';
    private readonly TIME_INTERVAL = 180000; // Three minutes
    private readonly LOCAL_STORAGE_ID: string = 'temperature-history';
    private readonly responseType: Object = { responseType: 'json'};
    private timeInterval: number;

    constructor(private http: HttpClient) { }

    public getCities(): Observable<City[]> {
        return this.http.get<ICity[]>(this.CITIES_RESOURCES, this.responseType)
            .map((data: ICity[]) => {
                const response: City[] = [];
                if (data && data.length > 0) {
                    data.forEach((city: ICity) => {
                        response.push(new City(city.name, city.isoCodeCountry));
                    });
                }
                return response;
            });
    }

    public subscribeToTemperatures(cities: City[]): Observable<Map<string, Temperature[]>> {
        return new Observable((observer: Observer<Map<string, Temperature[]>>) => {
            if (cities && cities.length > 0) {
                this.getTimeInterval().subscribe((timeInterval: number) => {
                    this.updateAndEmitTemperatures(cities, observer);
                    setInterval(() => this.updateAndEmitTemperatures(cities, observer), timeInterval);
                });

            } else {
                observer.complete();
            }
        });
    }

    private getTimeInterval(): Observable<number> {
        let response: Observable<number>;
        if (!this.timeInterval) {
            response = this.http.get<IConf>(this.CONF_RESOURCES, this.responseType)
                .catch(() => Observable.of({ timeInterval: this.TIME_INTERVAL}))
                .map((data: IConf) => {
                    this.timeInterval = data.timeInterval;
                    return this.timeInterval;
                })
        } else {
            response = Observable.of(this.timeInterval);
        }

        return response;
    }

    private updateAndEmitTemperatures(cities: City[], observer: Observer<Map<string, Temperature[]>>): void {
        this.getTemperatures(cities)
            .subscribe((data: City[]) => {
                observer.next(this.updateTemperatures(data));
            });
    }

    private updateTemperatures(data: City[]): Map<string, Temperature[]> {
        let response: Map<string, Temperature[]>;

        if (data && data.length > 0) {
            response = this.parseToTemperatures(localStorage, this.LOCAL_STORAGE_ID);
            const cityStorageKeys: string[] = Array.from(response.keys());
            data.forEach((city: City) => {
                const id: string = city.getCityNameAndCode();
                const temperature = city.temperature;
                if (temperature.value) {
                    if (cityStorageKeys.find((key: string) => key === id)) {
                        response.get(id).unshift(temperature);
                    } else {
                        response.set(id, [temperature]);
                    }
                }
            });
            localStorage.setItem(this.LOCAL_STORAGE_ID, this.stringifyTemperatures(response));
        } else {
            response = new Map<string, Temperature[]>();
        }

        return response;
    }

    private getTemperatures(cities: City[]): Observable<City[]> {
        return Observable.forkJoin(
            cities.map(
                (city: City) =>
                    this.http.get<ITemperature>(this.URL, Object.assign({ params: { q: city.getCityNameAndCode(), APPID: this.APP_ID }}, this.responseType))
                        .catch(() => Observable.of(undefined))
                        .map((data: ITemperature) => {
                            city.temperature = new Temperature();
                            if (data) {
                                city.temperature.value = data.main.temp;
                                city.temperature.date = new Date();
                            }
                            return city;
                        })
            ));
    }

    private parseToTemperatures(store: Storage, id: string): Map<string, Temperature[]> {
        const response: Map<string, Temperature[]> = new Map<string, Temperature[]>();
        const tempHistory: {[key:string]: IHistory[] } = JSON.parse(store.getItem(id));
        if (tempHistory) {
            const keys: string[] = Object.keys(tempHistory);
            keys.forEach((key: string) => {
                const temperatures: Temperature[] = tempHistory[key].map((data: IHistory) => new Temperature(data._value, data._date));
                response.set(key, temperatures);
            });
        }
        return response;
    }

    private stringifyTemperatures(map: Map<string, Temperature[]>): string {
        const response: Object = {};

        const keys: string[] = Array.from(map.keys());
        keys.forEach((key: string) => {
            response[key] = map.get(key);
        });

        return JSON.stringify(response);
    }
}
