const TEST_MENU_STRING = `
 + Hello$>https://www.google.com
 + Goodbye
   - helo
     - hi #2
       - hi #3
       - hi #3.1
     - hi #4
 + hi
`

const MENU_STRING = `
 - Home$>/
 - Resume$>/resume/
 + Experience$>/experience/
   - Robotics / ROS$>/experience/ece383-project/
 - Music$>/music/
 - Photography$>/photography/
 - Contact$>/contact/
 - Cookies?$>/cookies/
`


/**
 * @param {Array<number>} array
 */
function sumOfArray(array) {
    return array.reduce((partialSum, a) => partialSum + a, 0);
}

class Menu {
    /**
     * @param {HTMLDivElement} menuRoot
     * @param {MenuItem} menuParent
     */
    constructor (menuRoot, menuParent = null) {
        this.domElement = menuRoot
        this.menuParent = menuParent
        /** @type {Array<MenuItem>} */ this.items = []
    }
    
    /**
     * @param {string} text
     * @param {function} onClick
     * @returns {MenuItem}
     */
    addItem(text, onClick) {
        const menuItem = new MenuItem(text, this.menuParent, onClick)
        this.domElement.appendChild(menuItem.domElement)
        this.items.push(menuItem)
        return menuItem
    }

}

class MenuItem {
    /**
     * @param {string} text
     * @param {MenuItem} menuParent
     * @param {function} onClick
     */
    constructor(text, menuParent, onClick) {
        const item = document.createElement("div")
        item.innerText = text
        item.classList.add("overlay-menu-item")
        item.addEventListener("click", onClick || (() => {
            console.log("onClick not yet defined for menu item " + text)
        }))
        this.domElement = item
        this.submenu = undefined
        this.submenuHeight = 0
        this.menuParent = menuParent
        this.text = text
        this.expanded = false
    }

    addSubmenu() {

        this.domElement.classList.add("expansion-head")

        const submenuRoot = document.createElement("div")
        submenuRoot.classList.add("expandable")

        const plusIcon = document.createElement("div")

        plusIcon.innerText = "+"
        plusIcon.classList.add("menu-expander")
        plusIcon.addEventListener("click", () => {
            if (submenuRoot.style.opacity === "1") {
                this.collapse()
            } else {
                this.expand()
            }            
        })

        this.domElement.insertAdjacentElement("afterend", plusIcon)
        plusIcon.insertAdjacentElement("afterend", submenuRoot)

        this.plusIcon = plusIcon
        this.submenu = new Menu(submenuRoot, this)


    }

    expand() {
        if (!this.submenu) return
        this.expanded = true
        this.submenuHeight = this.calculateHeightBelow()
        this.submenu.domElement.style.opacity = 1
        this.plusIcon.innerText = "-"
        this.refreshHeight()
    }

    collapse() {
        if (!this.submenu) return
        this.expanded = false
        this.submenuHeight = 0
        this.submenu.domElement.style.opacity = 0
        this.plusIcon.innerText = "+"
        this.refreshHeight()
    }

    calculateHeightBelow() {
        return this.expanded ? sumOfArray(this.submenu.items.map(
            (menuItem) => 54 + menuItem.submenuHeight
        )) : 0
    }

    refreshHeight() {
        this.submenu.domElement.style.height = this.submenuHeight + "px"
        if (this.menuParent) {
            this.menuParent.submenuHeight = 
                this.menuParent.calculateHeightBelow()
            this.menuParent.refreshHeight()
        }
    }

    /**
     * @param {string} text
     * @param {function} onClick
     * @returns {MenuItem}
     * 
     * Returns the newly created subitem.
     */
    addItem(text, onClick) {
        if (!this.submenu) this.addSubmenu()
        return this.submenu.addItem(text, onClick)
    }

}

/**
 * @param {string} s
 * @param {Menu} menu
 */
function createMenuFromString(s, menu) {

    /** @param {string} l */
    function getLineIndentLevel(l) {
        let counter = 0
        while (l[counter] === " ") counter += 1
        return counter
    }

    /** @type {Array<MenuItem>} */ const needsExpansion = []

    const lines = s.split("\n")
    let currentLineIndex = 1; // Ignore first line
    let lastMenuItem;

    /** @param {Menu|MenuItem} root */
    function addChildrenToMenu(root) {
        let minIndentation = getLineIndentLevel(lines[currentLineIndex])
        while (currentLineIndex < lines.length - 1) { // Ignore last line
            const indentation = getLineIndentLevel(lines[currentLineIndex])
            if (indentation < minIndentation) {
                return // equivalent to `break`
            } else if (indentation === minIndentation) {

                // add item
                const newItemContent = lines[currentLineIndex].substring(indentation)
                const newItemExpansion = newItemContent[0]
                const newItemTextAndUrl = newItemContent.substring(2).split("$")
                const newItemText = newItemTextAndUrl[0]
                let urlMethod, url;

                if (newItemTextAndUrl[1]) {
                    urlMethod = newItemTextAndUrl[1][0]
                    url = newItemTextAndUrl[1].substring(1)
                }

                const newItem = urlMethod ? root.addItem(newItemText, () => {
                    switch (urlMethod) {
                        case ">":
                            window.location.href = url;
                            break;
                        default:
                            window.open(url)
                    }
                }) : root.addItem(newItemText)

                if (newItemExpansion === "-")
                    needsExpansion.push(newItem)

                lastMenuItem = newItem
                currentLineIndex++
                
            } else { // indentation > minIndentation
                addChildrenToMenu(lastMenuItem)
            }
        }
    }

    addChildrenToMenu(menu)
    needsExpansion.forEach((menuItem) => menuItem.expand())
}

function createMenu() {
    const menu = new Menu(document.getElementById("menu-content"))
    createMenuFromString(MENU_STRING, menu)
}
