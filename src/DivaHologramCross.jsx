// DivaHologramCross.jsx
import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';

const DEFAULT_MODEL_PATH = null; // No default model until user provides one

const Loader = () => {
  const { progress } = useProgress();
  return <Html center style={{ color: 'white' }}>{progress.toFixed(0)} %</Html>;
};

const DivaModel = ({ rotation = [0, 0, 0], modelUrl }) => {
  if (!modelUrl) {
    return (
      <Html center style={{ color: 'white', textAlign: 'center' }}>
        <div>
          <p>No model loaded</p>
          <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
            Drag and drop a .glb file to view
          </p>
        </div>
      </Html>
    );
  }
  
  const { scene } = useGLTF(modelUrl);
  return (
    <primitive
      object={scene}
      rotation={rotation}
      position={[0, -1.2, 0]}
      scale={1.5}
    />
  );
};

const Viewport = ({ cameraPosition, rotation, style, modelUrl }) => (
  <div style={style}>
    <Canvas camera={{ position: cameraPosition, fov: 35 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={<Loader />}>
        <DivaModel rotation={rotation} modelUrl={modelUrl} />
      </Suspense>
      {modelUrl && <OrbitControls enableZoom={false} />}
    </Canvas>
  </div>
);

export default function DivaHologramCross() {
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_PATH);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.glb')) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'model/gltf-binary': ['.glb'] },
    maxFiles: 1
  });

  useEffect(() => {
    if (modelUrl) {
      try {
      useGLTF.preload(modelUrl);
      } catch (e) {
      console.warn(`Preload failed: ${modelUrl} not found`, e);
      }
    }
  }, [modelUrl]);

  return (
    <div
      {...getRootProps()}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        width: '100vw',
        height: '100vh',
        background: 'black',
        position: 'relative',
        border: isDragActive ? '2px dashed white' : 'none'
      }}
    >
      <input {...getInputProps()} />
      <div></div>

      {/* Top (Front View) */}
      <Viewport
        cameraPosition={[0, 0, 5]}
        rotation={[0, 0, 0]}
        style={{ gridColumn: 2, gridRow: 1 }}
        modelUrl={modelUrl}
      />

      <div></div>

      {/* Left (Left View) */}
      <Viewport
        cameraPosition={[-5, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        style={{ gridColumn: 1, gridRow: 2 }}
        modelUrl={modelUrl}
      />

      <div></div>

      {/* Right (Right View) */}
      <Viewport
        cameraPosition={[5, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        style={{ gridColumn: 3, gridRow: 2 }}
        modelUrl={modelUrl}
      />

      <div></div>

      {/* Bottom (Back View) */}
      <Viewport
        cameraPosition={[0, 0, -5]}
        rotation={[0, Math.PI, 0]}
        style={{ gridColumn: 2, gridRow: 3 }}
        modelUrl={modelUrl}
      />

      <div></div>

      {isDragActive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          pointerEvents: 'none'
        }}>
          Drop your .glb file here
        </div>
      )}
      
      {!modelUrl && !isDragActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <h2>3D Model Viewer</h2>
          <p>Drag and drop a .glb file to get started</p>
        </div>
      )}
    </div>
  );
}
