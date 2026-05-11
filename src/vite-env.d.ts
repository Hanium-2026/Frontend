/// <reference types="vite/client" />

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "slick-carousel/slick/slick.css";
declare module "slick-carousel/slick/slick-theme.css";
