export const FILTERS = [
  {
    id: "normal",
    name: "Natural 400",
    css: "none",
    canvasFilter: "none"
  },
  {
    id: "bw",
    name: "Tri-X B&W",
    css: "grayscale(100%) contrast(114%)",
    canvasFilter: "grayscale(100%) contrast(114%)"
  },
  {
    id: "vintage",
    name: "Kodachrome 74",
    css: "sepia(38%) contrast(98%) brightness(103%) saturate(88%)",
    canvasFilter: "sepia(38%) contrast(98%) brightness(103%) saturate(88%)"
  },
  {
    id: "warm",
    name: "Portra Gold",
    css: "sepia(24%) saturate(126%) brightness(104%)",
    canvasFilter: "sepia(24%) saturate(126%) brightness(104%)"
  },
  {
    id: "rosy",
    name: "Warm Tungsten",
    css: "sepia(20%) saturate(125%) hue-rotate(335deg) brightness(101%)",
    canvasFilter: "sepia(20%) saturate(125%) hue-rotate(335deg) brightness(101%)"
  },
  {
    id: "cool",
    name: "Cinestill Cool",
    css: "hue-rotate(180deg) saturate(82%) contrast(96%) brightness(104%)",
    canvasFilter: "hue-rotate(180deg) saturate(82%) contrast(96%) brightness(104%)"
  },
  {
    id: "noir",
    name: "Silver Noir",
    css: "grayscale(100%) contrast(165%) brightness(86%)",
    canvasFilter: "grayscale(100%) contrast(165%) brightness(86%)"
  },
  {
    id: "dreamy",
    name: "Overexposed",
    css: "brightness(112%) contrast(88%) saturate(112%)",
    canvasFilter: "brightness(112%) contrast(88%) saturate(112%)"
  }
];

export const DEFAULT_FILTER = "normal";
