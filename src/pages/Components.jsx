import React from 'react';

export default function Components() {
  const components = [
    {
      name: 'Teensy 4.1',
      category: 'Microcontroller',
      specs: {
        'Clock': '600 MHz',
        'RAM': '1024 KB',
        'Flash': '8 MB',
        'GPIO': '54 pins',
        'USB': 'Built-in'
      },
      price: '€35-45',
      supplier: 'adafruit.com, cool-components.co.uk'
    },
    {
      name: 'Audio Jack Breakout',
      category: 'Audio I/O',
      specs: {
        'Type': '3.5mm Stereo',
        'Impedance': '32Ω',
        'Frequency': '20Hz - 20kHz',
        'Pins': '3 (L, R, GND)'
      },
      price: '€3-5',
      supplier: 'amazon.fr, ebay.com'
    },
    {
      name: 'Capacitor Kit',
      category: 'Passive Components',
      specs: {
        'Values': '100pF - 100μF',
        'Voltage': '50V',
        'Quantity': '100-500 pcs',
        'Type': 'Mixed (Film + Electrolytic)'
      },
      price: '€8-15',
      supplier: 'aliexpress.com, ebay.com'
    },
    {
      name: 'Resistor Kit',
      category: 'Passive Components',
      specs: {
        'Values': '10Ω - 1MΩ',
        'Power': '1/4W',
        'Tolerance': '5%',
        'Quantity': '600-1000 pcs'
      },
      price: '€5-10',
      supplier: 'aliexpress.com, ebay.com'
    },
    {
      name: 'SGTL5000 Audio Codec',
      category: 'Audio IC',
      specs: {
        'Interface': 'I2C, I2S',
        'Sample Rate': '8-96 kHz',
        'Channels': 'Stereo',
        'Features': 'DAC, ADC, Mixer'
      },
      price: '€15-20',
      supplier: 'adafruit.com, sparkfun.com'
    },
    {
      name: 'Breadboard Bundle',
      category: 'Prototyping',
      specs: {
        'Sizes': '400-830 points',
        'Quantity': '2-5 boards',
        'Color': 'Black/White',
        'Reusable': 'Yes'
      },
      price: '€8-12',
      supplier: 'amazon.fr, ebay.com'
    }
  ];

  return (
    <div>
      <h2 style={{ color: '#00d9ff', marginBottom: '2rem' }}>🔧 Component Shopping List</h2>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>📋 Total Project Cost Estimate</h3>
        <p style={{ fontSize: '1.2rem' }}>
          <span style={{ color: '#00ff00', fontWeight: 'bold' }}>€90 - €150</span>
          <span style={{ color: '#aaa' }}> (for a complete Teensy drum machine setup)</span>
        </p>
      </div>

      <div className="components-container">
        {components.map((comp, idx) => (
          <div key={idx} className="component-card">
            <h3>{comp.name}</h3>
            <p style={{ color: '#00d9ff', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {comp.category}
            </p>

            <div className="component-specs">
              {Object.entries(comp.specs).map(([key, value]) => (
                <p key={key}>
                  <strong style={{ color: '#00d9ff' }}>{key}:</strong> {value}
                </p>
              ))}
            </div>

            <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#00d9ff' }}>Price:</strong>
              <span className="price"> {comp.price}</span>
            </p>

            <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
              <strong style={{ color: '#00d9ff' }}>Where to buy:</strong><br />
              {comp.supplier}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
        border: '2px solid #00d9ff',
        borderRadius: '10px',
        padding: '2rem',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>💡 Tips for Ordering</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>✅ Buy component kits to save money on basic parts</li>
          <li>✅ Use breadboards for prototyping before soldering</li>
          <li>✅ Order from bulk suppliers like AliExpress for long lead times</li>
          <li>✅ Keep spare components for mistakes</li>
          <li>✅ Many components work with multiple projects</li>
          <li>⚠️ Check compatibility before ordering</li>
        </ul>
      </div>
    </div>
  );
}
