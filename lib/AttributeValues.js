export default class AttributeValues {
    constructor(options, index) {
        this.options = options;
        let suffix = "";
        if (index > 0) {
            suffix = `-${index}`;
        }
        this.id_prefix = options.id_prefix;
        this.listId = `${this.id_prefix}-list${suffix}`;
    }
}
//# sourceMappingURL=AttributeValues.js.map