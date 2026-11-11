import React, { useState } from "react";
import { logoUrl, regionOf, teamByCode } from "../teams";

// One side of the matchup. Accepts a dropped team code and can be cleared.
const MatchupSlot = ({ label, team, probability, isWinner, onDropTeam, onClear }) => {
  const [over, setOver] = useState(false);
  const region = team ? regionOf(team.region) : null;

  const classes = [
    "slot",
    team ? "is-filled" : "is-empty",
    over ? "is-over" : "",
    isWinner ? "is-winner" : "",
  ].join(" ");

  return (
    <div
      className={classes}
      style={region ? { "--region": region.color } : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const dropped = teamByCode(e.dataTransfer.getData("text/plain"));
        if (dropped) onDropTeam(dropped);
      }}
    >
      {team ? (
        <>
          <button type="button" className="slot__clear" onClick={onClear} aria-label={`Remove ${team.name}`}>
            ×
          </button>
          <img src={logoUrl(team)} alt="" className="slot__logo" />
          <span className="slot__code">{team.code}</span>
          <span className="slot__name">{team.name}</span>
          <span className="slot__region">{region.label}</span>
          {probability != null && (
            <span className="slot__prob">{Math.round(probability * 100)}%</span>
          )}
        </>
      ) : (
        <>
          <span className="slot__placeholder-icon" aria-hidden="true">+</span>
          <span className="slot__placeholder">{label}</span>
          <span className="slot__hint">Pick or drag a team</span>
        </>
      )}
    </div>
  );
};

export default MatchupSlot;
