// 观察者的目的就是给需要变化的那个元素增加一个观察者
// 当数据变化后 执行对应的方法
// 用新值和老值就行比对 如果发生变化 就调用更新方法
class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm
        this.expr = expr
        this.cb = cb
        //先获取一下老的值
        this.value = this.get()
    }
    getVal(vm, expr) {
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    }
    get(){
        let value = this.getVal(this.vm,this.expr)
    }
}