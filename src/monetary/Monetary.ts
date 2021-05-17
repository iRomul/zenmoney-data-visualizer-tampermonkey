export class Monetary {

    readonly decimalPart: number;
    readonly fractionPart: number;

    constructor(value: string) {
        const [left, right] = value.split(/\./);

        this.decimalPart = parseInt(left);

        if (right) {
            this.fractionPart = parseInt(right);
        }
    }
}