import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./App.css";
import Otobus from "./images/otobus.png";
import EshotLogo from "./images/eshot-logo.png"; // Eshot Logo'yu import ettik

function App() {
  const [hatId, setHatId] = useState("");
  const [busLocations, setBusLocations] = useState([]);
  const [error, setError] = useState(null);
  const [yonFilter, setYonFilter] = useState("Tümü");

  const getBusLocations = async () => {
    try {
      const response = await axios.get(
        `https://openapi.izmir.bel.tr/api/iztek/hatotobuskonumlari/${hatId}`
      );
      const data = response.data;

      if (data.HataVarMi) {
        setError("API bir hata döndü.");
        setBusLocations([]);
      } else {
        setBusLocations(data.HatOtobusKonumlari);
        setError(null);
      }
    } catch (err) {
      setError("API çağrısı sırasında bir hata oluştu.");
      setBusLocations([]);
    }
  };

  const handleGetClick = () => {
    if (hatId) {
      getBusLocations();
    } else {
      setError("Lütfen bir hat numarası girin.");
    }
  };

  const handleYonFilterChange = (e) => {
    setYonFilter(e.target.value);
  };

  const busIcon = new L.Icon({
    iconUrl: Otobus,
    iconSize: [45, 45],
    iconAnchor: [12, 41],
  });

  const filteredBusLocations = busLocations.filter((bus) => {
    if (yonFilter === "Tümü") return true;
    return yonFilter === "Gidiş" ? bus.Yon === 1 : bus.Yon === 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (hatId) {
        getBusLocations();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hatId]);

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img src={EshotLogo} alt="Eshot Logo" className="eshot-logo" />
      </div>

      <div style={{ textAlign: "center" }}>
        <input
          type="text"
          value={hatId}
          onChange={(e) => setHatId(e.target.value)}
          placeholder="Hat Numarası (örn: 258)"
          className="input-field"
        />
        <button onClick={handleGetClick} className="get-button">
          Otobüsüm Nerde
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div style={{ textAlign: "center" }}>
        <select
          value={yonFilter}
          onChange={handleYonFilterChange}
          className="filter-select"
        >
          <option value="Tümü">Tümü</option>
          <option value="Gidiş">Gidiş</option>
          <option value="Dönüş">Dönüş</option>
        </select>
      </div>

      <div className="map-container">
        <MapContainer
          center={[38.4192, 27.1287]} // İzmir merkez koordinatları
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredBusLocations.map((bus, index) => (
            <Marker
              key={index}
              position={[
                parseFloat(bus.KoorX.replace(",", ".")),
                parseFloat(bus.KoorY.replace(",", ".")),
              ]}
              icon={busIcon}
            >
              <Popup>
                <div>
                  <p>
                    <strong>Yön:</strong> {bus.Yon === 1 ? "Gidiş" : "Dönüş"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
