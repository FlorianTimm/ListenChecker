import { Feature, Map } from "ol";
import { View } from 'ol';
import { defaults as defaultControls, ScaleLine, ZoomSlider } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';
import { fromLonLat, toLonLat } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import { TileWMS as TileWMS, Vector } from 'ol/source';
import OSM from 'ol/source/OSM';
import proj4 from 'proj4';
import { TileLayer } from './openLayers/Layer';
import LayerSwitch from './LayerSwitch';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

window.onload = (_evt: Event) => {
    //proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs");
    proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    register(proj4);
    new Editor(<HTMLDivElement>document.getElementById('map'));
};

export default class Editor {
    private projekt: string;
    private map: Map;
    private vectorLayerSource: VectorSource;
    timer: number;

    constructor(div: HTMLDivElement) {
        const urlParams = new URLSearchParams(window.location.search);
        this.projekt = urlParams.get('projekt')

        this.createMap(div);

        this.getGeometrie();

        document.getElementById('ueberspringen').onclick = this.ueberspringen.bind(this);
        document.getElementById('fehler').onclick = this.fehler.bind(this);
        document.getElementById('spaeter').onclick = this.spaeter.bind(this);
        document.getElementById('inOrdnung').onclick = this.inordnung.bind(this);
        document.getElementById('bearbeitet').onclick = this.bearbeitet.bind(this);

        document.onkeyup = function (e) {
            if (e.key == '1') {
                this.fehler();
            } else if (e.key == '2') {
                this.spaeter();
            } else if (e.key == '3') {
                this.inordnung();
            } else if (e.key == '6') {
                this.bearbeitet();
            } else if (e.key == '0') {
                this.ueberspringen();
            }
        }.bind(this);
    }

