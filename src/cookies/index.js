function showCookies() {
    const cookieHost = document.getElementById("cookies-table")

    while (cookieHost.firstChild) cookieHost.removeChild(cookieHost.firstChild)

    const table = document.createElement("table")
    const headerRow = document.createElement("tr")
    const headers = ["Name", "Value"]
    headers.forEach(v => {
        const th = document.createElement("th")
        th.innerText = v
        headerRow.appendChild(th)
    });
    table.appendChild(headerRow)

    Object.getOwnPropertyNames(localStorage).forEach((propName) => {
        const tr = document.createElement("tr")
        const contents = [propName, localStorage[propName]]
        contents.forEach((v) => {
            const td = document.createElement("td")
            td.innerText = v
            tr.appendChild(td)
        })
        table.appendChild(tr)
    })

    cookieHost.appendChild(table)

}

ONLOAD_ADDONS.push(showCookies)