import {Monetary} from "./Monetary";

export const Formats = {
    RUSSIAN(monetary: Monetary): string {
        const value = parseFloat(`${monetary.decimalPart}.${monetary.fractionPart}`);

        const useGrouping = monetary.decimalPart.toString().length > 4;

        return value.toLocaleString("ru-RU", {style: "currency", currency: "RUB", useGrouping});
    }
}