'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Suspense } from 'react';

interface SensorData {
  id: string;
  name: string;
  temperature: number;
  unit: string;
  position: [number, number, number];
}

interface ModelViewerProps {
  sensors: Array<{
    id: string;
    name: string;
    temperature: number;
    unit: string;
  }>;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={0.5} />;
}

function SensorLabel({ sensor }: { sensor: SensorData }) {
  return (
    <Html position={sensor.position} distanceFactor={10}>
      <div className="px-3 py-2 rounded-lg whitespace-nowrap">
        <div className="text-xs font-semibold text-slate-700">{sensor.name}</div>
        <div className="text-lg font-bold text-blue-600">
          {sensor.temperature}{sensor.unit}
        </div>
      </div>
    </Html>
  );
}

const sensorPositionMap: Record<string, [number, number, number]> = {
  '1': [2, 0.75, 2],
  '2': [-2, 0.5, 2],
  '3': [0, 0, 2],
  '4': [0, 0, 0],
  '5': [-2, 3, -2],
};

export default function ModelViewer({ sensors }: ModelViewerProps) {
  const sensorPositions: SensorData[] = sensors.map((sensor) => ({
    ...sensor,
    position: sensorPositionMap[sensor.id] || [0, 0, 0],
  }));
  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-lg">
      <Canvas
        camera={{ position: [6, 6, 6], fov: 50 }}
        gl={{ alpha: true }}
      >
        <color attach="background" args={['#ffffff']} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <Model url="/1.glb" />
          {sensorPositions.map((sensor) => (
            <SensorLabel key={sensor.id} sensor={sensor} />
          ))}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
