class Observer {
    constructor(data) {
        this.observe(data)
    }
    observe(data) {
        //要对这个data原有的属性改成set和get的形式
        if (!data || typeof data !== 'object') {
            return
        }
        // 要将数据 一一劫持 先获取data的key 和 value
        Object.keys(data).forEach(key => {
            //劫持
            this.defineReactive(data, key, data[key])
            this.observe(data[key])  //深度递归劫持
        })

    }
    // 定义响应式
    defineReactive(obj, key, value) {
        // 在获取某个值的时候 做些事情
        let that = this
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() { //当取值时调用的方法
                return value
            },
            set(newVal) {  //当给data属性设置值时候  更改获取的属性的值
                if (newVal != value) {
                    // 这里的this不是实例
                    that.observe(newVal)  //如果是对象继续劫持
                    value = newVal
                }
            }
        })
    }
}