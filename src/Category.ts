export class Category {

    name: string | null;
    length: number | null;
    style: string;
    subCategories: Category[];

    constructor(
        name: string | null,
        length: number | null,
        style: string | null = null,
        subCategories: Category[] | null = null
    ) {
        this.name = name;
        this.length = length;
        this.style = style ? style : "";
        this.subCategories = !!subCategories ? subCategories : [];
    }

    get totalLength(): number {
        if (!!this.length) {
            return this.length;
        } else {
            return this.subCategories
                .map(v => v.length)
                .filter(v => v != null)
                .reduce((acc, v) => acc + v);
        }
    }

    get safeSubCategories(): Category[] {
        if (this.subCategories.length === 0) {
            return [new Category(null, this.length)];
        } else {
            return this.subCategories;
        }
    }
}