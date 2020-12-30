class Projekt {
    private _id?: number;
    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }
    private _name?: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
}

document.addEventListener('onload', () => {
    let xr = new XMLHttpRequest();
    xr.open('GET', 'jsp/projekte.jsp', true);

    xr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let resp: Projekt[] = JSON.parse(this.responseText);
            for (let projekt of resp) {
                let eintrag = document.createElement('li');
                let link = document.createElement('a');
                link.href = 'edit.htm?projekt=' + projekt.id;
                link.innerHTML = projekt.name;

                document.getElementById('projekte').appendChild(eintrag)
            }
        }
    }
});