function getColorBasedOnPercentage(thePercentage) {
  var hue = Math.floor((thePercentage * 120) / 100); // go from red to green
  var saturation = Math.abs(thePercentage - 50) / 50;
  return hsv2rgb(hue, saturation, 1);
}

var hsv2rgb = function (h, s, v) {
  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
  var rgb,
    i,
    data = [];
  if (s === 0) {
    rgb = [v, v, v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
    switch (i) {
      case 0:
        rgb = [v, data[2], data[0]];
        break;
      case 1:
        rgb = [data[1], v, data[0]];
        break;
      case 2:
        rgb = [data[0], v, data[2]];
        break;
      case 3:
        rgb = [data[0], data[1], v];
        break;
      case 4:
        rgb = [data[2], data[0], v];
        break;
      default:
        rgb = [v, data[0], data[1]];
        break;
    }
  }
  return (
    '#' +
    rgb
      .map(function (x) {
        return ('0' + Math.round(x * 255).toString(16)).slice(-2);
      })
      .join('')
  );
};
module.exports = getColorBasedOnPercentage;

/**
 * Posted 12 September 2017 by @engineeryo
 */
global.RESOURCE_COLORS = {
  H: '#989898',
  O: '#989898',
  U: '#48C5E5',
  L: '#24D490',
  K: '#9269EC',
  Z: '#D9B478',
  X: '#F26D6F',
  energy: '#FEE476',
  battery: '#FEE476',
  power: '#F1243A',

  reductant: '#989898',
  oxidant: '#989898',
  utrium_bar: '#48C5E5',
  lemergium_bar: '#24D490',
  keanium_bar: '#9269EC',
  zynthium_bar: '#D9B478',
  purifier: '#F26D6F',

  OH: '#B4B4B4',
  ZK: '#B4B4B4',
  UL: '#B4B4B4',
  G: '#FFFFFF',

  ghodium_melt: '#FFFFFF',
  composite: '#FFFFFF',
  crystal: '#FFFFFF',
  liquid: '#FFFFFF',

  UH: '#50D7F9',
  UO: '#50D7F9',
  KH: '#A071FF',
  KO: '#A071FF',
  LH: '#00F4A2',
  LO: '#00F4A2',
  ZH: '#FDD388',
  ZO: '#FDD388',
  GH: '#FFFFFF',
  GO: '#FFFFFF',

  UH2O: '#50D7F9',
  UHO2: '#50D7F9',
  KH2O: '#A071FF',
  KHO2: '#A071FF',
  LH2O: '#00F4A2',
  LHO2: '#00F4A2',
  ZH2O: '#FDD388',
  ZHO2: '#FDD388',
  GH2O: '#FFFFFF',
  GHO2: '#FFFFFF',

  XUH2O: '#50D7F9',
  XUHO2: '#50D7F9',
  XKH2O: '#A071FF',
  XKHO2: '#A071FF',
  XLH2O: '#00F4A2',
  XLHO2: '#00F4A2',
  XZH2O: '#FDD388',
  XZHO2: '#FDD388',
  XGH2O: '#FFFFFF',
  XGHO2: '#FFFFFF',

  XGHO2: '#FFFFFF',

  metal: '#956F5C',
  alloy: '#956F5C',
  tube: '#956F5C',
  fixtures: '#956F5C',
  frame: '#956F5C',
  hydraulics: '#956F5C',
  machine: '#956F5C',

  biomass: '#84B012',
  cell: '#84B012',
  phlegm: '#84B012',
  tissue: '#84B012',
  muscle: '#84B012',
  organoid: '#84B012',
  organism: '#84B012',

  silicon: '#4DA7E5',
  wire: '#4DA7E5',
  switch: '#4DA7E5',
  transistor: '#4DA7E5',
  microchip: '#4DA7E5',
  circuit: '#4DA7E5',
  device: '#4DA7E5',

  mist: '#DA6BF5',
  condensate: '#DA6BF5',
  concentrate: '#DA6BF5',
  extract: '#DA6BF5',
  spirit: '#DA6BF5',
  emanation: '#DA6BF5',
  essence: '#DA6BF5',
};
