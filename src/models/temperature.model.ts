export class Temperature {
    private _value: number;
    private _date: Date;

    constructor(value?: number, date?: Date) {
        this._value = value;
        this._date = date;
    }

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
    }

    get date(): Date {
        return this._date;
    }

    set date(date: Date) {
        this._date = date;
    }
}