    private createMap(div: HTMLDivElement) {
        this.map = new Map({
            layers: [
                new TileLayer({
                    name: 'OpenStreetMap',
                    visible: false,
                    switchable: true,
                    source: new OSM()
                }),
                new TileLayer({
                    name: 'ALKIS',
                    visible: false,
                    switchable: true,
                    opacity: 1,
                    source: new TileWMS({
                        url: 'http://geodienste.hamburg.de/HH_WMS_ALKIS_Basiskarte',
                        params: {
                            'LAYERS': '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,26,27,28,29,30,32,33,34,35,36,37',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),
                new TileLayer({
                    name: 'LGV DOP 2017',
                    visible: false,
                    switchable: true,
                    opacity: 1.0,
                    source: new TileWMS({
                        url: 'http://geodienste.hamburg.de/HH_WMS_DOP10',
                        params: {
                            'LAYERS': '1',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),
                new TileLayer({
                    name: 'LGV DOP 2018',
                    visible: true,
                    switchable: true,
                    opacity: 1.00,
                    source: new TileWMS({
                        url: 'https://geodienste.hamburg.de/HH_WMS_DOP_hochaufloesend',
                        params: {
                            'LAYERS': 'dop_hochaufloesend_highres,dop_hochaufloesend_downscale',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),

                new TileLayer({
                    name: 'LGV TrueDOP 2018',
                    visible: false,
                    switchable: true,
                    opacity: 1.0,
                    source: new TileWMS({
                        url: 'https://geodienste.hamburg.de/HH_WMS_TrueDOP',
                        params: {
                            'LAYERS': 'tdop_hochaufloesend_89,tdop_hochaufloesend_downscale',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),
                new TileLayer({
                    name: 'LGV DOP 2019 belaubt',
                    visible: false,
                    switchable: true,
                    opacity: 1.0,
                    source: new TileWMS({
                        url: 'https://geodienste.hamburg.de/HH_WMS_DOP_hochaufloesend_belaubt',
                        params: {
                            'LAYERS': 'DOP_hochaufloesend_belaubt_highres,DOP_hochaufloesend_belaubt_downscale',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),
                new TileLayer({
                    name: 'CAD-Daten',
                    visible: false,
                    switchable: true,
                    opacity: 0.85,
                    source: new TileWMS({
                        url: 'http://gv-srv-w00118:20031/deegree/services/wms',
                        params: {
                            'LAYERS': 'wburg',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),

                new TileLayer({
                    name: 'Kreuzungsskizzen',
                    visible: false,
                    switchable: true,
                    opacity: 0.85,
                    source: new TileWMS({
                        url: 'https://geodienste.hamburg.de/HH_WMS_Kreuzungsskizzen',
                        params: {
                            'LAYERS': 'poldata_text,poldata_lines,poldata_poly',
                            'FORMAT': 'image/png'
                        },
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),

                new TileLayer({
                    name: "Querschnitte (Dienst)",
                    visible: false,
                    switchable: true,
                    opacity: 0.6,
                    source: new TileWMS({
                        url: 'http://gv-srv-w00118:20031/deegree/services/wms?',
                        params: {
                            'LAYERS': 'querschnitte',
                            'STYLE': 'querschnitte_gruppiert',
                            'FORMAT': 'image/png'
                        },
                        serverType: ('geoserver'),
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),
                new TileLayer({
                    name: "Bezirks-Feinkartierung",
                    visible: false,
                    switchable: true,
                    opacity: 0.8,
                    source: new TileWMS({
                        url: 'https://geodienste.hamburg.de/HH_WMS_Feinkartierung_Strasse?',
                        params: {
                            'LAYERS': 'b_altona_mr_feinkartierung_flaechen,b_harburg_mr_feinkartierung_flaechen,b_mitte_mr_feinkartierung_flaechen,b_eims_mr_feinkartierung_flaechen,b_wands_mr_feinkartierung_flaechen',
                            'FORMAT': 'image/png'
                        },
                        serverType: ('geoserver'),
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019']
                    })
                }),
                new TileLayer({
                    name: "Netz",
                    opacity: 0.5,
                    visible: true,
                    source: new TileWMS({
                        url: 'https://geodienste.hamburg.de/DE_HH_WMS_INSPIRE_A1_7_Verkehrsnetze',
                        attributions: ['Freie und Hansestadt Hamburg, LGV 2019'],
                        params: {
                            'LAYERS': 'strassennetz_inspire_bab,strassennetz_inspire_bfs,strassennetz_inspire_bod,strassennetz_inspire_g',
                            'FORMAT': 'image/png'
                        }
                    })
                })
            ],
            target: 'map',
            interactions: defaultInteractions({
                pinchRotate: false
            }),
            controls: defaultControls().extend([new LayerSwitch(), new ScaleLine(), new ZoomSlider()]),
            view: new View({
                projection: 'EPSG:25832',
                center: fromLonLat([10.0045, 53.4975], 'EPSG:25832'),
                zoom: 17,
                minZoom: 11,
                maxZoom: 24,
                //extent: transform([548000, 5916500, 588500, 5955000], 'EPSG:25832', CONFIG.EPSG_CODE),
            })
        });

        let other_div = document.createElement("div");
        other_div.id = "othermaps";
        other_div.className = "ol-control ol-unselectable";
        document.body.appendChild(other_div);

        let mapillary = document.createElement("button");
        mapillary.innerHTML = "Mappillary";
        other_div.appendChild(mapillary);
        mapillary.addEventListener("click", () => {
            let view = this.map.getView();
            let middle = toLonLat(view.getCenter(), 'EPSG:25832')
            let url = "https://www.mapillary.com/app/?lat=" + middle[1] + "&lng=" + middle[0] + "&z=" + (view.getZoom() - 2);
            let win = window.open(url, 'zweitkarte');
            win.focus();
        })

        let google = document.createElement("button");
        google.innerHTML = "Google";
        other_div.appendChild(google);
        google.addEventListener("click", () => {
            let view = this.map.getView();
            let middle = toLonLat(view.getCenter(), 'EPSG:25832')
            let url = "https://www.google.com/maps/@" + middle[1] + "," + middle[0] + "," + (view.getZoom() - 1) + "z";
            let win = window.open(url, 'zweitkarte');
            win.focus();
        })

        let geoportal = document.createElement("button");
        geoportal.innerHTML = "Geoportal";
        other_div.appendChild(geoportal);
        geoportal.addEventListener("click", () => {
            let view = this.map.getView();
            let middle = view.getCenter()
            let zoom = Math.round(((view.getZoom() - 10) > 9) ? 9 : (view.getZoom() - 11))
            let url = "https://geofos.fhhnet.stadt.hamburg.de/FHH-Atlas/?center=" + middle[0] + "," + middle[1] + "&zoomlevel=" + zoom;
            let win = window.open(url, 'zweitkarte');
            win.focus();
        })
    }

    private getGeometrie() {
        let xr = new XMLHttpRequest();
        xr.open('GET', 'jsp/geometrie.jsp?projekt=' + this.projekt, true);

        xr.onreadystatechange = () => {
            this.geomCallback(xr);
        }
        xr.send(null);

        if (this.timer) window.clearTimeout(this.timer);
        this.timer = window.setTimeout(this.zeitAbgelaufen.bind(this), 15 * 60 * 1000);
    }

    private geomCallback(xr: XMLHttpRequest) {
        if (xr.readyState === XMLHttpRequest.DONE && xr.status === 200) {
            let resp: { gid: number; geom?: { type: "Point" | "LineString" | "Polygon"; coordinates: number[] | number[][] | number[][][]; }; } = JSON.parse(xr.responseText);
            let vectorSource = this.getVectorLayerSource();
            vectorSource.clear();
            let features = new GeoJSON().readFeatures(resp);
            vectorSource.addFeatures(features);
            let view = this.map.getView();
            view.fit(vectorSource.getExtent());

            if (view.getZoom() > 20)
                view.setZoom(20);

            let sidebar_data = document.getElementById("data");
            let table = document.createElement("table");
            sidebar_data.appendChild(table);
            features.forEach((feature: Feature) => {
                let prop = feature.getProperties();
                for (let tag in prop) {
                    if (['geometry', 'gid', 'status', 'last_selected'].indexOf(tag) >= 0)
                        continue;
                    let tr = document.createElement('tr');
                    let td1 = document.createElement('td');
                    td1.innerHTML = tag;
                    tr.appendChild(td1);
                    let td2 = document.createElement('td');
                    td2.innerHTML = prop[tag];
                    tr.appendChild(td2);
                    table.appendChild(tr);
                }
            });

            document.getElementById("buttons").style.display = 'block'
        }
    }

    private zeitAbgelaufen() {
        this.ueberspringen();
    }

    private ueberspringen() {
        this.setStatus(-1);
    }

    private naechster(): number | string {
        let vectorSource = this.getVectorLayerSource();
        let feat = vectorSource.getFeatures().pop();
        let id = feat.get('gid');
        vectorSource.clear();
        window.clearTimeout(this.timer);
        document.getElementById("data").innerHTML = "";
        document.getElementById("buttons").style.display = 'none'
        return id;
    }

    private fehler() {
        this.setStatus(0);
    };

    private inordnung() {
        this.setStatus(100);
    }

    private spaeter() {
        this.setStatus(50);
    }

    private bearbeitet() {
        this.setStatus(110);
    }

    private setStatus(status: number) {
        let id = this.naechster();
        let xr = new XMLHttpRequest();
        xr.open('GET', 'jsp/geometrie.jsp?projekt=' + this.projekt + '&gid=' + id + '&status=' + status, true);
        xr.onreadystatechange = (test) => {
            this.geomCallback(xr);
        }
        xr.send(null);
    }

    private getVectorLayerSource() {
        if (!this.vectorLayerSource) {
            this.vectorLayerSource = new VectorSource();
            let vectorLayer = new VectorLayer({ source: this.vectorLayerSource });
            this.map.addLayer(vectorLayer);
            
            vectorLayer.setStyle(new Style({
                stroke: new Stroke({
                    color: 'magenta',
                    width: 4,
                }),
                fill: null/*new Fill({
                    color: 'rgba(255,0,0,0.1)',
                })*/,
                image: new CircleStyle({
                    radius: 10,
                    /*fill: new Fill({
                        color: 'rgba(255,0,0,0.1)',
                    }),*/
                    stroke: new Stroke({
                        color: 'magenta',
                    }),
                }),
            }))
        }
        return this.vectorLayerSource;
    }
}