export const FILTERS = [
  {
    id: "normal",
    name: "Original",
    css: "none",
    canvasFilter: "none"
  },
  {
    id: "bw",
    name: "Classic B&W",
    css: "grayscale(100%) contrast(110%)",
    canvasFilter: "grayscale(100%) contrast(110%)"
  },
  {
    id: "vintage",
    name: "Vintage Film",
    css: "sepia(45%) contrast(95%) brightness(105%) saturate(85%)",
    canvasFilter: "sepia(45%) contrast(95%) brightness(105%) saturate(85%)"
  },
  {
    id: "warm",
    name: "Warm Sun",
    css: "sepia(25%) saturate(130%) brightness(104%)",
    canvasFilter: "sepia(25%) saturate(130%) brightness(104%)"
  },
  {
    id: "rosy",
    name: "Rosy Sweet",
    css: "sepia(20%) saturate(135%) hue-rotate(330deg) brightness(102%)",
    canvasFilter: "sepia(20%) saturate(135%) hue-rotate(330deg) brightness(102%)"
  },
  {
    id: "cool",
    name: "Cool Blue",
    css: "hue-rotate(180deg) saturate(90%) contrast(95%) brightness(105%)",
    canvasFilter: "hue-rotate(180deg) saturate(90%) contrast(95%) brightness(105%)"
  },
  {
    id: "noir",
    name: "Film Noir",
    css: "grayscale(100%) contrast(165%) brightness(85%)",
    canvasFilter: "grayscale(100%) contrast(165%) brightness(85%)"
  },
  {
    id: "dreamy",
    name: "Dreamy Pastel",
    css: "brightness(112%) contrast(88%) saturate(125%)",
    canvasFilter: "brightness(112%) contrast(88%) saturate(125%)"
  }
];

export const DEFAULT_FILTER = "normal";
