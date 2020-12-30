import Projekt from "./Projekt";

window.onload = (_evt: Event) => {
    let xr = new XMLHttpRequest();
    xr.open('GET', 'jsp/projekte.jsp', true);

    xr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let resp: Projekt[] = JSON.parse(this.responseText);
            for (let projekt of resp) {
                let eintrag = document.createElement('li');
                let link = document.createElement('a');
                eintrag.appendChild(link);
                link.href = 'edit.html?projekt=' + projekt.id;
                link.innerHTML = projekt.bezeichnung;

                document.getElementById('projekte').appendChild(eintrag)
            }
        }
    }
    xr.send(null);
};
