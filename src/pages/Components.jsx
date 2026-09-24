import React from "react";

export default function Components() {
  const components = [
    {
      name: "Teensy 4.1",
      category: "Microcontrôleur",
      specs: {
        "Fréquence": "600 MHz",
        "RAM": "1024 KB",
        "Flash": "8 MB",
        "GPIO": "54 broches",
        "USB": "Intégré"
      },
      price: "€35-45",
      supplier: "adafruit.com, cool-components.co.uk"
    },
    {
      name: "Breakout Jack Audio",
      category: "Entrée/Sortie audio",
      specs: {
        "Type": "Jack stéréo 3.5mm",
        "Impédance": "32Ω",
        "Fréquence": "20Hz - 20kHz",
        "Broches": "3 (L, R, GND)"
      },
      price: "€3-5",
      supplier: "amazon.fr, ebay.com"
    },
    {
      name: "Kit de condensateurs",
      category: "Composants passifs",
      specs: {
        "Valeurs": "100pF - 100µF",
        "Tension": "50V",
        "Quantité": "100-500 pcs",
        "Type": "Mixte (film + électrolytique)"
      },
      price: "€8-15",
      supplier: "aliexpress.com, ebay.com"
    },
    {
      name: "Kit de résistances",
      category: "Composants passifs",
      specs: {
        "Valeurs": "10Ω - 1MΩ",
        "Puissance": "1/4W",
        "Tolérance": "5%",
        "Quantité": "600-1000 pcs"
      },
      price: "€5-10",
      supplier: "aliexpress.com, ebay.com"
    },
    {
      name: "Codec audio SGTL5000",
      category: "CI audio",
      specs: {
        "Interface": "I2C, I2S",
        "Fréq. échantillonnage": "8-96 kHz",
        "Canaux": "Stéréo",
        "Fonctions": "DAC, ADC, Mixeur"
      },
      price: "€15-20",
      supplier: "adafruit.com, sparkfun.com"
    },
    {
      name: "Lot de breadboards",
      category: "Prototypage",
      specs: {
        "Tailles": "400-830 points",
        "Quantité": "2-5 plaques",
        "Couleur": "Noir/Blanc",
        "Réutilisable": "Oui"
      },
      price: "€8-12",
      supplier: "amazon.fr, ebay.com"
    }
  ];

  return (
    <div>
      <h2 style={{ color: '#00d9ff', marginBottom: '2rem' }}>🔧 Liste d'achat des composants</h2>

      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>📋 Coût total estimé du projet</h3>
        <p style={{ fontSize: '1.2rem' }}>
          <span style={{ color: '#00ff00', fontWeight: 'bold' }}>€90 - €150</span>
          <span style={{ color: '#aaa' }}> (pour un montage complet de boîte à rythme Teensy)</span>
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
                  <strong style={{ color: '#00d9ff' }}>{key} :</strong> {value}
                </p>
              ))}
            </div>

            <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#00d9ff' }}>Prix :</strong>
              <span className="price"> {comp.price}</span>
            </p>

            <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
              <strong style={{ color: '#00d9ff' }}>Où acheter :</strong><br />
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
        <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>💡 Conseils pour la commande</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>✅ Achetez des kits de composants pour économiser sur les pièces de base</li>
          <li>✅ Utilisez des breadboards pour le prototypage avant de souder</li>
          <li>✅ Commandez chez des fournisseurs en gros comme AliExpress si les délais ne sont pas urgents</li>
          <li>✅ Gardez des composants de rechange en cas d'erreur</li>
          <li>✅ Beaucoup de composants sont réutilisables pour plusieurs projets</li>
          <li>⚠️ Vérifiez la compatibilité avant de commander</li>
        </ul>
      </div>
    </div>
  );
}
