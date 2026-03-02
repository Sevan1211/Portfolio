import type { Object3DNode, ThreeElements } from '@react-three/fiber';
import type * as THREE from 'three';

type FiberIntrinsicElements = ThreeElements & {
	fog: Object3DNode<THREE.Fog, typeof THREE.Fog>;
	directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
	ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
	hemisphereLight: Object3DNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>;
	group: Object3DNode<THREE.Group, typeof THREE.Group>;
	primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
	mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
	planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
	boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
	meshBasicMaterial: Object3DNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
};

declare global {
	namespace React {
		namespace JSX {
			// eslint-disable-next-line @typescript-eslint/no-empty-object-type
			interface IntrinsicElements extends FiberIntrinsicElements {}
		}
	}

	namespace JSX {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface IntrinsicElements extends FiberIntrinsicElements {}
	}
}
