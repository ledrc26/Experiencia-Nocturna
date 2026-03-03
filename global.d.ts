import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Le decimos a TS que acepte estas etiquetas y cualquier propiedad (any) dentro de ellas
      'a-scene': any;
      'a-marker': any;
      'a-entity': any;
    }
  }
}