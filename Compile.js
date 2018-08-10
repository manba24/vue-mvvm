class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        if (this.el) {
            //如果有这个元素 就开始编译
            // 1.先把这些真实的dom移入到内存中 fragment
            let fragment = this.nodeTofragment(this.el)

            // 2.编译 =》 提前想要的元素节点v-model 和 文本节点
            this.compile(fragment)
            // 3.把编译好的fragment放到页面中
            this.el.appendChild(fragment)
        }
    }
    //辅助方法
    isElementNode(node) {
        return node.nodeType === 1
    }
    // 是不是指令
    isDirective(name) {
        return name.includes('v-')
    }
    //核心方法
    //编译元素
    compileElement(node) {
        //带v-model v-..
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            // 判断属性名是不是包含v-
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                // 取到对应的值放到节点中
                let expr = attr.value
                // let type = attrName.slice(2)
                let [, type] = attrName.split('-')
                // node vm.$data exper  v-model v-html v-text
                CompileUtil[type](node, this.vm, expr)
            }
        })
    }
    //编译文本
    compileText(node) {
        //带{{}}
        let expr = node.textContent //取文本中的内容
        let reg = /\{\{([^}]+)\}\}/g
        if (reg.test(expr)) {
            // node this.vm.$data expr
            CompileUtil['text'](node, this.vm, expr)
        }
    }
    //编译
    compile(fragment) {
        // 需要递归
        let childNodes = fragment.childNodes
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 是元素节点
                //编译元素
                this.compileElement(node)
                // 深入检查
                this.compile(node)
            } else {
                //编译文本
                this.compileText(node)
            }
        })
    }
    // 讲el的节点放至内存中
    nodeTofragment(el) {
        // 创建文档碎片
        let fragment = document.createDocumentFragment()
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment  // 内存中的节点
    }


}

CompileUtil = {
    // 获取实例对应的数据
    getVal(vm, expr) {
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    // 获取编译文本后的结果   
    getTextVal(expr, vm) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1])
        })
    },
    // 文本处理
    text(node, vm, expr) {
        let updaterFn = this.updater['textUpdater']
        // {{message.a}} =>[message, a]
        let value = this.getTextVal(expr, vm)
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {

            new Watcher(vm, arguments[1], () => {
                // 如果数据变化了 文本节点需要重新获取依赖的属性更新文章
                updaterFn && updaterFn(node, this.getTextVal(expr, vm))
            })
        })

        updaterFn && updaterFn(node, value)
    },
    setVal(vm, expr, value) {
        expr = expr.split('.')
        return expr.reduce((prev, next, currentIndex) => {
            if (currentIndex === expr.length - 1) {
                return prev[next] = value
            }
            return prev[next]
        }, vm.$data)
    },
    // 输入框处理
    model(node, vm, expr) {
        let updaterFn = this.updater['modelUpdater']
        // 这里应该加一个监控  数据变化调用
        new Watcher(vm, expr, (newValue) => {
            // 当值变化调用cb
            updaterFn && updaterFn(node, this.getVal(vm, expr))
        });
        node.addEventListener('input', (e) => {
            let newValue = e.target.value
            this.setVal(vm, expr, newValue)

        })
        updaterFn && updaterFn(node, this.getVal(vm, expr))
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value
        },
        // 输入框更新
        modelUpdater(node, value) {
            node.value = value
        }
    }
}