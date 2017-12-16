import { Temperature } from './temperature.model';

export class City {
    private _name: string;
    private _isoCodeCountry: string;
    private _temperature: Temperature;

    constructor(name: string = '', isoCodeCountry: string = '', temperature?: Temperature) {
        this._name = name;
        this._isoCodeCountry = isoCodeCountry;
        this._temperature = temperature;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get isoCodeCountry(): string {
        return this._isoCodeCountry;
    }

    set isoCodeCountry(isoCodeCountry: string) {
        this._isoCodeCountry = isoCodeCountry;
    }

    get temperature(): Temperature {
        return this._temperature;
    }

    set temperature(temperature: Temperature) {
        this._temperature = temperature;
    }

    public getCityNameAndCode(): string {
        return this._name + ',' + this._isoCodeCountry;
    }
}
