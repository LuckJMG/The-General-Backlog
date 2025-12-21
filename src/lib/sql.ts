export default function sql(strings: TemplateStringsArray, ...values: any[]) {
    return String.raw({ raw: strings }, ...values);
}

