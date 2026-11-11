import React from "react";
import { logoUrl, regionOf } from "../teams";

// A selectable team card in the picker grid. Click (or Enter/Space) adds it to the
// next free slot; on desktop it can also be dragged onto a slot.
const TeamTile = ({ team, selected, onPick }) => {
  const region = regionOf(team.region);

  return (
    <button
      type="button"
      className={`team-tile${selected ? " is-selected" : ""}`}
      style={{ "--region": region.color }}
      onClick={() => onPick(team)}
      aria-pressed={selected}
      draggable={!selected}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", team.code);
        e.dataTransfer.effectAllowed = "copy";
      }}
      title={team.name}
    >
      <img src={logoUrl(team)} alt="" className="team-tile__logo" loading="lazy" />
      <span className="team-tile__code">{team.code}</span>
      <span className="team-tile__name">{team.name}</span>
    </button>
  );
};

export default TeamTile;
