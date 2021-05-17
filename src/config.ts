export type CategoriesTree = {
    readonly id: string,
    readonly name: string,
    readonly cells?: number,
    readonly subCategories?: CategoriesTree[]
}

export type ConfigDescription = {
    readonly defaultIncomeCategory: string,
    readonly defaultOutcomeCategory: string,
    readonly categories: CategoriesTree[],
    readonly categoriesMapping: {
        [key: string]: string[]
    }
}

export const config: ConfigDescription = {
    defaultIncomeCategory: "incomes-others",
    defaultOutcomeCategory: "others",
    categories: [
        {
            id: "incomes",
            name: "Incomes",
            subCategories: [
                {
                    id: "incomes-salary",
                    name: "Salary",
                    cells: 2
                },
                {
                    id: "incomes-others",
                    name: "Other",
                    cells: 2
                }
            ]
        },
        {
            id: "mandatory",
            name: "Mandatory",
            cells: 2
        },
        {
            id: "commons",
            name: "Commons",
            cells: 5
        },
        {
            id: "leisure",
            name: "Leisure",
            subCategories: [
                {
                    id: "leisure-food",
                    name: "Food",
                    cells: 4
                },
                {
                    id: "leisure-others",
                    name: "Other",
                    cells: 2
                }
            ]
        },
        {
            id: "house",
            name: "House",
            cells: 4
        },
        {
            id: "car-transport",
            name: "Car / Transport",
            cells: 4
        },
        {
            id: "health",
            name: "Health",
            cells: 4
        },
        {
            id: "self-care",
            name: "Self Care",
            cells: 4
        },
        {
            id: "others",
            name: "Others",
            cells: 8
        }
    ],
    categoriesMapping: {
        "incomes-salary": ["Премия", "Зарплата"],
        "incomes-others": ["Возврат", "Раздел счета"],
        "mandatory": ["Оплата кредита", "Квартира (дом)"],
        "commons": ["Продукты"],
        "leisure-food": ["Кафе и рестораны"],
        "leisure-others": ["Отдых и развлечения", "Подарки"],
        "house": [],
        "car-transport": ["Страховки", "Автомобиль", "Заправка", "Аренда", "Такси", "Проезд", "Метро", "Штрафы",
            "Паркинг, платные дороги", "Автобусы / ЖД", "Автомобиль", "Сервис"],
        "health": ["Здоровье и Фитнесс"],
        "self-care": ["Одежда, обувь, аксессуары", "Забота о себе", "Образование"],
        "others": null
    }
}