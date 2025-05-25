import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TeamTile from "./components/TeamTile";

const allTeams = {
  AMERICAS: ["100T", "2G", "C9", "EG", "FUR", "G2", "KRU", "LEV", "LOUD", "MIBR", "NRG", "SEN"],
  EMEA: ["APK", "BBL", "FNC", "FUT", "M8", "GX", "KC", "MKOI", "NAVI", "TH", "TL", "VIT"],
  APAC: ["BME", "DFM", "DRX", "GEN", "GE", "NS", "PRX", "RRQ", "T1", "TLN", "TS", "ZETA"]
};

const getTileColor = (region) => ({
    AMERICAS: "#e56126",
    EMEA: "#c0bb05",
    APAC: "#20c5c8"
}[region]);

function App() {
  const [selected, setSelected] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;

    if (!destination || destination.droppableId !== "selected") return;

    const [region, index] = draggableId.split("-");
    const code = allTeams[region][parseInt(index)];

    if (selected.find((t) => t.code === code) || selected.length >= 2) return;

    setSelected([...selected, { code, region }]);
  };

  const handlePredict = async () => {
    if (selected.length !== 2) {
      alert("Select exactly 2 teams.");
      return;
    }

    const [teamA, teamB] = selected.map((t) => t.code);
    const url = `http://127.0.0.1:8000/get_predict?teamA=${teamA}&teamB=${teamB}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
      setPrediction({ error: "Failed to fetch prediction." });
    }
  };

  const handleReset = () => {
    setSelected([]);
    setPrediction(null);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>VCT Matchup Predictor</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(allTeams).map(([region, teams]) => (
          <div key={region} style={{ marginBottom: 30 }}>
            <h2>{region}</h2>
            <Droppable droppableId={`region-${region}`} isDropDisabled={true} direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                  {...provided.droppableProps}
                >
                  {teams.map((team, index) => (
                    <Draggable
                      draggableId={`${region}-${index}`}
                      index={index}
                      key={`${region}-${index}`}
                    >
                      {(provided) => (
                        <TeamTile
                          code={team}
                          region={region}
                          color={getTileColor(region)}
                          provided={provided}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}

        <h2>Selected Teams (Drop Zone)</h2>
        <Droppable droppableId="selected" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: "flex",
                gap: 10,
                minHeight: 70,
                background: "#f0f0f0",
                padding: 10,
                borderRadius: 10
              }}
            >
              {selected.map((team) => (
                <TeamTile
                  key={`${team.region}-${team.code}`}
                  code={team.code}
                  region={team.region}
                  color={getTileColor(team.region)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={handlePredict} style={{ padding: "10px 20px", fontSize: 16 }}>
          Predict
        </button>
        <button onClick={handleReset} style={{ padding: "10px 20px", fontSize: 16 }}>
          Reset
        </button>
      </div>

      {prediction && !prediction.error && (
        <div style={{ marginTop: 20, backgroundColor: "#eee", padding: 20, borderRadius: 10 }}>
          <h3>Prediction Result:</h3>
          <p><strong>{prediction.teamA}</strong>: {Math.round(prediction.probability_teamA * 100)}%</p>
          <p><strong>{prediction.teamB}</strong>: {Math.round(prediction.probability_teamB * 100)}%</p>
          <p>🏆 Predicted Winner: <strong>{prediction.predicted_winner}</strong></p>
        </div>
      )}

      {prediction?.error && (
        <p style={{ color: "red", marginTop: 20 }}>{prediction.error}</p>
      )}
    </div>
  );
}

export default App;
