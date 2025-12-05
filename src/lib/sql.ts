export const sql = (strings: TemplateStringsArray, ...values: any[]) => 
    String.raw({ raw: strings }, ...values);
