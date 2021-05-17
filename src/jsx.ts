const events: { [key: string]: ((ev: Event) => void)[] } = {};

export const JSX = {

    addEventListener(event: string, fn: (ev: Event) => void) {
        if (!events[event]) {
            events[event] = [];
        }

        events[event].push(fn);
    },

    /**
     * The tag name and create an html together with the attributes
     *
     * @param  {String} tagName name as string, e.g. 'div', 'span', 'svg'
     * @param  {Object} attrs html attributes e.g. data-, width, src
     * @param  {Array} children html nodes from inside de elements
     * @return {HTMLElement|SVGElement} html node with attrs
     */
    createElements(tagName, attrs, children) {
        const element = JSX.isSVG(tagName)
            ? document.createElementNS('http://www.w3.org/2000/svg', tagName)
            : document.createElement(tagName)

        // one or multiple will be evaluated to append as string or HTMLElement
        const fragment = JSX.createFragmentFrom(children)
        element.appendChild(fragment)

        Object.keys(attrs || {}).forEach(prop => {
            if (prop === 'style' && typeof attrs.style === 'object') {
                // e.g. origin: <element style={{ prop: value }} />
                Object.assign(element.style, attrs[prop])
            } else if (prop === 'ref' && typeof attrs.ref === 'function') {
                attrs.ref(element, attrs)
            } else if (prop === 'class') {
                attrs.class.split(/\s+/).forEach(className => {
                    element.classList.add(className);
                });
            } else if (prop === 'htmlFor') {
                element.setAttribute('for', attrs[prop])
            } else if (prop === 'xlinkHref') {
                element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', attrs[prop])
            } else if (prop === 'dangerouslySetInnerHTML') {
                // eslint-disable-next-line no-underscore-dangle
                element.innerHTML = attrs[prop].__html
            } else if (prop.startsWith("ev-")) {
                const evName = prop.substring(3);
                const evFnName = attrs[prop];

                element.addEventListener(evName, (ev) => {
                    if (events[evFnName]) {
                        events[evFnName].forEach(f => f(ev));
                    }
                }, false);
            } else {
                // any other prop will be set as attribute
                element.setAttribute(prop, attrs[prop])
            }
        })

        return element
    },

    /**
     * The JSXTag will be unwrapped returning the html
     *
     * @param  {Function} JSXTag name as string, e.g. 'div', 'span', 'svg'
     * @param  {Object} elementProps custom jsx attributes e.g. fn, strings
     * @param  {Array} children html nodes from inside de elements
     *
     * @return {Function} returns de 'dom' (fn) executed, leaving the HTMLElement
     *
     * JSXTag:  function Comp(props) {
     *   return dom("span", null, props.num);
     * }
     */
    composeToFunction(JSXTag, elementProps, children) {
        const props = Object.assign({}, JSXTag.defaultProps || {}, elementProps, {children})
        const bridge = JSXTag.prototype?.render ? new JSXTag(props).render : JSXTag
        const result = bridge(props)

        switch (result) {
            case 'FRAGMENT':
                return JSX.createFragmentFrom(children)

            // Portals are useful to render modals
            // allow render on a different element than the parent of the chain
            // and leave a comment instead
            case 'PORTAL':
                bridge.target.appendChild(JSX.createFragmentFrom(children))
                return document.createComment('Portal Used')
            default:
                return result
        }
    },

    dom(element, attrs, ...children) {
        // Custom Components will be functions
        if (typeof element === 'function') {
            // e.g. const CustomTag = ({ w }) => <span width={w} />
            // will be used
            // e.g. <CustomTag w={1} />
            // becomes: CustomTag({ w: 1})
            return JSX.composeToFunction(element, attrs, children)
        }

        // regular html components will be strings to create the elements
        // this is handled by the babel plugins
        if (typeof element === 'string') {
            return JSX.createElements(element, attrs, children)
        }

        return console.error(`jsx-render does not handle ${typeof element}`)
    },

    isSVG(element) {
        const patt = new RegExp(`^${element}$`, 'i')
        const SVGTags = ['path', 'svg', 'use', 'g']

        return SVGTags.some(tag => patt.test(tag))
    },

    createFragmentFrom(children) {
        // fragments will help later to append multiple children to the initial node
        const fragment = document.createDocumentFragment()

        function processDOMNodes(child) {
            if (
                child instanceof HTMLElement ||
                child instanceof SVGElement ||
                child instanceof Comment ||
                child instanceof DocumentFragment
            ) {
                fragment.appendChild(child)
            } else if (typeof child === 'string' || typeof child === 'number') {
                const textnode = document.createTextNode(child.toString())
                fragment.appendChild(textnode)
            } else if (child instanceof Array) {
                child.forEach(processDOMNodes)
            } else if (child === false || child === null) {
                // expression evaluated as false e.g. {false && <Elem />}
                // expression evaluated as false e.g. {null && <Elem />}
            } else {
                // later other things could not be HTMLElement nor strings
            }
        }

        children.forEach(processDOMNodes)

        return fragment
    }
}