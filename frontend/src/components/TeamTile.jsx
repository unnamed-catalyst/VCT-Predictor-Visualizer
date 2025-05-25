import React from "react";

const TeamTile = ({ code, region, color, provided }) => {
  return (
    <div
      ref={provided?.innerRef}
      {...(provided ? provided.draggableProps : {})}
      {...(provided ? provided.dragHandleProps : {})}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 15px",
        backgroundColor: color || "#ccc",
        color: "#fff",
        borderRadius: 8,
        fontWeight: "bold",
        width: "75px",
        ...provided?.draggableProps?.style
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}logos/${region}/${code}.png`}
        alt={code}
        style={{ width: 30, height: 30, objectFit: "contain" }}
      />
      {code}
    </div>
  );
};

export default TeamTile;
