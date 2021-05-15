import {ZMTag} from "./ZmModel";

export default {
    mapZmTagToCategory(tag: ZMTag): string {
        const title = tag?.title;

        console.log("TITLE", title);

        if (["Премия",
            "Зарплата"].includes(title)) {
            return "Salary"
        } else if (["Возврат",
            "Раздел счета"].includes(title)) {
            return "Other"
        } else if (["Оплата кредита",
            "Квартира (дом)"].includes(title)) {
            return "Mandatory"
        } else if ([
            "Продукты"].includes(title)) {
            return "Commons"
        } else if (["Кафе и рестораны",
            "Отдых и развлечения",
            "Подарки"].includes(title)) {
            return "Leisure"
        } else if (["Страховки",
            "Автомобиль",
            "Заправка",
            "Аренда",
            "Такси",
            "Проезд",
            "Метро",
            "Штрафы",
            "Паркинг, платные дороги",
            "Автобусы / ЖД",
            "Автомобиль",
            "Сервис"].includes(title)) {
            return "Car / Transport"
        } else if (["Здоровье и Фитнесс"].includes(title)) {
            return "Health"
        } else if (["Одежда, обувь, аксессуары", "Забота о себе", "Образование"].includes(title)) {
            return "Self Care"
        } else {
            return "Others"
        }
    }
}