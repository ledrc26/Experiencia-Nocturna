import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        renderer?: string;
        'mindar-face'?: string;
        embedded?: boolean | string;
        'color-space'?: string;
        'vr-mode-ui'?: string;
        'device-orientation-permission-ui'?: string;
      };
      'a-assets': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'a-asset-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        src?: string;
      };
      'a-camera': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        active?: string;
        position?: string;
      };
      'a-light': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: string;
        intensity?: string;
        position?: string;
      };
      'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'mindar-face-target'?: string;
        position?: string;
        rotation?: string;
        scale?: string;
      };
      'a-gltf-model': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        position?: string;
        rotation?: string;
        scale?: string;
        'animation-mixer'?: boolean | string;
      };
    }
  }
}