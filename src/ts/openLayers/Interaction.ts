// SPDX-License-Identifier: GPL-3.0-or-later

import Geometry from 'ol/geom/Geometry';
import { Modify, Select } from 'ol/interaction';

/**
 * OpenLayers-ModifyInteraktion
 * @author Florian Timm, Landesbetrieb Geoinformation und Vermessung, Hamburg
 * @version 2019.06.06
 * @license GPL-3.0-or-later
*/
export class ModifyInteraction extends Modify {
    geo_vorher?: Geometry = null;
}

/**
 * OpenLayers-SelectInteraktion
 * @author Florian Timm, Landesbetrieb Geoinformation und Vermessung, Hamburg
 * @version 2019.06.06
 * @license GPL-3.0-or-later
*/

export class SelectInteraction extends Select {

}