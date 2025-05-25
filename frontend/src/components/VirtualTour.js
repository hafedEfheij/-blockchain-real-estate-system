import React, { useState, useEffect, useRef } from 'react';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const VirtualTour = ({ property, onClose }) => {
  const [tourData, setTourData] = useState(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [tourMode, setTourMode] = useState('360'); // '360', '3d', 'ar'
  const viewerRef = useRef(null);

  useEffect(() => {
    loadTourData();
  }, [property]);

  const loadTourData = async () => {
    try {
      setLoading(true);
      
      // Mock virtual tour data
      const mockTourData = {
        propertyId: property.id,
        propertyLocation: property.location,
        totalScenes: 8,
        tourDuration: '5-7 minutes',
        lastUpdated: new Date(Date.now() - 86400000 * 30),
        scenes: [
          {
            id: 'scene1',
            name: 'Main Entrance',
            type: '360',
            imageUrl: 'https://via.placeholder.com/2048x1024/4a90e2/ffffff?text=360+Main+Entrance',
            description: 'Welcome to the main entrance with marble flooring and modern lighting',
            hotspots: [
              { x: 30, y: 45, type: 'navigation', target: 'scene2', label: 'Living Room' },
              { x: 70, y: 60, type: 'info', content: 'Italian marble flooring imported from Carrara' }
            ],
            measurements: { width: 12, length: 8, height: 10 }
          },
          {
            id: 'scene2',
            name: 'Living Room',
            type: '360',
            imageUrl: 'https://via.placeholder.com/2048x1024/50c878/ffffff?text=360+Living+Room',
            description: 'Spacious living room with floor-to-ceiling windows and city views',
            hotspots: [
              { x: 20, y: 30, type: 'navigation', target: 'scene1', label: 'Main Entrance' },
              { x: 80, y: 40, type: 'navigation', target: 'scene3', label: 'Kitchen' },
              { x: 50, y: 70, type: 'info', content: 'Smart home automation system controls lighting and temperature' }
            ],
            measurements: { width: 20, length: 15, height: 12 }
          },
          {
            id: 'scene3',
            name: 'Kitchen',
            type: '360',
            imageUrl: 'https://via.placeholder.com/2048x1024/ff6b6b/ffffff?text=360+Kitchen',
            description: 'Modern kitchen with premium appliances and granite countertops',
            hotspots: [
              { x: 15, y: 50, type: 'navigation', target: 'scene2', label: 'Living Room' },
              { x: 85, y: 35, type: 'navigation', target: 'scene4', label: 'Master Bedroom' },
              { x: 60, y: 80, type: 'info', content: 'Sub-Zero refrigerator and Wolf range included' }
            ],
            measurements: { width: 15, length: 12, height: 10 }
          },
          {
            id: 'scene4',
            name: 'Master Bedroom',
            type: '360',
            imageUrl: 'https://via.placeholder.com/2048x1024/9b59b6/ffffff?text=360+Master+Bedroom',
            description: 'Luxurious master bedroom with walk-in closet and en-suite bathroom',
            hotspots: [
              { x: 25, y: 45, type: 'navigation', target: 'scene3', label: 'Kitchen' },
              { x: 75, y: 55, type: 'navigation', target: 'scene5', label: 'Master Bathroom' },
              { x: 50, y: 30, type: 'info', content: 'California king bed with premium linens included' }
            ],
            measurements: { width: 18, length: 16, height: 11 }
          },
          {
            id: 'scene5',
            name: 'Master Bathroom',
            type: '360',
            imageUrl: 'https://via.placeholder.com/2048x1024/3498db/ffffff?text=360+Master+Bathroom',
            description: 'Spa-like master bathroom with soaking tub and separate shower',
            hotspots: [
              { x: 30, y: 60, type: 'navigation', target: 'scene4', label: 'Master Bedroom' },
              { x: 70, y: 40, type: 'info', content: 'Heated floors and towel warmers' }
            ],
            measurements: { width: 12, length: 10, height: 10 }
          }
        ],
        features: {
          '360Photos': true,
          '3DModel': true,
          'FloorPlan': true,
          'VirtualReality': true,
          'AugmentedReality': true,
          'Measurements': true,
          'Annotations': true,
          'VoiceNarration': false
        },
        analytics: {
          totalViews: 1247,
          averageViewTime: '4:32',
          completionRate: 78,
          mostViewedScene: 'Living Room',
          deviceBreakdown: {
            desktop: 45,
            mobile: 35,
            tablet: 15,
            vr: 5
          }
        }
      };

      setTourData(mockTourData);
      
    } catch (error) {
      console.error('Error loading tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSceneChange = (sceneIndex) => {
    setCurrentScene(sceneIndex);
  };

  const handleHotspotClick = (hotspot) => {
    if (hotspot.type === 'navigation') {
      const targetSceneIndex = tourData.scenes.findIndex(scene => scene.id === hotspot.target);
      if (targetSceneIndex !== -1) {
        setCurrentScene(targetSceneIndex);
      }
    } else if (hotspot.type === 'info') {
      alert(hotspot.content); // In a real app, this would show a modal or tooltip
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const TourViewer = () => {
    const currentSceneData = tourData.scenes[currentScene];
    
    return (
      <div className="position-relative" style={{ height: '500px', backgroundColor: '#000' }}>
        {/* 360 Image Viewer */}
        <img
          src={currentSceneData.imageUrl}
          alt={currentSceneData.name}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
        
        {/* Hotspots */}
        {showHotspots && currentSceneData.hotspots.map((hotspot, index) => (
          <button
            key={index}
            className={`btn btn-${hotspot.type === 'navigation' ? 'primary' : 'info'} btn-sm position-absolute`}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              padding: '0'
            }}
            onClick={() => handleHotspotClick(hotspot)}
            title={hotspot.label || hotspot.content}
          >
            <i className={`bi ${hotspot.type === 'navigation' ? 'bi-arrow-right' : 'bi-info'}`}></i>
          </button>
        ))}
        
        {/* Scene Info Overlay */}
        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-3">
          <h6 className="mb-1">{currentSceneData.name}</h6>
          <p className="mb-0 small">{currentSceneData.description}</p>
          {currentSceneData.measurements && (
            <small className="text-muted">
              {currentSceneData.measurements.width}' × {currentSceneData.measurements.length}' × {currentSceneData.measurements.height}'
            </small>
          )}
        </div>
      </div>
    );
  };

  const TourControls = () => (
    <div className="d-flex justify-content-between align-items-center p-3 bg-light">
      <div className="btn-group">
        <button
          className="btn btn-outline-secondary"
          onClick={() => handleSceneChange(Math.max(0, currentScene - 1))}
          disabled={currentScene === 0}
        >
          <i className="bi bi-chevron-left"></i> Previous
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => handleSceneChange(Math.min(tourData.scenes.length - 1, currentScene + 1))}
          disabled={currentScene === tourData.scenes.length - 1}
        >
          Next <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      
      <div className="btn-group">
        <button
          className={`btn ${tourMode === '360' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setTourMode('360')}
        >
          360°
        </button>
        <button
          className={`btn ${tourMode === '3d' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setTourMode('3d')}
        >
          3D
        </button>
        <button
          className={`btn ${tourMode === 'ar' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setTourMode('ar')}
        >
          AR
        </button>
      </div>
      
      <div className="btn-group">
        <button
          className={`btn ${showHotspots ? 'btn-info' : 'btn-outline-info'}`}
          onClick={() => setShowHotspots(!showHotspots)}
        >
          <i className="bi bi-geo-alt"></i> Hotspots
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={toggleFullscreen}
        >
          <i className="bi bi-fullscreen"></i>
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={onClose}
        >
          <i className="bi bi-x"></i> Close
        </button>
      </div>
    </div>
  );

  const SceneNavigation = () => (
    <div className="p-3 border-top">
      <h6>Scenes ({tourData.scenes.length})</h6>
      <div className="row">
        {tourData.scenes.map((scene, index) => (
          <div key={scene.id} className="col-md-3 mb-2">
            <button
              className={`btn w-100 ${index === currentScene ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSceneChange(index)}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-camera me-2"></i>
                <div className="text-start">
                  <div className="fw-bold">{scene.name}</div>
                  <small>{scene.measurements ? `${scene.measurements.width}' × ${scene.measurements.length}'` : 'View'}</small>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const TourAnalytics = () => (
    <div className="p-3 border-top">
      <h6>Tour Analytics</h6>
      <div className="row">
        <div className="col-md-3">
          <div className="text-center">
            <h5 className="text-primary">{formatNumber(tourData.analytics.totalViews)}</h5>
            <small className="text-muted">Total Views</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <h5 className="text-info">{tourData.analytics.averageViewTime}</h5>
            <small className="text-muted">Avg. View Time</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <h5 className="text-success">{tourData.analytics.completionRate}%</h5>
            <small className="text-muted">Completion Rate</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <h5 className="text-warning">{tourData.analytics.mostViewedScene}</h5>
            <small className="text-muted">Most Viewed</small>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <h6>Device Usage</h6>
        <div className="row">
          {Object.entries(tourData.analytics.deviceBreakdown).map(([device, percentage]) => (
            <div key={device} className="col-md-3 mb-2">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-capitalize">{device}</small>
                <small>{percentage}%</small>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading virtual tour..." />;
  }

  if (!tourData) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-camera-video display-1 text-muted"></i>
        <h3 className="mt-3">Virtual Tour Not Available</h3>
        <p className="text-muted">No virtual tour data found for this property.</p>
        <button className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-camera-video me-2"></i>
              Virtual Tour - {tourData.propertyLocation}
            </h5>
            <div className="d-flex align-items-center">
              <span className="badge bg-info me-3">
                Scene {currentScene + 1} of {tourData.scenes.length}
              </span>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
          </div>
          
          <div className="modal-body p-0" ref={viewerRef}>
            <TourViewer />
            <TourControls />
            <SceneNavigation />
            <TourAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
